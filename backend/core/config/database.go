package config

import (
	"context"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var DB *mongo.Database

func ConnectDB() {
	// .env එකෙන් URI එක කියවීම
	uri := os.Getenv("MONGODB_URI")
	uri = strings.TrimSpace(uri)
	if uri == "" {
		log.Println("⚠️ WARNING: MONGODB_URI එක .env ෆයිල් එකේ හෝ Environment Variables වල සටහන් වී නැත!")
		return
	}

	// තත්පර 10ක Timeout එකක් ලබාදීම
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Connect වීම
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		log.Println("⚠️ WARNING: MongoDB සමඟ සම්බන්ධ වීමට නොහැක:", err)
		return
	}

	// Connection එක වැඩදැයි පරීක්ෂා කිරීම (Ping)
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Println("⚠️ WARNING: MongoDB Atlas එක ක්‍රියාත්මක නැත (Ping Failed):", err)
		return
	}

	fmt.Println("✅ MongoDB Atlas එක සාර්ථකව සම්බන්ධ වුණා!")
	
	// Read database name dynamically from environment
	dbName := os.Getenv("DB_NAME")
	dbName = strings.TrimSpace(dbName)
	if dbName == "" {
		dbName = "analytics-db"
	}
	DB = client.Database(dbName)
}
