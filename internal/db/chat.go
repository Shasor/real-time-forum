package db

import (
	"net/http"
	"real-time-forum/internal/models"
	"sort"

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

func SortUsersByLastMessage(userUUID string, others []models.User) ([]models.User, error) {
	db := GetDB()
	defer db.Close()

	type convTime struct {
		u    models.User
		time int64
	}

	var convs []convTime
	for _, u := range others {
		var last int64
		row := db.QueryRow(`
			SELECT last_message FROM conversations
			WHERE (user1 = ? AND user2 = ?)
			   OR (user1 = ? AND user2 = ?)
		`, userUUID, u.UUID, u.UUID, userUUID)

		err := row.Scan(&last)
		if err != nil {
			last = 0
		}

		convs = append(convs, convTime{u: u, time: last})
	}

	sort.Slice(convs, func(i, j int) bool {
		return convs[i].time > convs[j].time
	})

	sorted := make([]models.User, len(convs))
	for i, c := range convs {
		sorted[i] = c.u
	}

	return sorted, nil
}

// Gère la création ou la mise à jour d'une conversation
func HandleConversation(fromUUID, toUUID string, timestamp int64) error {
	exists, err := ConversationExists(fromUUID, toUUID)
	if err != nil {
		return err
	}
	if exists {
		return UpdateLastMessageTime(fromUUID, toUUID, timestamp)
	}
	return CreateConversation(fromUUID, toUUID, timestamp)
}

// return if a conversation exist between 2 users
func ConversationExists(user1, user2 string) (bool, error) {
	db := GetDB()
	defer db.Close()

	query := `
		SELECT COUNT(*) 
		FROM conversations 
		WHERE user1 = ? AND user2 = ?
		OR user1 = ? AND user2 = ?
	`

	var count int
	err := db.QueryRow(query, user1, user2, user2, user1).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func CreateConversation(user1, user2 string, timestamp int64) error {
	db := GetDB()
	defer db.Close()

	query := `
		INSERT INTO conversations (user1, user2, last_message)
		VALUES (?, ?, ?)
	`

	_, err := db.Exec(query, user1, user2, timestamp)
	return err
}

func UpdateLastMessageTime(user1, user2 string, timestamp int64) error {
	db := GetDB()
	defer db.Close()

	query := `
		UPDATE conversations 
		SET last_message = ?
		WHERE user1 = ? AND user2 = ?
		OR user1 = ? AND user2 = ?
	`

	_, err := db.Exec(query, timestamp, user1, user2, user2, user1)
	return err
}

func GetMessages(from, to string, offset, limit int) ([]models.Message, error) {
	db := GetDB()
	defer db.Close()

	query := `
  		SELECT uuid, "from", "to", content, time
  		FROM messages
  		WHERE ("from" = ? AND "to" = ?) OR ("from" = ? AND "to" = ?)
  		ORDER BY time DESC
  		LIMIT ? OFFSET ?
	`

	rows, err := db.Query(query, from, to, to, from, limit, offset)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	messages := []models.Message{}
	for rows.Next() {
		var m models.Message
		err := rows.Scan(&m.UUID, &m.From, &m.To, &m.Content, &m.Time)
		if err != nil {
			return nil, err
		}
		messages = append(messages, m)
	}
	return messages, nil
}
