package db

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"real-time-forum/internal/models"

	"github.com/mattn/go-sqlite3"
)

func CreateUser(uuid, nickname, age, gender, firstName, lastName, email, password string) (int, error) {
	db := GetDB()
	defer db.Close()

	tx, err := db.Begin()
	if err != nil {
		return http.StatusInternalServerError, err
	}

	stmt, err := tx.Prepare("INSERT INTO users(uuid, nickname, age, gender, firstName, lastName, email, password) VALUES(?, ?, ?, ?, ?, ?, ?, ?)")
	if err != nil {
		return http.StatusInternalServerError, err
	}
	defer stmt.Close()

	_, err = stmt.Exec(uuid, nickname, age, gender, firstName, lastName, email, password)
	if err != nil {
		tx.Rollback()
		if sqliteErr, ok := err.(sqlite3.Error); ok && sqliteErr.ExtendedCode == sqlite3.ErrConstraintUnique {
			return http.StatusConflict, fmt.Errorf("%v", "The email address or nickname already exists!")
		}
		return http.StatusInternalServerError, err
	}

	err = tx.Commit()
	if err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil
}

func SelectUserByUUID(uuid string) (*models.User, error) {
	db := GetDB()
	defer db.Close()

	user := &models.User{}
	err := db.QueryRow(`
	SELECT u.uuid, u.nickname, u.age, u.gender, u.firstName, u.lastName, u.email, u.password
	FROM users u
	WHERE u.uuid = ?`,
		uuid).Scan(&user.UUID, &user.Nickname, &user.Age, &user.Gender, &user.FirstName, &user.LastName, &user.Email, &user.Password)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("%v", "User not Found!")
		}
		return nil, err
	}

	return user, nil
}

func SelectUserByNickname(nickname string) (*models.User, error) {
	db := GetDB()
	defer db.Close()

	user := &models.User{}
	err := db.QueryRow(`
	SELECT u.uuid, u.nickname, u.age, u.gender, u.firstName, u.lastName, u.email, u.password
	FROM users u
	WHERE u.nickname = ?`,
		nickname).Scan(&user.UUID, &user.Nickname, &user.Age, &user.Gender, &user.FirstName, &user.LastName, &user.Email, &user.Password)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("%v", "User not Found!")
		}
		return nil, err
	}

	return user, nil
}

func SelectUserByEmail(email string) (*models.User, error) {
	db := GetDB()
	defer db.Close()

	user := &models.User{}
	err := db.QueryRow(`
	SELECT u.uuid, u.nickname, u.age, u.gender, u.firstName, u.lastName, u.email, u.password
	FROM users u
	WHERE u.email = ?`,
		email).Scan(&user.UUID, &user.Nickname, &user.Age, &user.Gender, &user.FirstName, &user.LastName, &user.Email, &user.Password)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("%v", "User not Found!")
		}
		return nil, err
	}

	return user, nil
}

func SelectUserByLogin(login string) (*models.User, error) {
	user, err := SelectUserByEmail(login)
	if err != nil {
		user, err = SelectUserByNickname(login)
	}
	if err != nil {
		return nil, err
	}
	return user, nil
}

func SelectUserBySessionUUID(session_uuid string) (*models.User, error) {
	db := GetDB()
	defer db.Close()

	user := &models.User{}
	err := db.QueryRow(`
	SELECT u.uuid, u.nickname, u.age, u.gender, u.firstName, u.lastName, u.email
	FROM users u
	JOIN sessions s ON u.uuid = s.user
	WHERE s.uuid = ?`,
		session_uuid).Scan(&user.UUID, &user.Nickname, &user.Age, &user.Gender, &user.FirstName, &user.LastName, &user.Email)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("%v", "The user has no session!")
		}
		return nil, err
	}

	return user, nil
}

func GetUsers() ([]models.User, error) {
	db := GetDB()
	defer db.Close()

	query := `
	SELECT u.uuid, u.nickname, u.age, u.gender, u.firstName, u.lastName, u.email
	FROM users u;`

	rows, err := db.Query(query)
	if err != nil {
		log.Printf("Error executing query: %v", err)
		return nil, err
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var user models.User
		err := rows.Scan(&user.UUID, &user.Nickname, &user.Age, &user.Gender, &user.FirstName, &user.LastName, &user.Email)
		if err != nil {
			log.Printf("Error scanning row: %v", err)
			continue
		}
		users = append(users, user)
	}
	if err = rows.Err(); err != nil {
		log.Printf("Error during row iteration: %v", err)
	}
	return users, nil
}
