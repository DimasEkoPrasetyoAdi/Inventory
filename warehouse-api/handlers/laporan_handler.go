package handlers

import (
	"net/http"
	"strconv"
	"warehouse-api/repositories"
	"github.com/gin-gonic/gin"
)

type LaporanHandler struct {
	Repo *repositories.LaporanRepository
}

func NewLaporanHandler(repo *repositories.LaporanRepository) *LaporanHandler {
	return &LaporanHandler{Repo: repo}
}

func (h *LaporanHandler) GetLaporanStok(c *gin.Context) {
	minStockStr := c.Query("min_stock")
	var minStock *int
	if minStockStr != "" {
		v, err := strconv.Atoi(minStockStr)
		if err == nil {
			minStock = &v
		}
	}
	sort := c.DefaultQuery("sort", "desc")

	stoks, err := h.Repo.GetStokReport(minStock, sort)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to get stok report", "data": nil})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Laporan stok retrieved",
		"data":    stoks,
		"meta":    gin.H{"total": len(stoks)},
	})
}
