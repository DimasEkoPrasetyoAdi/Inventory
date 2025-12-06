package handlers

import (
	"net/http"
	"strconv"

	"warehouse-api/repositories"

	"github.com/gin-gonic/gin"
)

type HistoryStokHandler struct {
	Repo *repositories.HistoryStokRepository
}

func NewHistoryStokHandler(repo *repositories.HistoryStokRepository) *HistoryStokHandler {
	return &HistoryStokHandler{Repo: repo}
}


func (h *HistoryStokHandler) GetAllHistory(c *gin.Context) {
	histories, err := h.Repo.GetAllHistory()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to get history stok",
			"data":    nil,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Data retrieved successfully",
		"data":    histories,
		"meta": gin.H{
			"total": len(histories),
		},
	})
}


func (h *HistoryStokHandler) GetHistoryByBarang(c *gin.Context) {
	barangIDParam := c.Param("barang_id")

	idInt, err := strconv.Atoi(barangIDParam)
	if err != nil || idInt < 1 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid barang_id parameter",
			"data":    nil,
		})
		return
	}
	barangID := uint(idInt)

	histories, err := h.Repo.GetHistoryByBarangID(barangID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to get history stok",
			"data":    nil,
		})
		return
	}


	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Data retrieved successfully",
		"data":    histories,
		"meta": gin.H{
			"total": len(histories),
		},
	})
}
