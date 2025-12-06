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

func (r *BarangRepository) GetBarangWithStok() ([]models.Stok, error) {
	var stokList []models.Stok

	if err := r.DB.
		Preload("Barang").
		Order("id").
		Find(&stokList).Error; err != nil {
		return nil, err
	}

	return stokList, nil
}

func (r *BarangRepository) CreateBarang(barang *models.Barang) error {
	if err := r.DB.Create(barang).Error; err != nil {
		return err
	}
	return nil
}
