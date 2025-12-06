package handlers

import (
	"net/http"
	"warehouse-api/repositories"
	"github.com/gin-gonic/gin"
)

type BarangHandler struct {
	Repo *repositories.BarangRepository
}

func NewBarangHandler(repo *repositories.BarangRepository) *BarangHandler {
	return &BarangHandler{Repo: repo}
}

func (h *BarangHandler) GetAllBarang(c *gin.Context) {
	barangs, err := h.Repo.GetAllBarang()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to get barang",
			"data":    nil,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Data retrieved successfully",
		"data":    barangs,
	})
}
