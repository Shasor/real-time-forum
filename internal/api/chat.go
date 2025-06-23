package api

import (
	"net/http"
	"real-time-forum/internal/db"
	"real-time-forum/internal/models"
	"real-time-forum/internal/utils"
	"strconv"
)

func Chat(w http.ResponseWriter, r *http.Request) {
	resp := models.Response{Code: http.StatusOK}
	from := r.URL.Query().Get("from")
	to := r.URL.Query().Get("to")
	offsetStr := r.URL.Query().Get("offset")
	limitStr := r.URL.Query().Get("limit")

	if from == "" || to == "" {
		resp.Code = http.StatusBadRequest
		resp.Msg = "Missing 'from' or 'to' parameter"
		utils.SendResponse(w, resp)
		return
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil {
		offset = 0
	}
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 10
	}

	messages, err := db.GetMessages(from, to, offset, limit)
	if err != nil {
		resp.Code = http.StatusInternalServerError
		resp.Msg = "Failed to fetch messages"
		utils.SendResponse(w, resp)
		return
	}

	resp.Data = messages
	utils.SendResponse(w, resp)
}
