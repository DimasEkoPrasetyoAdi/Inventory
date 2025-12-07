package repositories

import (
	"warehouse-api/models"
	"gorm.io/gorm"
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
