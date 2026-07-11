package repository

import (
	"context"
	"go-analytics-backend/internal/config"
	"go-analytics-backend/internal/models"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// දත්ත ඇතුලත් කිරීම
func InsertMetric(metric models.EventMetric) error {
	collection := config.DB.Collection("metrics")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := collection.InsertOne(ctx, metric)
	return err
}

// 📊 MongoDB Aggregation එක පාවිච්චි කරලා Summary එකක් ගැනීම
func GetAnalyticsSummary() (bson.M, error) {
	collection := config.DB.Collection("metrics")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// 1. මුළු ආදායම (Total Revenue) ගණනය කිරීම
	revenuePipeline := []bson.M{
		{"$match": bson.M{"event_type": "purchase"}},
		{"$group": bson.M{"_id": nil, "total": bson.M{"$sum": "$price"}}},
	}
	revCursor, _ := collection.Aggregate(ctx, revenuePipeline)
	var revResult []bson.M
	_ = revCursor.All(ctx, &revResult)

	var totalRevenue float64 = 0
	if len(revResult) > 0 {
		if val, ok := revResult[0]["total"].(float64); ok {
			totalRevenue = val
		}
	}

	// 2. Events වර්ග අනුව ගණන් කිරීම (Clicks, Views, Purchases)
	countPipeline := []bson.M{
		{"$group": bson.M{"_id": "$event_type", "count": bson.M{"$sum": 1}}},
	}
	countCursor, _ := collection.Aggregate(ctx, countPipeline)
	var countResults []bson.M
	_ = countCursor.All(ctx, &countResults)

	// අවසාන ප්‍රතිඵලය ලස්සනට සකස් කිරීම
	summary := bson.M{
		"total_revenue": totalRevenue,
		"clicks":        0,
		"views":         0,
		"purchases":     0,
	}

	for _, res := range countResults {
		evtType := res["_id"].(string)
		count := res["count"]
		if evtType == "click" {
			summary["clicks"] = count
		} else if evtType == "view" {
			summary["views"] = count
		} else if evtType == "purchase" {
			summary["purchases"] = count
		}
	}

	return summary, nil
}

// GetUserOrders fetches all purchases made by a specific user, sorted by timestamp descending
func GetUserOrders(userID string) ([]models.EventMetric, error) {
	collection := config.DB.Collection("metrics")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{
		"user_id":    userID,
		"event_type": "purchase",
	}

	// Sort by timestamp descending
	opts := options.Find().SetSort(bson.M{"timestamp": -1})

	cursor, err := collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var orders []models.EventMetric
	if err := cursor.All(ctx, &orders); err != nil {
		return nil, err
	}

	if orders == nil {
		orders = []models.EventMetric{}
	}

	return orders, nil
}

// GetAllOrders fetches all purchases made by all users, sorted by timestamp descending
func GetAllOrders() ([]models.EventMetric, error) {
	collection := config.DB.Collection("metrics")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{
		"event_type": "purchase",
	}

	opts := options.Find().SetSort(bson.M{"timestamp": -1})

	cursor, err := collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var orders []models.EventMetric
	if err := cursor.All(ctx, &orders); err != nil {
		return nil, err
	}

	if orders == nil {
		orders = []models.EventMetric{}
	}

	return orders, nil
}

// GetDailyRevenueTrend returns daily revenue for the past 14 days
func GetDailyRevenueTrend() ([]bson.M, error) {
	collection := config.DB.Collection("metrics")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	fourteenDaysAgo := time.Now().AddDate(0, 0, -14)

	pipeline := []bson.M{
		{
			"$match": bson.M{
				"event_type": "purchase",
				"timestamp":  bson.M{"$gte": fourteenDaysAgo},
			},
		},
		{
			"$project": bson.M{
				"date":  bson.M{"$dateToString": bson.M{"format": "%Y-%m-%d", "date": "$timestamp"}},
				"price": 1,
			},
		},
		{
			"$group": bson.M{
				"_id":   "$date",
				"total": bson.M{"$sum": "$price"},
			},
		},
		{
			"$sort": bson.M{"_id": 1},
		},
	}

	cursor, err := collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var results []bson.M
	if err := cursor.All(ctx, &results); err != nil {
		return nil, err
	}
	if results == nil {
		results = []bson.M{}
	}
	return results, nil
}

// GetTopSellingProducts returns top 5 purchased products
func GetTopSellingProducts() ([]bson.M, error) {
	collection := config.DB.Collection("metrics")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	pipeline := []bson.M{
		{
			"$match": bson.M{
				"event_type": "purchase",
			},
		},
		{
			"$group": bson.M{
				"_id":   "$product_id",
				"sales": bson.M{"$sum": 1},
			},
		},
		{
			"$sort": bson.M{"sales": -1},
		},
		{
			"$limit": 5,
		},
	}

	cursor, err := collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var results []bson.M
	if err := cursor.All(ctx, &results); err != nil {
		return nil, err
	}
	if results == nil {
		results = []bson.M{}
	}
	return results, nil
}

// GetActivityHeatmap groups all events by day of week and hour
func GetActivityHeatmap() ([]bson.M, error) {
	collection := config.DB.Collection("metrics")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	pipeline := []bson.M{
		{
			"$project": bson.M{
				"day":  bson.M{"$dayOfWeek": "$timestamp"},
				"hour": bson.M{"$hour": "$timestamp"},
			},
		},
		{
			"$group": bson.M{
				"_id": bson.M{
					"day":  "$day",
					"hour": "$hour",
				},
				"count": bson.M{"$sum": 1},
			},
		},
	}

	cursor, err := collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var results []bson.M
	if err := cursor.All(ctx, &results); err != nil {
		return nil, err
	}
	if results == nil {
		results = []bson.M{}
	}
	return results, nil
}

// UpdateOrderStatus updates the status of an order document in MongoDB
func UpdateOrderStatus(orderID string, status string) error {
	collection := config.DB.Collection("metrics")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var filter bson.M
	objID, err := primitive.ObjectIDFromHex(orderID)
	if err == nil {
		filter = bson.M{"_id": objID}
	} else {
		// If it's not a valid ObjectID, try matching by ID string (for simulated entries)
		filter = bson.M{"_id": orderID}
	}

	update := bson.M{
		"$set": bson.M{
			"status": status,
		},
	}

	_, err = collection.UpdateOne(ctx, filter, update)
	return err
}