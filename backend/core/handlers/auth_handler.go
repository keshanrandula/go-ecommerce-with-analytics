package handlers

import (
	"go-analytics-backend/core/models"
	"go-analytics-backend/core/repository"
	"go-analytics-backend/core/utils"
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type RegisterRequest struct {
	Name     string `json:"name" binding:"required"`
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	Role     string `json:"role" binding:"required"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// RegisterHandler handles POST /api/v1/register
func RegisterHandler(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "සියලුම තොරතුරු නිවැරදිව ඇතුලත් කරන්න"})
		return
	}

	// Validate role - default to 'user' if invalid
	if req.Role != "admin" && req.Role != "user" {
		req.Role = "user"
	}

	user := models.User{
		Name:     req.Name,
		Username: req.Username,
		Password: req.Password,
		Role:     req.Role,
	}

	if err := repository.RegisterUser(user); err != nil {
		if err.Error() == "username already exists" {
			c.JSON(http.StatusConflict, gin.H{"error": "මෙම පරිශීලක නාමය දැනටමත් භාවිතා වේ (Username already exists)"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error: " + err.Error()})
		}
		return
	}

	// Get full user with ID
	registeredUser, err := repository.GetUserByUsername(user.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ලියාපදිංචි කිරීමේ දෝෂයකි"})
		return
	}

	// Generate JWT Token
	token, err := utils.GenerateToken(registeredUser.ID, registeredUser.Username, registeredUser.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Token එක සෑදීමට නොහැකි වුණා"})
		return
	}

	registeredUser.Password = "" // Hide password in response
	c.JSON(http.StatusCreated, gin.H{
		"message": "පරිශීලකයා සාර්ථකව ලියාපදිංචි කරන ලදී!",
		"token":   token,
		"user":    registeredUser,
	})
}

// LoginHandler handles POST /api/v1/login
func LoginHandler(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "පරිශීලක නාමය සහ මුරපදය ඇතුලත් කරන්න"})
		return
	}

	user, err := repository.GetUserByUsername(req.Username)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "පරිශීලක නාමය හෝ මුරපදය වැරදියි"})
		return
	}

	// Compare passwords
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "පරිශීලක නාමය හෝ මුරපදය වැරදියි"})
		return
	}

	// Generate JWT Token
	token, err := utils.GenerateToken(user.ID, user.Username, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Token එක සෑදීමට නොහැකි වුණා"})
		return
	}

	user.Password = "" // Hide password
	c.JSON(http.StatusOK, gin.H{
		"message": "ඇතුල්වීම සාර්ථකයි!",
		"token":   token,
		"user": gin.H{
			"id":       user.ID,
			"name":     user.Name,
			"username": user.Username,
			"role":     user.Role,
		},
	})
}
