package ws

import (
	"encoding/json"
	"net/http"
	"real-time-forum/internal/db"
	"real-time-forum/internal/models"
	"sort"
	"strings"

	"github.com/gorilla/websocket"
)

type Message struct {
	Type    string `json:"type"`
	From    string `json:"from"`
	To      string `json:"to"`
	Content string `json:"content"`
	Time    int64  `json:"time"`
}

type Client struct {
	Conn     *websocket.Conn
	Send     chan Message
	UserUUID string
	Nickname string
}

func (c *Client) Read(hub *Hub) {
	defer func() {
		hub.Unregister <- c
		c.Conn.Close()
	}()

	for {
		var msg Message
		err := c.Conn.ReadJSON(&msg)
		if err != nil {
			break
		}

		msg.Type, msg.From = "msg", c.UserUUID

		err = db.HandleConversation(msg.From, msg.To, msg.Time)
		if err != nil {
			continue
		}

		code, err := db.CreateMsg(msg.From, msg.To, msg.Content, msg.Time)
		if err != nil || code != http.StatusOK {
			continue
		}

		notif := Message{
			Type: "notif",
			From: "system",
			To:   msg.To,
		}

		hub.Broadcast <- msg
		hub.Broadcast <- notif
	}
}

func (c *Client) Write(hub *Hub) {
	defer func() {
		c.Conn.Close()
	}()

	for {
		msg, ok := <-c.Send
		if !ok {
			return
		}

		err := c.Conn.WriteJSON(msg)
		if err != nil {
			return
		}
	}
}

func (h *Hub) sendUserListTo(c *Client) {
	others := make([]models.User, 0)
	for _, client := range h.Clients {
		if client.UserUUID == c.UserUUID {
			continue
		}
		others = append(others, models.User{
			UUID:     client.UserUUID,
			Nickname: client.Nickname,
		})
		sort.Slice(others, func(i, j int) bool {
			return strings.ToLower(others[i].Nickname) < strings.ToLower(others[j].Nickname)
		})
	}

	sorted, err := db.SortUsersByLastMessage(c.UserUUID, others)
	if err != nil {
		return
	}

	data, err := json.Marshal(sorted)
	if err != nil {
		return
	}

	msg := Message{
		Type:    "user_list",
		From:    "system",
		To:      c.UserUUID,
		Content: string(data),
		Time:    0,
	}

	c.Send <- msg
}

type Hub struct {
	Clients    map[string]*Client
	Register   chan *Client
	Unregister chan *Client
	Broadcast  chan Message
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.Clients[client.UserUUID] = client
			for _, c := range h.Clients {
				h.sendUserListTo(c)
			}
		case client := <-h.Unregister:
			delete(h.Clients, client.UserUUID)
			close(client.Send)
			for _, c := range h.Clients {
				h.sendUserListTo(c)
			}
		case msg := <-h.Broadcast:
			if dest, ok := h.Clients[msg.To]; ok {
				dest.Send <- msg
			}
			for _, c := range h.Clients {
				if c.UserUUID == msg.From || c.UserUUID == msg.To {
					h.sendUserListTo(c)
				}
			}
		}
	}
}
