package models

type User struct {
	UUID        string `json:"uuid"`
	Nickname    string `json:"nickname"`
	Age         string `json:"age"`
	Gender      string `json:"gender"`
	FirstName   string `json:"firstName"`
	LastName    string `json:"lastName"`
	Email       string `json:"email"`
	Password    string `json:"password"`
	Login       string `json:"login"`
	IsConnected bool   `json:"isConnected"`
}
