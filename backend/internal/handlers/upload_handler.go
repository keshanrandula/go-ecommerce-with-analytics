package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/gin-gonic/gin"
)

// UploadHandler handles uploading an image file (to Cloudinary if configured, otherwise local)
func UploadHandler(c *gin.Context) {
	// Parse the form file "image"
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ගොනුව (file) ලබා ගැනීමට නොහැකි වුණා (Failed to receive file)"})
		return
	}

	// Validate file size (max 5MB)
	const maxFileSize = 5 * 1024 * 1024 // 5MB
	if file.Size > maxFileSize {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ගොනුව 5MB ට වඩා කුඩා විය යුතුය (File size must be under 5MB)"})
		return
	}

	// Validate file extension
	ext := strings.ToLower(filepath.Ext(file.Filename))
	allowedExtensions := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".webp": true,
		".gif":  true,
	}

	if !allowedExtensions[ext] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "අනුමත නොකරන ගොනු වර්ගයකි. JPG, JPEG, PNG, WEBP, GIF පමණක් භාවිතා කරන්න (Invalid file type)"})
		return
	}

	// Read Cloudinary credentials
	cloudName := os.Getenv("CLOUDINARY_CLOUD_NAME")
	apiKey := os.Getenv("CLOUDINARY_API_KEY")
	apiSecret := os.Getenv("CLOUDINARY_API_SECRET")

	if cloudName == "" || apiKey == "" || apiSecret == "" {
		// Fallback to local storage
		uploadDir := "./uploads"
		if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Uploads directory එක සෑදීමට අපොහොසත් වුණා"})
			return
		}

		uniqueFilename := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
		dst := filepath.Join(uploadDir, uniqueFilename)

		if err := c.SaveUploadedFile(file, dst); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ගොනුව සේව් කිරීමට අපොහොසත් වුණා (Failed to save file)"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"url": fmt.Sprintf("/uploads/%s", uniqueFilename),
		})
		return
	}

	// Open the uploaded file stream for Cloudinary
	fileStream, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ගොනුව විවෘත කිරීමට අපොහොසත් වුණා (Failed to open file)"})
		return
	}
	defer fileStream.Close()

	// Initialize Cloudinary
	cld, err := cloudinary.NewFromParams(cloudName, apiKey, apiSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cloudinary සම්බන්ධ කිරීමට අපොහොසත් වුණා (Cloudinary initialization failed)"})
		return
	}

	// Upload to Cloudinary
	uploadResult, err := cld.Upload.Upload(c.Request.Context(), fileStream, uploader.UploadParams{
		Folder: "ecommerce_products",
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cloudinary වෙත අප්ලෝඩ් කිරීමට අපොහොසත් වුණා (Cloudinary upload failed): " + err.Error()})
		return
	}

	// Return the secure URL from Cloudinary
	c.JSON(http.StatusOK, gin.H{
		"url": uploadResult.SecureURL,
	})
}
