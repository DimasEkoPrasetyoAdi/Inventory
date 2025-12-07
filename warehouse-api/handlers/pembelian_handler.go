package handlers

import (
	"net/http"

	"warehouse-api/models"
	"warehouse-api/repositories"

	"github.com/gin-gonic/gin"
)

type PembelianHandler struct {
	Repo *repositories.PembelianRepository
}

func NewPembelianHandler(repo *repositories.PembelianRepository) *PembelianHandler {
	return &PembelianHandler{Repo: repo}
}

type PembelianItemRequest struct {
	BarangID uint    `json:"barang_id" binding:"required"`
	Qty      int     `json:"qty" binding:"required"`
	Harga    float64 `json:"harga" binding:"required"`
}

type CreatePembelianRequest struct {
	NoFaktur string                 `json:"no_faktur" binding:"required"`
	Supplier string                 `json:"supplier" binding:"required"`
	UserID   uint                   `json:"user_id" binding:"required"`
	Items    []PembelianItemRequest `json:"items" binding:"required"`
}


func (h *PembelianHandler) CreatePembelian(c *gin.Context) {
	var req CreatePembelianRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusUnprocessableEntity, gin.H{
			"success": false,
			"message": "Invalid input data",
			"data":    nil,
		})
		return
	}

	if len(req.Items) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Items cannot be empty",
			"data":    nil,
		})
		return
	}

	
	header := models.PembelianHeader{
		NoFaktur: req.NoFaktur,
		Supplier: req.Supplier,
		UserID:   req.UserID,
		
	}

	
	var details []models.PembelianDetail
	for _, item := range req.Items {
		
		if item.Qty <= 0 || item.Harga < 0 {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Qty must be > 0 and harga cannot be negative",
				"data":    nil,
			})
			return
		}

		detail := models.PembelianDetail{
			BarangID: item.BarangID,
			Qty:      item.Qty,
			Harga:    item.Harga,
		}
		details = append(details, detail)
	}

	
	result, err := h.Repo.CreatePembelian(&header, details)
	if err != nil {
		
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create pembelian",
			"data":    nil,
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Pembelian created successfully",
		"data":    result,
	})
}
