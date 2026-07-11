package repository

import (
	"context"
	"go-analytics-backend/core/config"
	"go-analytics-backend/core/models"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// InsertProduct adds a new product
func InsertProduct(product models.Product) error {
	collection := config.DB.Collection("products")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := collection.InsertOne(ctx, product)
	return err
}

// GetAllProducts fetches all products
func GetAllProducts() ([]models.Product, error) {
	collection := config.DB.Collection("products")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var products []models.Product
	if err := cursor.All(ctx, &products); err != nil {
		return nil, err
	}

	// Return empty slice instead of nil for better JSON serialization
	if products == nil {
		products = []models.Product{}
	}

	return products, nil
}

// SeedProducts checks if products collection is empty and seeds default items
func SeedProducts() error {
	if config.DB == nil {
		log.Println("⚠️ WARNING: Database not connected. Skipping SeedProducts.")
		return nil
	}
	collection := config.DB.Collection("products")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	count, err := collection.CountDocuments(ctx, bson.M{})
	if err != nil {
		return err
	}

	if count > 0 {
		collection.UpdateOne(ctx, bson.M{"name": "Cyberpunk Mechanical Keyboard"}, bson.M{"$set": bson.M{"stock": 8}})
		collection.UpdateOne(ctx, bson.M{"name": "Quantum ANC Headphones"}, bson.M{"$set": bson.M{"stock": 3}})
		collection.UpdateOne(ctx, bson.M{"name": "Holographic Smart Watch"}, bson.M{"$set": bson.M{"stock": 0}})
		collection.UpdateOne(ctx, bson.M{"name": "Neo-Glow Gaming Mouse"}, bson.M{"$set": bson.M{"stock": 15}})
		log.Println("Database already seeded with products. Default stock levels populated.")
		return nil
	}

	defaultProducts := []interface{}{
		models.Product{
			Name:        "Cyberpunk Mechanical Keyboard",
			Price:       129.99,
			Category:    "Gear",
			Theme:       "emerald",
			Badge:       "Limited Edition",
			Description: "Hot-swappable tactile switches with neon-pulsing RGB backlighting and full aircraft-grade aluminum CNC chassis.",
			Specs:       []string{"Gateron Jade Switches", "PBT Dye-Sub Keycaps", "CNC Anodized Case", "Hotswap 75% Layout"},
			Stock:       8,
		},
		models.Product{
			Name:        "Quantum ANC Headphones",
			Price:       199.99,
			Category:    "Audio",
			Theme:       "emerald",
			Badge:       "Top Seller",
			Description: "Active Noise Cancelling driven by neural hardware, featuring ultra-low latency wireless streaming and audiophile drivers.",
			Specs:       []string{"40mm Bio-Cellulose Drivers", "Neural ANC Engine", "50 Hours Playback", "Bluetooth 5.4 LE"},
			Stock:       3,
		},
		models.Product{
			Name:        "Holographic Smart Watch",
			Price:       249.99,
			Category:    "Wearables",
			Theme:       "emerald",
			Badge:       "Futuristic",
			Description: "Next-gen holographic projection dial, dynamic health monitoring, and battery optimized with micro-solar charging grids.",
			Specs:       []string{"Holo-Projector Display", "Bio-Tracker Sensor v4", "Solar Assisted Battery", "Titanium Exo-Frame"},
			Stock:       0,
		},
		models.Product{
			Name:        "Neo-Glow Gaming Mouse",
			Price:       79.99,
			Category:    "Gear",
			Theme:       "emerald",
			Badge:       "Pro Tier",
			Description: "Optical mouse featuring pixel-perfect zero-smoothing tracking, custom weight distribution, and premium glide feet.",
			Specs:       []string{"26,000 DPI Sensor", "Optical Switches Gen-3", "Ultra-Lightweight 58g", "PTFE Glide Pads"},
			Stock:       15,
		},
	}

	_, err = collection.InsertMany(ctx, defaultProducts)
	if err != nil {
		return err
	}

	log.Println("✅ Default products successfully seeded in MongoDB!")
	return nil
}

// UpdateProduct updates a product's details in MongoDB
func UpdateProduct(id string, product models.Product) error {
	collection := config.DB.Collection("products")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	update := bson.M{
		"$set": bson.M{
			"name":        product.Name,
			"price":       product.Price,
			"category":    product.Category,
			"badge":       product.Badge,
			"description": product.Description,
			"specs":       product.Specs,
			"image":       product.Image,
			"stock":       product.Stock,
		},
	}

	_, err = collection.UpdateOne(ctx, bson.M{"_id": objectID}, update)
	return err
}

// DeleteProduct deletes a product from MongoDB
func DeleteProduct(id string) error {
	collection := config.DB.Collection("products")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	_, err = collection.DeleteOne(ctx, bson.M{"_id": objectID})
	return err
}

// UpdateProductStock updates only the stock field of a product
func UpdateProductStock(id string, newStock int) error {
	collection := config.DB.Collection("products")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var filter bson.M
	objectID, err := primitive.ObjectIDFromHex(id)
	if err == nil {
		filter = bson.M{"_id": objectID}
	} else {
		filter = bson.M{"name": id}
	}

	update := bson.M{
		"$set": bson.M{
			"stock": newStock,
		},
	}

	_, err = collection.UpdateOne(ctx, filter, update)
	return err
}
