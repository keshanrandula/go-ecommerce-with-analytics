package handler

import (
	"net/http"

	"go-analytics-backend/internal/config"
	"go-analytics-backend/internal/repository"
	"go-analytics-backend/internal/routes"

	"github.com/gin-gonic/gin"
)

var app *gin.Engine

func init() {
	// 1. Connect Database
	config.ConnectDB()

	// Seeding products into database
	_ = repository.SeedProducts()

	// Seeding default admin user into database
	_ = repository.SeedAdminUser()

	// Seeding default coupons into database
	_ = repository.SeedDefaultCoupons()

	// 2. Initialize Gin Router
	app = gin.Default()

	// CORS Middleware
	app.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// 3. Setup Modular Routes
	routes.SetupRoutes(app)
}

// Handler is the entrypoint function for Vercel
func Handler(w http.ResponseWriter, r *http.Request) {
	app.ServeHTTP(w, r)
}
