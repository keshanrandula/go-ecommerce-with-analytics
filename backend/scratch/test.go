package main

import (
	"context"
	"fmt"
	"go-analytics-backend/core/config"
	"go-analytics-backend/core/models"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
)

func main() {
	if err := godotenv.Load("../.env"); err != nil {
		log.Println("No .env found:", err)
	}

	config.ConnectDB()

	collection := config.DB.Collection("products")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		log.Fatal(err)
	}
	defer cursor.Close(ctx)

	var products []models.Product
	if err := cursor.All(ctx, &products); err != nil {
		log.Fatal("Decode error: ", err)
	}

	fmt.Printf("Successfully fetched %d products\n", len(products))
	for _, p := range products {
		fmt.Printf("ID: %s, Name: %s\n", p.ID, p.Name)
	}
	os.Exit(0)
}
