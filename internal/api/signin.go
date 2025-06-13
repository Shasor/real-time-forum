package api

import (
	"encoding/json"
	"net/http"
	"real-time-forum/internal/db"
	"real-time-forum/internal/models"
	"real-time-forum/internal/utils"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

func SignIn(w http.ResponseWriter, r *http.Request) {
	var input models.User
	resp := models.Response{Code: http.StatusOK, Data: make(map[string]any)}

	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		resp.Code = http.StatusBadRequest
		resp.Msg = err.Error()
		utils.SendResponse(w, resp)
		return
	}

	if input.Login == "" || input.Password == "" {
		resp.Code = http.StatusBadRequest
		resp.Msg = "All fields are required!"
		utils.SendResponse(w, resp)
		return
	}

	user, err := db.SelectUserByLogin(input.Login)
	if user == nil || err != nil {
		resp.Code = http.StatusNotFound
		resp.Msg = err.Error()
		utils.SendResponse(w, resp)
		return
	}

	if bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)) != nil {
		resp.Code = http.StatusUnauthorized
		resp.Msg = "Wrong Password"
		utils.SendResponse(w, resp)
		return
	}

	sessionUUID := uuid.New().String()

	db.ClearSession(user.UUID)
	code, err := db.CreateSession(sessionUUID, user.UUID)
	if err != nil {
		resp.Code = code
		resp.Msg = err.Error()
		utils.SendResponse(w, resp)
		return
	}

	resp.Msg = "User Logged In!"
	resp.Data = map[string]string{"session_uuid": sessionUUID}

	utils.SendResponse(w, resp)
}
