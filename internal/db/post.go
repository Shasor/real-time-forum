package db

func CreatePost(senderID, parentID, categoryID int, content, date string) error {
	// Open the database connection
	db := GetDB()
	defer db.Close()

	// Start a database transaction
	tx, err := db.Begin()
	if err != nil {
		return err
	}

	// Prepare the SQL statement for inserting a post (including parent_id)
	stmt, err := tx.Prepare("INSERT INTO posts (sender, parent, category, content, date) VALUES(?, ?, ?, ?, ?)")
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(senderID, parentID, categoryID, content, date)

	if err != nil {
		tx.Rollback()
		return err
	}

	// Commit the transaction
	err = tx.Commit()
	if err != nil {
		return err
	}

	// to do (maybe?)

	return nil
}
