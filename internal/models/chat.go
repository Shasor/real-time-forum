package models

type Message struct {
	UUID    string `json:"uuid"`
	From    string `json:"from"`
	To      string `json:"to"`
	Content string `json:"content"`
	Time    int64  `json:"time"`
}
