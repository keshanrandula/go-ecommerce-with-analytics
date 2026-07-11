package routes

import (
	"go-analytics-backend/core/handlers"
	"go-analytics-backend/core/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	v1 := r.Group("/api/v1")
	{
		// Public metrics endpoint (views/clicks)
		v1.POST("/metrics", handlers.TrackMetricHandler)
		
		// Auth Endpoints
		v1.POST("/register", handlers.RegisterHandler)
		v1.POST("/login", handlers.LoginHandler)
		
		// Products list is public
		v1.GET("/products", handlers.GetProductsHandler)
		v1.POST("/inquiries", handlers.CreateInquiryHandler)
		v1.POST("/coupons/apply", handlers.ApplyCouponHandler)

		// User protected endpoints (Checkout, Order History, Wishlist, Payments, Reviews)
		userGroup := v1.Group("")
		userGroup.Use(middleware.AuthMiddleware())
		{
			userGroup.GET("/orders", handlers.GetUserOrdersHandler)
			userGroup.POST("/orders", handlers.CreateOrderHandler) // Secure checkout
			userGroup.POST("/products/:id/reviews", handlers.AddProductReviewHandler)
			userGroup.GET("/wishlist", handlers.GetWishlistHandler)
			userGroup.POST("/wishlist", handlers.AddToWishlistHandler)
			userGroup.DELETE("/wishlist/:id", handlers.RemoveFromWishlistHandler)
			userGroup.POST("/payments/create-intent", handlers.CreatePaymentIntentHandler)
		}

		// Admin protected endpoints (Analytics, Product Creation & Management)
		adminGroup := v1.Group("")
		adminGroup.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
		{
			adminGroup.GET("/analytics/summary", handlers.GetSummaryHandler)
			adminGroup.GET("/analytics/advanced", handlers.GetAdvancedAnalyticsHandler)
			adminGroup.GET("/admin/orders", handlers.GetAdminOrdersHandler)
			adminGroup.PUT("/admin/orders/:id/status", handlers.UpdateOrderStatusHandler)
			adminGroup.POST("/products", handlers.CreateProductHandler)
			adminGroup.PUT("/products/:id", handlers.UpdateProductHandler)
			adminGroup.PUT("/products/:id/stock", handlers.UpdateProductStockHandler)
			adminGroup.DELETE("/products/:id", handlers.DeleteProductHandler)
			adminGroup.POST("/upload", handlers.UploadHandler)
		}
		
		// Serve uploaded files statically
		r.Static("/uploads", "./uploads")
		
		// කලින් හදපු සරල හෙල්ත් චෙක් එක
		v1.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "Backend running smooth!"})
		})
	}
}
