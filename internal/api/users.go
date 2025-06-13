package api

import (
	"encoding/json"
	"io"
	"net/http"
	"real-time-forum/internal/db"
	"real-time-forum/internal/models"
	"real-time-forum/internal/utils"
)

func Users(w http.ResponseWriter, r *http.Request) {
	var input struct {
		UUID string `json:"uuid"`
	}
	resp := models.Response{Code: http.StatusOK}

	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil && err != io.EOF {
		resp.Code = http.StatusBadRequest
		resp.Msg = err.Error()
		utils.SendResponse(w, resp)
		return
	}

	if input.UUID == "" {
		users, err := db.GetUsers()
		if err != nil {
			resp.Code = http.StatusInternalServerError
			resp.Msg = err.Error()
			utils.SendResponse(w, resp)
			return
		}
		resp.Data = map[string]any{"users": users}
	} else {
		user, err := db.SelectUserByUUID(input.UUID)
		if err != nil {
			resp.Code = http.StatusInternalServerError
			resp.Msg = err.Error()
			utils.SendResponse(w, resp)
			return
		}
		resp.Data = map[string]any{"user": user}
	}

	resp.Msg = "OK!"
	utils.SendResponse(w, resp)
}
