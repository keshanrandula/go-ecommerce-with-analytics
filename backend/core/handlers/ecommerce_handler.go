package handlers

import (
	"go-analytics-backend/core/models"
	"go-analytics-backend/core/repository"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type ApplyCouponRequest struct {
	Code     string  `json:"code" binding:"required"`
	Subtotal float64 `json:"subtotal" binding:"required"`
}

// ApplyCouponHandler checks a coupon and returns the discount amount
func ApplyCouponHandler(c *gin.Context) {
	var req ApplyCouponRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "කූපන් කේතය (coupon code) නිවැරදිව ඇතුලත් කරන්න"})
		return
	}

	coupon, err := repository.ValidateCoupon(req.Code)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var discountAmount float64 = 0
	if coupon.DiscountType == "percentage" {
		discountAmount = (coupon.Value / 100.0) * req.Subtotal
	} else if coupon.DiscountType == "fixed" {
		discountAmount = coupon.Value
	}

	if discountAmount > req.Subtotal {
		discountAmount = req.Subtotal
	}

	c.JSON(http.StatusOK, gin.H{
		"code":            coupon.Code,
		"discount_type":   coupon.DiscountType,
		"value":           coupon.Value,
		"discount_amount": discountAmount,
		"new_total":       req.Subtotal - discountAmount,
	})
}

type AddReviewRequest struct {
	Rating  int    `json:"rating" binding:"required,min=1,max=5"`
	Comment string `json:"comment" binding:"required"`
}

// AddProductReviewHandler handles appending reviews to a product
func AddProductReviewHandler(c *gin.Context) {
	productID := c.Param("id")
	username, exists := c.Get("username")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "පරිශීලකයා හඳුනා ගැනීමට නොහැකි වුණා"})
		return
	}

	var req AddReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "වලංගු තක්සේරුවක් (Rating: 1-5) සහ අදහසක් (Comment) ඇතුලත් කරන්න"})
		return
	}

	review := models.Review{
		Rating:    req.Rating,
		Comment:   req.Comment,
		Username:  username.(string),
		Timestamp: time.Now(),
	}

	if err := repository.AddProductReview(productID, review); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "විචාරය (Review) ඇතුලත් කිරීමට අපොහොසත් වුණා"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Review added successfully!"})
}

// GetWishlistHandler returns the user's wishlist
func GetWishlistHandler(c *gin.Context) {
	username, exists := c.Get("username")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "පරිශීලකයා හඳුනා ගැනීමට නොහැකි වුණා"})
		return
	}

	items, err := repository.GetWishlist(username.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Wishlist එක ලබා ගැනීමට අපොහොසත් වුණා"})
		return
	}

	c.JSON(http.StatusOK, items)
}

type WishlistRequest struct {
	ProductID string `json:"product_id" binding:"required"`
}

// AddToWishlistHandler appends an item to user's wishlist
func AddToWishlistHandler(c *gin.Context) {
	username, exists := c.Get("username")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "පරිශීලකයා හඳුනා ගැනීමට නොහැකි වුණා"})
		return
	}

	var req WishlistRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "භාණ්ඩයේ අයිඩිය (Product ID) අවශ්‍යයි"})
		return
	}

	if err := repository.AddToWishlist(username.(string), req.ProductID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "භාණ්ඩය Wishlist එකට එක් කිරීමට අපොහොසත් වුණා"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Added to wishlist"})
}

// RemoveFromWishlistHandler deletes an item from user's wishlist
func RemoveFromWishlistHandler(c *gin.Context) {
	username, exists := c.Get("username")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "පරිශීලකයා හඳුනා ගැනීමට නොහැකි වුණා"})
		return
	}

	productID := c.Param("id")
	if err := repository.RemoveFromWishlist(username.(string), productID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "භාණ්ඩය Wishlist එකෙන් ඉවත් කිරීමට අපොහොසත් වුණා"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Removed from wishlist"})
}

type PaymentIntentRequest struct {
	Amount float64 `json:"amount" binding:"required"`
}

// CreatePaymentIntentHandler creates a mock Stripe Payment intent response
func CreatePaymentIntentHandler(c *gin.Context) {
	var req PaymentIntentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "මුදල (Amount) ඇතුලත් කරන්න"})
		return
	}

	// Simulated Stripe Response
	c.JSON(http.StatusOK, gin.H{
		"client_secret": "pi_mock_secret_" + time.Now().Format("20060102150405"),
		"status":        "requires_payment_method",
		"amount":        req.Amount,
	})
}
