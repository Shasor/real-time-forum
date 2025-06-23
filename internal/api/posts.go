package api

import (
	"net/http"
	"real-time-forum/internal/db"
	"real-time-forum/internal/models"
	"real-time-forum/internal/utils"
	"strconv"
)

func Posts(w http.ResponseWriter, r *http.Request) {
	resp := models.Response{Code: http.StatusOK}
	offsetStr := r.URL.Query().Get("offset")
	limitStr := r.URL.Query().Get("limit")
	category := r.URL.Query().Get("category")

	offset, err := strconv.Atoi(offsetStr)
	if err != nil {
		offset = 0
	}
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 10
	}

	posts, err := db.GetPosts(category, offset, limit)
	if err != nil {
		resp.Code = http.StatusNotFound
		resp.Msg = err.Error()
		utils.SendResponse(w, resp)
		return
	}

	resp.Msg = "OK!"
	resp.Data = posts
	utils.SendResponse(w, resp)
}
