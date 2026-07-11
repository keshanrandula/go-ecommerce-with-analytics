package handlers

import (
	"go-analytics-backend/core/models"
	"go-analytics-backend/core/repository"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// POST /api/v1/metrics
func TrackMetricHandler(c *gin.Context) {
	var metric models.EventMetric
	if err := c.ShouldBindJSON(&metric); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	metric.Timestamp = time.Now()

	if err := repository.InsertMetric(metric); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "දත්ත සේව් කිරීමට නොහැකි වුණා"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Action Tracked Successfully!"})
}

// GET /api/v1/analytics/summary
func GetSummaryHandler(c *gin.Context) {
	summary, err := repository.GetAnalyticsSummary()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "දත්ත ලබා ගැනීමට නොහැකි වුණා"})
		return
	}
	c.JSON(http.StatusOK, summary)
}

// GET /api/v1/orders
func GetUserOrdersHandler(c *gin.Context) {
	username, exists := c.Get("username")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "පරිශීලකයා හඳුනා ගැනීමට නොහැකි වුණා"})
		return
	}
	userIDStr := username.(string)

	orders, err := repository.GetUserOrders(userIDStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ඇණවුම් දත්ත ලබා ගැනීමට නොහැකි වුණා"})
		return
	}

	c.JSON(http.StatusOK, orders)
}

type CheckoutItem struct {
	ProductName string  `json:"product_name" binding:"required"`
	Price       float64 `json:"price" binding:"required"`
	Quantity    int     `json:"quantity" binding:"required"`
}

type CheckoutRequest struct {
	Items []CheckoutItem `json:"items" binding:"required"`
}

// POST /api/v1/orders
func CreateOrderHandler(c *gin.Context) {
	username, exists := c.Get("username")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "පරිශීලකයා හඳුනා ගැනීමට නොහැකි වුණා"})
		return
	}
	userIDStr := username.(string)

	var req CheckoutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ඇණවුම් දත්ත නිවැරදිව ඇතුලත් කරන්න"})
		return
	}

	products, err := repository.GetAllProducts()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "භාණ්ඩ ලැයිස්තුව ලබා ගැනීමට අපොහොසත් වුණා"})
		return
	}

	prodMap := make(map[string]models.Product)
	for _, p := range products {
		prodMap[p.Name] = p
	}

	// Validate stock
	for _, item := range req.Items {
		p, exists := prodMap[item.ProductName]
		if !exists {
			c.JSON(http.StatusBadRequest, gin.H{"error": item.ProductName + " භාණ්ඩය වෙළඳසැලේ සොයාගත නොහැකි වුණා"})
			return
		}
		if p.Stock < item.Quantity {
			c.JSON(http.StatusBadRequest, gin.H{"error": item.ProductName + " භාණ්ඩයේ ප්‍රමාණවත් තොග නොමැත. දැනට ඉතිරිව ඇත්තේ: " + strconv.Itoa(p.Stock)})
			return
		}
	}

	// Decrement stock and save purchase metrics
	for _, item := range req.Items {
		p := prodMap[item.ProductName]
		newStock := p.Stock - item.Quantity
		targetId := p.ID
		if targetId == "" {
			targetId = p.Name
		}
		if err := repository.UpdateProductStock(targetId, newStock); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "තොග යාවත්කාලීන කිරීමට අපොහොසත් වුණා"})
			return
		}

		metric := models.EventMetric{
			UserID:    userIDStr,
			EventType: "purchase",
			ProductID: item.ProductName,
			Price:     item.Price * float64(item.Quantity),
			Timestamp: time.Now(),
			Status:    "Processing",
		}

		if err := repository.InsertMetric(metric); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ඇණවුම සේව් කිරීමට නොහැකි වුණා"})
			return
		}
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Order created successfully!"})
}

// GET /api/v1/admin/orders
func GetAdminOrdersHandler(c *gin.Context) {
	orders, err := repository.GetAllOrders()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ගෙවීම් දත්ත ලබා ගැනීමට නොහැකි වුණා (Failed to retrieve payment/order details)"})
		return
	}
	c.JSON(http.StatusOK, orders)
}

// GET /api/v1/analytics/advanced
func GetAdvancedAnalyticsHandler(c *gin.Context) {
	revenueTrend, err := repository.GetDailyRevenueTrend()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ආදායම් දත්ත ලබා ගැනීමට නොහැකි වුණා (Failed to fetch revenue trend)"})
		return
	}

	topProducts, err := repository.GetTopSellingProducts()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "භාණ්ඩ දත්ත ලබා ගැනීමට නොහැකි වුණා (Failed to fetch top products)"})
		return
	}

	heatmap, err := repository.GetActivityHeatmap()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "තාප සිතියම් දත්ත ලබා ගැනීමට නොහැකි වුණා (Failed to fetch heatmap)"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"revenue_trend": revenueTrend,
		"top_products":  topProducts,
		"heatmap":       heatmap,
	})
}

type UpdateOrderStatusRequest struct {
	Status string `json:"status" binding:"required"`
}

// PUT /api/v1/admin/orders/:id/status
func UpdateOrderStatusHandler(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Order ID is required"})
		return
	}

	var req UpdateOrderStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status is required"})
		return
	}

	if err := repository.UpdateOrderStatus(id, req.Status); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ඇණවුම් තත්ත්වය වෙනස් කිරීමට නොහැකි වුණා"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Order status updated successfully!"})
}
