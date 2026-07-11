package models

import "time"

type Review struct {
	Rating    int       `json:"rating" bson:"rating"`       // 1 to 5
	Comment   string    `json:"comment" bson:"comment"`
	Username  string    `json:"username" bson:"username"`
	Timestamp time.Time `json:"timestamp" bson:"timestamp"`
}
