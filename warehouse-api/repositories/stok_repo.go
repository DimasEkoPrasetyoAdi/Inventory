package repositories

import (
	"warehouse-api/models"

	"gorm.io/gorm"
)

type StokRepository struct {
	DB *gorm.DB
}

func NewStokRepository(db *gorm.DB) *StokRepository {
	return &StokRepository{DB: db}
}

// GetAllStok: ambil semua stok + informasi barang
func (r *StokRepository) GetAllStok() ([]models.Stok, error) {
	var stoks []models.Stok

	// Preload("Barang") → ikut ambil data barang terkait
	if err := r.DB.
		Preload("Barang").
		Order("id").
		Find(&stoks).Error; err != nil {
		return nil, err
	}

	return stoks, nil
}
