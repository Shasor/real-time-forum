package api

import (
	"encoding/json"
	"net/http"
	"real-time-forum/internal/db"
	"real-time-forum/internal/models"
	"real-time-forum/internal/utils"
)

func CreatePost(w http.ResponseWriter, r *http.Request) {
	var input struct {
		User     models.User `json:"user"`
		Content  string      `json:"content"`
		Category string      `json:"category"`
	}
	resp := models.Response{Code: http.StatusOK}

	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		resp.Code = http.StatusBadRequest
		resp.Msg = err.Error()
		utils.SendResponse(w, resp)
		return
	}

	if !input.User.IsConnected {
		resp.Code = http.StatusForbidden
		resp.Msg = "The user must be logged in!"
		utils.SendResponse(w, resp)
		return
	}

	if input.Content == "" || input.Category == "" {
		resp.Code = http.StatusBadRequest
		resp.Msg = "All fields are required!"
		utils.SendResponse(w, resp)
		return
	}

	code, err := db.CreatePost(input.User.UUID, "", input.Content, input.Category)
	if err != nil {
		resp.Code = code
		resp.Msg = err.Error()
		utils.SendResponse(w, resp)
		return
	}

	resp.Msg = "Post sent!"
	utils.SendResponse(w, resp)
}
