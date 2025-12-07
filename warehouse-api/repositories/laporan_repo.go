package repositories

import (
	"warehouse-api/models"
	"gorm.io/gorm"
	"time"
)

type LaporanRepository struct {
	DB *gorm.DB
}

func NewLaporanRepository(db *gorm.DB) *LaporanRepository {
	return &LaporanRepository{DB: db}
}


func (r *LaporanRepository) GetStokReport(minStock *int, sort string) ([]models.Stok, error) {
	var stoks []models.Stok
	tx := r.DB.Preload("Barang").Model(&models.Stok{})

	if minStock != nil {
		tx = tx.Where("stok_akhir <= ?", *minStock)
	}

	if sort == "asc" {
		tx = tx.Order("stok_akhir asc")
	} else {
		tx = tx.Order("stok_akhir desc")
	}

	if err := tx.Find(&stoks).Error; err != nil {
		return nil, err
	}
	return stoks, nil
}

func (r *LaporanRepository) GetPenjualanReport(startDate, endDate string) ([]models.PenjualanHeader, float64, error) {
	var penjualans []models.PenjualanHeader
	tx := r.DB.Preload("User").Preload("Details").Preload("Details.Barang").Model(&models.PenjualanHeader{}).Order("created_at DESC")

	if startDate != "" {
		if t, err := time.Parse("2006-01-02", startDate); err == nil {
			tx = tx.Where("created_at >= ?", t)
		}
	}
	if endDate != "" {
		if t, err := time.Parse("2006-01-02", endDate); err == nil {
			t = t.Add(24 * time.Hour)
			tx = tx.Where("created_at < ?", t)
		}
	}

	if err := tx.Find(&penjualans).Error; err != nil {
		return nil, 0, err
	}

	var grandTotal float64 = 0
	for _, p := range penjualans {
		grandTotal += p.Total
	}

	return penjualans, grandTotal, nil
}
