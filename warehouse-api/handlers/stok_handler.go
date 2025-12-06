package handlers

import (
	"net/http"

	"warehouse-api/repositories"

	"github.com/gin-gonic/gin"
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
