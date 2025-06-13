package db

import (
	"database/sql"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

func GetDB() *sql.DB {
	db, err := sql.Open("sqlite3", "internal/db/database.db")
	if err != nil {
		log.Fatal(err)
	}

	// SQL statement to create the users table
	tables := `CREATE TABLE IF NOT EXISTS users (
			uuid TEXT PRIMARY KEY,
			nickname TEXT UNIQUE NOT NULL,
			age TEXT NOT NULL,
			gender TEXT NOT NULL,
			firstName TEXT NOT NULL,
			lastName TEXT NOT NULL,
			email TEXT UNIQUE NOT NULL,
			password TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		); CREATE TABLE IF NOT EXISTS sessions (
			uuid TEXT PRIMARY KEY,
			user TEXT UNIQUE NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY(user) REFERENCES users(uuid)
		); CREATE TABLE IF NOT EXISTS posts (
			uuid TEXT PRIMARY KEY,
			user TEXT NOT NULL,
			parent TEXT,
			content TEXT NOT NULL,
			category TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY(user) REFERENCES users(uuid),
			FOREIGN KEY(parent) REFERENCES posts(uuid)
		); CREATE TABLE IF NOT EXISTS messages (
			uuid TEXT PRIMARY KEY,
			"from" TEXT NOT NULL,
			"to" TEXT NOT NULL,
			content TEXT,
			time INTEGER NOT NULL,
			FOREIGN KEY("from") REFERENCES users(uuid),
			FOREIGN KEY("to") REFERENCES users(uuid)
		); CREATE TABLE IF NOT EXISTS conversations (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user1 TEXT NOT NULL,
			user2 TEXT NOT NULL,
			last_message TEXT NOT NULL,
			FOREIGN KEY(user1) REFERENCES users(uuid),
			FOREIGN KEY(user2) REFERENCES users(uuid),
			FOREIGN KEY(last_message) REFERENCES messages(uuid)
		)`

	// Start a transaction
	tx, err := db.Begin()
	if err != nil {
		log.Fatal(err)
	}

	// Execute the SQL statements within the transaction
	_, err = tx.Exec(tables)
	if err != nil {
		// If there's an error, roll back the transaction
		tx.Rollback()
		log.Fatal(err)
	}

	// If everything is okay, commit the transaction
	err = tx.Commit()
	if err != nil {
		log.Fatal(err)
	}

	return db
}
