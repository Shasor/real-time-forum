package db

import (
	"net/http"

	"github.com/google/uuid"
)

func CreateMsg(from, to, content string, time int64) (int, error) {
	db := GetDB()
	defer db.Close()

	tx, err := db.Begin()
	if err != nil {
		return http.StatusInternalServerError, err
	}

	stmt, err := tx.Prepare("INSERT INTO messages(uuid, 'from', 'to', content, time) VALUES(?, ?, ?, ?, ?)")
	if err != nil {
		return http.StatusInternalServerError, err
	}
	defer stmt.Close()

	uuid := uuid.New().String()
	_, err = stmt.Exec(uuid, from, to, content, time)
	if err != nil {
		tx.Rollback()
		return http.StatusInternalServerError, err
	}

	err = tx.Commit()
	if err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil
}
