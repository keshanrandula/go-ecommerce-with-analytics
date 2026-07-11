package repository

import (
	"context"
	"go-analytics-backend/internal/config"
	"go-analytics-backend/internal/models"
	"time"
)

// InsertInquiry inserts a contact form inquiry into MongoDB
func InsertInquiry(inquiry models.Inquiry) error {
	collection := config.DB.Collection("inquiries")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := collection.InsertOne(ctx, inquiry)
	return err
}
