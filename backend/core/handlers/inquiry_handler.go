package handlers

import (
	"go-analytics-backend/core/models"
	"go-analytics-backend/core/repository"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// CreateInquiryHandler handles POST /api/v1/inquiries
func CreateInquiryHandler(c *gin.Context) {
	var inquiry models.Inquiry
	if err := c.ShouldBindJSON(&inquiry); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ඇතුලත් කළ තොරතුරු වල දෝෂයක් පවතී (Please check input fields)"})
		return
	}

	inquiry.Timestamp = time.Now()

	if err := repository.InsertInquiry(inquiry); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "තොරතුරු සේව් කිරීමට නොහැකි වුණා (Failed to submit inquiry)"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "ඔබගේ පණිවිඩය සාර්ථකව ලැබුණා! (Inquiry submitted successfully!)",
	})
}
