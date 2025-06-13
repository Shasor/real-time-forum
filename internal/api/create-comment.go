package api

import (
	"encoding/json"
	"net/http"
	"real-time-forum/internal/db"
	"real-time-forum/internal/models"
	"real-time-forum/internal/utils"
)

func CreateComment(w http.ResponseWriter, r *http.Request) {
	var input struct {
		User     models.User `json:"user"`
		Content  string      `json:"content"`
		PostUUID string      `json:"post_uuid"`
	}
	resp := models.Response{Code: http.StatusOK}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
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

	if input.Content == "" || input.PostUUID == "" {
		resp.Code = http.StatusBadRequest
		resp.Msg = "All fields are required!"
		utils.SendResponse(w, resp)
		return
	}

	parent, err := db.GetPostByUUID(input.PostUUID)
	if err != nil || parent == nil {
		resp.Code = http.StatusNotFound
		resp.Msg = "Parent post not found"
		utils.SendResponse(w, resp)
		return
	}

	code, err := db.CreatePost(input.User.UUID, input.PostUUID, input.Content, parent.Category)
	if err != nil {
		resp.Code = code
		resp.Msg = err.Error()
		utils.SendResponse(w, resp)
		return
	}

	resp.Msg = "Comment sent!"
	utils.SendResponse(w, resp)
}
