package models

type Post struct {
	UUID     string  `json:"uuid"`
	User     User    `json:"user"`
	Parent   *string `json:"parent"`
	Content  string  `json:"content"`
	Category string  `json:"category"`
	Date     string  `json:"date"`
}
