package main

import (
	"log"
	"os"

	"go-analytics-backend/core/config"
	"go-analytics-backend/core/repository"
	"go-analytics-backend/core/routes"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// 1. Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("Note: .env file එක සොයාගත නොහැක")
	}

	// 2. Connect Database
	config.ConnectDB()

	// Seeding products into database
	if err := repository.SeedProducts(); err != nil {
		log.Println("Note: Seeding error:", err)
	}

	// Seeding default admin user into database
	if err := repository.SeedAdminUser(); err != nil {
		log.Println("Note: Seeding admin error:", err)
	}

	// Seeding default coupons into database
	if err := repository.SeedDefaultCoupons(); err != nil {
		log.Println("Note: Seeding coupons error:", err)
	}

	// 3. Initialize Gin Router
	r := gin.Default()

	// CORS Middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// 4. Setup Modular Routes (අලුත් Endpoints මෙතනින් සම්බන්ධ වෙනවා)
	routes.SetupRoutes(r)

	// 5. Start Server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	
	log.Printf("🚀 සර්වර් එක පෝර්ට් %s හි ක්‍රියාත්මක වේ...", port)
	r.Run(":" + port)
}
