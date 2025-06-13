package db

import (
	"database/sql"
	"log"
	"net/http"
	"real-time-forum/internal/models"

	"github.com/google/uuid"
)

func CreatePost(userUUID, parentUUID, content, category string) (int, error) {
	db := GetDB()
	defer db.Close()

	tx, err := db.Begin()
	if err != nil {
		return http.StatusInternalServerError, err
	}

	stmt, err := tx.Prepare("INSERT INTO posts(uuid, user, parent, content,category) VALUES(?, ?, ?, ?, ?)")
	if err != nil {
		return http.StatusInternalServerError, err
	}
	defer stmt.Close()

	uuid := uuid.New().String()
	parent := sql.NullString{
		String: parentUUID,
		Valid:  parentUUID != "",
	}
	_, err = stmt.Exec(uuid, userUUID, parent, content, category)
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

func GetPosts(category string) ([]models.Post, error) {
	db := GetDB()
	defer db.Close()

	query := `
        SELECT p.*, u.nickname, u.age, u.gender, u.firstName, u.lastName, u.email
       FROM posts p
       JOIN users u ON p.user = u.uuid
       WHERE p.parent IS NULL`

	var rows *sql.Rows
	var err error

	if category != "" {
		query += ` AND p.category = ?`
	}

	query += ` ORDER BY p.created_at DESC;`

	if category != "" {
		rows, err = db.Query(query, category)
	} else {
		rows, err = db.Query(query)
	}

	if err != nil {
		log.Printf("Error executing query: %v", err)
		return nil, err
	}
	defer rows.Close()

	var posts []models.Post
	for rows.Next() {
		var post models.Post
		var parent sql.NullString
		err := rows.Scan(&post.UUID, &post.User.UUID, &parent, &post.Content, &post.Category, &post.Date, &post.User.Nickname, &post.User.Age, &post.User.Gender, &post.User.FirstName, &post.User.LastName, &post.User.Email)
		if err != nil {
			log.Printf("Error scanning row: %v", err)
			continue
		}
		if parent.Valid {
			post.Parent = &parent.String
		} else {
			post.Parent = nil
		}
		posts = append(posts, post)
	}
	if err = rows.Err(); err != nil {
		log.Printf("Error during row iteration: %v", err)
	}
	return posts, nil
}

func GetPostByUUID(uuid string) (*models.Post, error) {
	db := GetDB()
	defer db.Close()

	query := `
        SELECT p.*, u.nickname, u.age, u.gender, u.firstName, u.lastName, u.email
        FROM posts p
        JOIN users u ON p.user = u.uuid
        WHERE p.uuid = ?;`

	row := db.QueryRow(query, uuid)

	var post models.Post
	var parent sql.NullString
	err := row.Scan(&post.UUID, &post.User.UUID, &parent, &post.Content, &post.Category, &post.Date,
		&post.User.Nickname, &post.User.Age, &post.User.Gender, &post.User.FirstName, &post.User.LastName, &post.User.Email)
	if err != nil {
		return nil, err
	}
	if parent.Valid {
		post.Parent = &parent.String
	}
	return &post, nil
}

func GetComments(parentUUID string) ([]models.Post, error) {
	db := GetDB()
	defer db.Close()

	query := `
        SELECT p.*, u.nickname, u.age, u.gender, u.firstName, u.lastName, u.email
        FROM posts p
        JOIN users u ON p.user = u.uuid
        WHERE p.parent = ?
        ORDER BY p.created_at ASC;`

	rows, err := db.Query(query, parentUUID)
	if err != nil {
		log.Printf("Error executing query: %v", err)
		return nil, err
	}
	defer rows.Close()

	var comments []models.Post
	for rows.Next() {
		var com models.Post
		var parent sql.NullString
		err := rows.Scan(&com.UUID, &com.User.UUID, &parent, &com.Content, &com.Category, &com.Date,
			&com.User.Nickname, &com.User.Age, &com.User.Gender, &com.User.FirstName, &com.User.LastName, &com.User.Email)
		if err != nil {
			log.Printf("Error scanning row: %v", err)
			continue
		}
		if parent.Valid {
			com.Parent = &parent.String
		}
		comments = append(comments, com)
	}
	if err = rows.Err(); err != nil {
		log.Printf("Error during row iteration: %v", err)
	}
	return comments, nil
}
