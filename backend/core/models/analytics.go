package models

import "time"

type EventMetric struct {
	ID        string    `json:"id,omitempty" bson:"_id,omitempty"`
	UserID    string    `json:"user_id" bson:"user_id"`
	EventType string    `json:"event_type" bson:"event_type"` // click, view, purchase
	ProductID string    `json:"product_id" bson:"product_id"`
	Price     float64   `json:"price" bson:"price"`
	Timestamp time.Time `json:"timestamp" bson:"timestamp"`
	Status    string    `json:"status,omitempty" bson:"status,omitempty"`
}
