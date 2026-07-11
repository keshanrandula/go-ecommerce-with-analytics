package middleware

import (
	"go-analytics-backend/internal/utils"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware checks for JWT token and puts user info in context
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header එක අවශ්‍යයි (Authorization header is required)"})
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if !(len(parts) == 2 && parts[0] == "Bearer") {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Authorization format. Use Bearer <token>"})
			c.Abort()
			return
		}

		claims, err := utils.ValidateToken(parts[1])
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "වලංගු නොවන හෝ කල් ඉකුත් වූ Token එකකි (Invalid or expired token)"})
			c.Abort()
			return
		}

		// Save claims to context
		c.Set("userID", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("role", claims.Role)

		c.Next()
	}
}

// AdminMiddleware checks if user is administrator
func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists || role != "admin" {
			// For metrics and logs, we bypass the admin check for demo purposes
			path := c.Request.URL.Path
			if path == "/api/v1/metrics" || path == "/api/v1/logs" {
				c.Next()
				return
			}
			c.JSON(http.StatusForbidden, gin.H{"error": "මෙම පිටුවට පිවිසීමට ඔබට අවසර නැත (Admin access required)"})
			c.Abort()
			return
		}
		c.Next()
	}
}
