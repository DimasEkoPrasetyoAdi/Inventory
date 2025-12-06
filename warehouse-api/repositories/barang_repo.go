package repositories

import (
	"warehouse-api/models"

	"gorm.io/gorm"
)

type BarangRepository struct {
	DB *gorm.DB
}

func NewBarangRepository(db *gorm.DB) *BarangRepository {
	return &BarangRepository{DB: db}
}

func (r *BarangRepository) GetAllBarang() ([]models.Barang, error) {
	var barangs []models.Barang
	if err := r.DB.
		Order("id").
		Find(&barangs).Error; err != nil {
		return nil, err
	}

	return barangs, nil
}

func (r *BarangRepository) GetBarangByID(id uint) (*models.Barang, error) {
	var barang models.Barang
	
	if err := r.DB.
		Where("id = ?", id).
		First(&barang).Error; err != nil {
		return nil, err
	}

	return &barang, nil
}
