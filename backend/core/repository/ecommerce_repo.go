package repository

import (
	"context"
	"errors"
	"go-analytics-backend/core/config"
	"go-analytics-backend/core/models"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// AddProductReview appends a review to a product and recalculates the average rating
func AddProductReview(productID string, review models.Review) error {
	collection := config.DB.Collection("products")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Convert product ID to object ID if possible
	var filter bson.M
	objID, err := primitive.ObjectIDFromHex(productID)
	if err == nil {
		filter = bson.M{"_id": objID}
	} else {
		filter = bson.M{"name": productID}
	}

	// 1. Retrieve the product to calculate new average
	var product models.Product
	err = collection.FindOne(ctx, filter).Decode(&product)
	if err != nil {
		return err
	}

	// 2. Append new review and recalculate average
	product.Reviews = append(product.Reviews, review)
	var totalRating int = 0
	for _, r := range product.Reviews {
		totalRating += r.Rating
	}
	product.AverageRating = float64(totalRating) / float64(len(product.Reviews))

	// 3. Update in database
	update := bson.M{
		"$set": bson.M{
			"reviews":        product.Reviews,
			"average_rating": product.AverageRating,
		},
	}

	_, err = collection.UpdateOne(ctx, filter, update)
	return err
}

// SeedDefaultCoupons inserts the default coupons if they do not exist
func SeedDefaultCoupons() error {
	collection := config.DB.Collection("coupons")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var existing models.Coupon
	err := collection.FindOne(ctx, bson.M{"code": "CYBER25"}).Decode(&existing)
	if err == nil {
		return nil // Coupon already exists
	}

	defaultCoupon := models.Coupon{
		Code:         "CYBER25",
		DiscountType: "percentage",
		Value:        25.0,
	}

	_, err = collection.InsertOne(ctx, defaultCoupon)
	return err
}

// ValidateCoupon looks up a coupon code and returns it
func ValidateCoupon(code string) (models.Coupon, error) {
	collection := config.DB.Collection("coupons")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var coupon models.Coupon
	err := collection.FindOne(ctx, bson.M{"code": code}).Decode(&coupon)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return coupon, errors.New("invalid coupon code")
		}
		return coupon, err
	}

	return coupon, nil
}

// GetWishlist returns all product names/IDs in a user's wishlist
func GetWishlist(userID string) ([]string, error) {
	collection := config.DB.Collection("wishlist")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := collection.Find(ctx, bson.M{"user_id": userID})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var items []string
	for cursor.Next(ctx) {
		var doc bson.M
		if err := cursor.Decode(&doc); err == nil {
			if prodID, ok := doc["product_id"].(string); ok {
				items = append(items, prodID)
			}
		}
	}

	if items == nil {
		items = []string{}
	}

	return items, nil
}

// AddToWishlist adds a product to a user's wishlist if it's not already present
func AddToWishlist(userID, productID string) error {
	collection := config.DB.Collection("wishlist")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Check if already in wishlist
	var existing bson.M
	err := collection.FindOne(ctx, bson.M{"user_id": userID, "product_id": productID}).Decode(&existing)
	if err == nil {
		return nil // Already in wishlist
	}

	_, err = collection.InsertOne(ctx, bson.M{
		"user_id":    userID,
		"product_id": productID,
	})
	return err
}

// RemoveFromWishlist removes a product from a user's wishlist
func RemoveFromWishlist(userID, productID string) error {
	collection := config.DB.Collection("wishlist")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := collection.DeleteOne(ctx, bson.M{"user_id": userID, "product_id": productID})
	return err
}
