package handlers

import (
	"go-analytics-backend/core/models"
	"go-analytics-backend/core/repository"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GET /api/v1/products
func GetProductsHandler(c *gin.Context) {
	products, err := repository.GetAllProducts()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "නිෂ්පාදන ලබා ගැනීමට නොහැකි වුණා"})
		return
	}
	c.JSON(http.StatusOK, products)
}

// POST /api/v1/products
func CreateProductHandler(c *gin.Context) {
	var product models.Product
	if err := c.ShouldBindJSON(&product); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Always default to 'emerald' theme to keep layout styled correctly
	if product.Theme == "" {
		product.Theme = "emerald"
	}

	if err := repository.InsertProduct(product); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "නිෂ්පාදනය ඇතුලත් කිරීමට නොහැකි වුණා"})
		return
	}

	c.JSON(http.StatusCreated, product)
}

// PUT /api/v1/products/:id
func UpdateProductHandler(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "product ID එක අවශ්‍යයි"})
		return
	}

	var product models.Product
	if err := c.ShouldBindJSON(&product); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Always default to 'emerald' theme to keep layout styled correctly
	if product.Theme == "" {
		product.Theme = "emerald"
	}

	if err := repository.UpdateProduct(id, product); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "නිෂ්පාදන විස්තර වෙනස් කිරීමට නොහැකි වුණා"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product updated successfully!"})
}

// DELETE /api/v1/products/:id
func DeleteProductHandler(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "product ID එක අවශ්‍යයි"})
		return
	}

	if err := repository.DeleteProduct(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "නිෂ්පාදනය ඉවත් කිරීමට නොහැකි වුණා"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product deleted successfully!"})
}

type UpdateStockRequest struct {
	Stock int `json:"stock" binding:"min=0"`
}

// PUT /api/v1/products/:id/stock
func UpdateProductStockHandler(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "product ID එක අවශ්‍යයි"})
		return
	}

	var req UpdateStockRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "වලංගු තොග ප්‍රමාණයක් (stock count) ඇතුලත් කරන්න"})
		return
	}

	if err := repository.UpdateProductStock(id, req.Stock); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "තොග යාවත්කාලීන කිරීමට නොහැකි වුණා"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Stock updated successfully!"})
}
