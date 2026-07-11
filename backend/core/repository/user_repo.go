package repository

import (
	"context"
	"errors"
	"go-analytics-backend/core/config"
	"go-analytics-backend/core/models"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"golang.org/x/crypto/bcrypt"
)

// RegisterUser registers a new user
func RegisterUser(user models.User) error {
	collection := config.DB.Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Check if user already exists
	var existingUser models.User
	err := collection.FindOne(ctx, bson.M{"username": user.Username}).Decode(&existingUser)
	if err == nil {
		return errors.New("username already exists")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	user.Password = string(hashedPassword)

	_, err = collection.InsertOne(ctx, user)
	return err
}

// GetUserByUsername retrieves a user by their username
func GetUserByUsername(username string) (models.User, error) {
	collection := config.DB.Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var user models.User
	err := collection.FindOne(ctx, bson.M{"username": username}).Decode(&user)
	if err != nil {
		return models.User{}, err
	}

	return user, nil
}

// SeedAdminUser seeds a default admin user if one doesn't exist
func SeedAdminUser() error {
	if config.DB == nil {
		return errors.New("database not initialized")
	}
	collection := config.DB.Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var existingUser models.User
	err := collection.FindOne(ctx, bson.M{"username": "admin"}).Decode(&existingUser)
	if err == nil {
		// Admin already exists
		return nil
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	admin := models.User{
		Name:     "System Admin",
		Username: "admin",
		Password: string(hashedPassword),
		Role:     "admin",
	}

	_, err = collection.InsertOne(ctx, admin)
	return err
}

