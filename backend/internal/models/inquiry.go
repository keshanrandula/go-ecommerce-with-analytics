package models

import "time"

type Inquiry struct {
	ID          string    `json:"id,omitempty" bson:"_id,omitempty"`
	Name        string    `json:"name" bson:"name" binding:"required"`
	Email       string    `json:"email" bson:"email" binding:"required,email"`
	ProjectType string    `json:"project_type" bson:"project_type" binding:"required"`
	Message     string    `json:"message" bson:"message" binding:"required"`
	Timestamp   time.Time `json:"timestamp" bson:"timestamp"`
}
