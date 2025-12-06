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

func (r *StokRepository) GetAllStok() ([]models.Stok, error) {
	var stoks []models.Stok

	if err := r.DB.
		Preload("Barang").
		Order("id").
		Find(&stoks).Error; err != nil {
		return nil, err
	}

	return stoks, nil
}

func (r *StokRepository) GetStokByBarangID(barangID uint) (*models.Stok, error) {
	var stok models.Stok

	if err := r.DB.
		Preload("Barang").
		Where("barang_id = ?", barangID).
		First(&stok).Error; err != nil {
		return nil, err
	}

	return &stok, nil
}
