package ws

import (
	"log"
	"net/http"
	"real-time-forum/internal/db"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		origin := r.Header.Get("Origin")
		allowed := map[string]bool{
			"http://localhost:8080":   true,
			"http://172.20.10.2:8080": true,
		}
		return allowed[origin]
	},
}

func WebSocketHandler(hub *Hub) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println(err)
			return
		}

		_, msg, err := conn.ReadMessage()
		if err != nil {
			conn.Close()
			return
		}

		sessionID := string(msg)
		user, err := db.SelectUserBySessionUUID(sessionID)
		if err != nil && user == nil {
			conn.WriteMessage(websocket.TextMessage, []byte("WS: user session invalide"))
			conn.Close()
			return
		}

		client := &Client{
			Conn:     conn,
			Send:     make(chan Message),
			UserUUID: user.UUID,
		}

		hub.Register <- client

		go client.Read(hub)
		go client.Write(hub)
	}
}
