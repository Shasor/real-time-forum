package api

import (
	"encoding/json"
	"net/http"
	"real-time-forum/internal/db"
	"strconv"
)

func Chat(w http.ResponseWriter, r *http.Request) {
	from := r.URL.Query().Get("from")
	to := r.URL.Query().Get("to")
	offsetStr := r.URL.Query().Get("offset")
	limitStr := r.URL.Query().Get("limit")

	if from == "" || to == "" {
		http.Error(w, "Missing 'from' or 'to' parameter", http.StatusBadRequest)
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
		http.Error(w, "Failed to fetch messages", http.StatusInternalServerError)
		return
	}

	res := map[string]any{
		"messages": messages,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}
