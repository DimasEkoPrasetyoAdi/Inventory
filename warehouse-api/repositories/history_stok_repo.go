package repositories

import (
	"warehouse-api/models"

	"gorm.io/gorm"
)

type HistoryStokRepository struct {
	DB *gorm.DB
}

func NewHistoryStokRepository(db *gorm.DB) *HistoryStokRepository {
	return &HistoryStokRepository{DB: db}
}

func (r *HistoryStokRepository) GetAllHistory() ([]models.HistoryStok, error) {
	var histories []models.HistoryStok

	if err := r.DB.
		Preload("Barang").
		Preload("User").
		Order("created_at DESC").
		Find(&histories).Error; err != nil {
		return nil, err
	}

	return histories, nil
}

func (r *HistoryStokRepository) GetHistoryByBarangID(barangID uint) ([]models.HistoryStok, error) {
	var histories []models.HistoryStok

	if err := r.DB.
		Preload("Barang").
		Preload("User").
		Where("barang_id = ?", barangID).
		Order("created_at DESC").
		Find(&histories).Error; err != nil {
		return nil, err
	}

	return histories, nil
}
