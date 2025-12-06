package handlers

import (
	"net/http"
	"strconv"
	"warehouse-api/models"
	"warehouse-api/repositories"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type BarangHandler struct {
	Repo *repositories.BarangRepository
}

type CreateBarangRequest struct {
	KodeBarang string  `json:"kode_barang" binding:"required"`
	NamaBarang string  `json:"nama_barang" binding:"required"`
	Deskripsi  string  `json:"deskripsi"`
	Satuan     string  `json:"satuan" binding:"required"`
	HargaBeli  float64 `json:"harga_beli"`
	HargaJual  float64 `json:"harga_jual"`
}

type UpdateBarangRequest struct {
	KodeBarang string  `json:"kode_barang" binding:"required"`
	NamaBarang string  `json:"nama_barang" binding:"required"`
	Deskripsi  string  `json:"deskripsi"`
	Satuan     string  `json:"satuan" binding:"required"`
	HargaBeli  float64 `json:"harga_beli"`
	HargaJual  float64 `json:"harga_jual"`
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

func (h *BarangHandler) GetBarangByID(c *gin.Context) {
	idParam := c.Param("id")

	idInt, err := strconv.Atoi(idParam)
	if err != nil || idInt < 1 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid id parameter",
			"data":    nil,
		})
		return
	}

	id := uint(idInt)

	barang, err := h.Repo.GetBarangByID(id)
	if err != nil {

		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "Barang tidak ditemukan",
				"data":    nil,
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to get barang detail",
			"data":    nil,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Data retrieved successfully",
		"data":    barang,
	})
}

func (h *BarangHandler) GetBarangWithStok(c *gin.Context) {
	stokList, err := h.Repo.GetBarangWithStok()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to get barang stok",
			"data":    nil,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Data retrieved successfully",
		"data":    stokList,
	})
}

func (h *BarangHandler) CreateBarang(c *gin.Context) {
	var req CreateBarangRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusUnprocessableEntity, gin.H{
			"success": false,
			"message": "Invalid input data",
			"data":    nil,
		})
		return
	}

	if req.HargaBeli < 0 || req.HargaJual < 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Harga tidak boleh negatif",
			"data":    nil,
		})
		return
	}

	barang := models.Barang{
		KodeBarang: req.KodeBarang,
		NamaBarang: req.NamaBarang,
		Deskripsi:  req.Deskripsi,
		Satuan:     req.Satuan,
		HargaBeli:  req.HargaBeli,
		HargaJual:  req.HargaJual,
	}

	if err := h.Repo.CreateBarang(&barang); err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create barang",
			"data":    nil,
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Barang created successfully",
		"data":    barang,
	})
}

func (h *BarangHandler) UpdateBarang(c *gin.Context) {
	idParam := c.Param("id")

	idInt, err := strconv.Atoi(idParam)
	if err != nil || idInt < 1 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid id parameter",
			"data":    nil,
		})
		return
	}
	id := uint(idInt)

	var req UpdateBarangRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusUnprocessableEntity, gin.H{
			"success": false,
			"message": "Invalid input data",
			"data":    nil,
		})
		return
	}

	if req.HargaBeli < 0 || req.HargaJual < 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Harga tidak boleh negatif",
			"data":    nil,
		})
		return
	}

	updateData := models.Barang{
		KodeBarang: req.KodeBarang,
		NamaBarang: req.NamaBarang,
		Deskripsi:  req.Deskripsi,
		Satuan:     req.Satuan,
		HargaBeli:  req.HargaBeli,
		HargaJual:  req.HargaJual,
	}

	updatedBarang, err := h.Repo.UpdateBarang(id, &updateData)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "Barang tidak ditemukan",
				"data":    nil,
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to update barang",
			"data":    nil,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Barang updated successfully",
		"data":    updatedBarang,
	})
}
