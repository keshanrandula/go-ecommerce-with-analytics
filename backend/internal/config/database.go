package config

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var DB *mongo.Database

func ConnectDB() {
	// .env එකෙන් URI එක කියවීම
	uri := os.Getenv("MONGODB_URI")
	if uri == "" {
		log.Fatal("MONGODB_URI එක .env ෆයිල් එකේ සඳහන් කර නැත!")
	}

	// තත්පර 10ක Timeout එකක් ලබාදීම
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Connect වීම
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		log.Fatal("MongoDB සමඟ සම්බන්ධ වීමට නොහැක:", err)
	}

	// Connection එක වැඩදැයි පරීක්ෂා කිරීම (Ping)
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal("MongoDB Atlas එක ක්‍රියාත්මක නැත (Ping Failed):", err)
	}

	fmt.Println("✅ MongoDB Atlas එක සාර්ථකව සම්බන්ධ වුණා!")
	
	// Read database name dynamically from environment
	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "analytics-db"
	}
	DB = client.Database(dbName)
}