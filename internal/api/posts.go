package api

import (
	"net/http"
	"real-time-forum/internal/db"
	"real-time-forum/internal/models"
	"real-time-forum/internal/utils"
)

func Posts(w http.ResponseWriter, r *http.Request) {
	resp := models.Response{Code: http.StatusOK, Data: make(map[string]any)}

	category := r.URL.Query().Get("category")

	posts, err := db.GetPosts(category)
	if err != nil {
		resp.Code = http.StatusNotFound
		resp.Msg = err.Error()
		utils.SendResponse(w, resp)
		return
	}

	resp.Msg = "OK!"
	resp.Data = map[string]any{"posts": posts}
	utils.SendResponse(w, resp)
}
