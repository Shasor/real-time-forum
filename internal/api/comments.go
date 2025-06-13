package api

import (
	"net/http"
	"real-time-forum/internal/db"
	"real-time-forum/internal/models"
	"real-time-forum/internal/utils"
)

func Comments(w http.ResponseWriter, r *http.Request) {
	resp := models.Response{Code: http.StatusOK, Data: make(map[string]any)}

	postUUID := r.URL.Query().Get("post")
	if postUUID == "" {
		resp.Code = http.StatusBadRequest
		resp.Msg = "missing post uuid"
		utils.SendResponse(w, resp)
		return
	}

	comments, err := db.GetComments(postUUID)
	if err != nil {
		resp.Code = http.StatusNotFound
		resp.Msg = err.Error()
		utils.SendResponse(w, resp)
		return
	}

	resp.Msg = "OK!"
	resp.Data = map[string]any{"comments": comments}
	utils.SendResponse(w, resp)
}
