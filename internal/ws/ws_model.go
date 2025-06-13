package ws

import (
	"net/http"
	"real-time-forum/internal/db"

	"github.com/gorilla/websocket"
)

type Message struct {
	From    string `json:"from"`
	To      string `json:"to"`
	Content string `json:"content"`
	Time    int64  `json:"time"`
}

type Client struct {
	Conn     *websocket.Conn
	Send     chan Message
	UserUUID string
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

		// Set l'expéditeur du message
		msg.From = c.UserUUID

		// 1. Insertion en base
		code, err := db.CreateMsg(msg.From, msg.To, msg.Content, msg.Time)
		if err != nil || code != http.StatusOK {
			// Log ou gérer l'erreur, ne pas broadcast si insertion fail
			continue
		}
		hub.Broadcast <- msg
	}
}

func (c *Client) Write(hub *Hub) {
	defer func() {
		c.Conn.Close()
	}()

	for {
		msg, ok := <-c.Send
		if !ok {
			// Si le canal est fermé, on ferme la connexion WebSocket
			return
		}

		err := c.Conn.WriteJSON(msg)
		if err != nil {
			return
		}
	}
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
		case client := <-h.Unregister:
			delete(h.Clients, client.UserUUID)
			close(client.Send)
		case msg := <-h.Broadcast:
			if dest, ok := h.Clients[msg.To]; ok {
				dest.Send <- msg
			}
		}
	}
}
