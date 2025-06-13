package server

import (
	"fmt"
	"net/http"
	"real-time-forum/internal/api"
	"real-time-forum/internal/middlewares"
	"real-time-forum/internal/ws"
	"time"
)

var hub = &ws.Hub{
	Clients:    make(map[string]*ws.Client),
	Register:   make(chan *ws.Client),
	Unregister: make(chan *ws.Client),
	Broadcast:  make(chan ws.Message),
}

func InitServer() {
	// Create the HTTP server
	server := NewServer(":8080", 10*time.Second, 10*time.Second, 30*time.Second, 10*time.Second, 1<<20)

	// static
	server.Handle("/", middlewares.StaticMiddleware(http.FileServer(http.Dir("static"))))

	// all api handlers
	server.Handle("/api/signup", api.SignUp)
	server.Handle("/api/signin", api.SignIn)
	server.Handle("/api/session", api.Session)
	server.Handle("/api/create-post", api.CreatePost)
	server.Handle("/api/create-comment", api.CreateComment)
	server.Handle("/api/posts", api.Posts)
	server.Handle("/api/comments", api.Comments)
	server.Handle("/api/users", api.Users)
	server.Handle("/ws", ws.WebSocketHandler(hub))

	// middlewares
	server.Use(middlewares.ApiMiddleware)

	go hub.Run()
	if err := server.Start(); err != nil {
		fmt.Printf("Error starting server: %v\n", err)
	}
}
