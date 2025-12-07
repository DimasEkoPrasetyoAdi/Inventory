package handlers

import (
	"net/http"
	"warehouse-api/models"
	"warehouse-api/repositories"

	"github.com/gin-gonic/gin"
)

type PenjualanHandler struct {
	Repo *repositories.PenjualanRepository
}

func NewPenjualanHandler(repo *repositories.PenjualanRepository) *PenjualanHandler {
	return &PenjualanHandler{Repo: repo}
}

type PenjualanItemRequest struct {
	BarangID uint    `json:"barang_id" binding:"required"`
	Qty      int     `json:"qty" binding:"required"`
	Harga    float64 `json:"harga" binding:"required"`
}

type CreatePenjualanRequest struct {
	NoFaktur string                 `json:"no_faktur" binding:"required"`
	Customer string                 `json:"customer" binding:"required"`
	UserID   uint                   `json:"user_id" binding:"required"`
	Items    []PenjualanItemRequest `json:"items" binding:"required"`
}

func (h *PenjualanHandler) CreatePenjualan(c *gin.Context) {
	var req CreatePenjualanRequest

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
	header := models.PenjualanHeader{
		NoFaktur: req.NoFaktur,
		Customer: req.Customer,
		UserID:   req.UserID,
	}

	var details []models.PenjualanDetail
	for _, item := range req.Items {
		if item.Qty <= 0 || item.Harga < 0 {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Qty must be > 0 and harga cannot be negative",
				"data":    nil,
			})
			return
		}

		detail := models.PenjualanDetail{
			BarangID: item.BarangID,
			Qty:      item.Qty,
			Harga:    item.Harga,
		}
		details = append(details, detail)
	}

	result, err := h.Repo.CreatePenjualan(&header, details)
	if err != nil {
		if err != nil && len(err.Error()) >= 18 && err.Error()[:18] == "INSUFFICIENT_STOCK" {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Stok tidak mencukupi",
				"data":    nil,
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create penjualan",
			"data":    nil,
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Penjualan created successfully",
		"data":    result,
	})
}
