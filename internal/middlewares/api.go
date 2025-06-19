package middlewares

import (
	"encoding/json"
	"net/http"
	"real-time-forum/internal/models"
)

func ApiMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost || r.Method == http.MethodPut {
			if r.Header.Get("Content-Type") != "application/json" {
				resp := models.Response{Code: http.StatusUnsupportedMediaType, Msg: "Content-Type must be application/json"}
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusUnsupportedMediaType)
				json.NewEncoder(w).Encode(resp)
				return
			}
		}
		next.ServeHTTP(w, r)
	})
}
