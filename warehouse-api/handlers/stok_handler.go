package handlers

import (
	"net/http"
	"strconv"
	"warehouse-api/repositories"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type StokHandler struct {
	Repo *repositories.StokRepository
}

func NewStokHandler(repo *repositories.StokRepository) *StokHandler {
	return &StokHandler{Repo: repo}
}


func (h *StokHandler) GetAllStok(c *gin.Context) {
	stoks, err := h.Repo.GetAllStok()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to get stok data",
			"data":    nil,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Data retrieved successfully",
		"data":    stoks,
		"meta": gin.H{
			"total": len(stoks),
		},
	})
}


func (h *StokHandler) GetStokByBarang(c *gin.Context) {
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

	stok, err := h.Repo.GetStokByBarangID(barangID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "Stok untuk barang ini tidak ditemukan",
				"data":    nil,
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to get stok data",
			"data":    nil,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Data retrieved successfully",
		"data":    stok,
	})
}

