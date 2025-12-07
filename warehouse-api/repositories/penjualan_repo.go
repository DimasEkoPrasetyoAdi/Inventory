package repositories

import (
	"fmt"
	"warehouse-api/models"
	"gorm.io/gorm"
	"time"
)

type PenjualanRepository struct {
	DB *gorm.DB
}

func NewPenjualanRepository(db *gorm.DB) *PenjualanRepository {
	return &PenjualanRepository{DB: db}
}

func (r *PenjualanRepository) CreatePenjualan(header *models.PenjualanHeader, details []models.PenjualanDetail) (*models.PenjualanHeader, error) {
	err := r.DB.Transaction(func(tx *gorm.DB) error {

		header.Status = "selesai"

		if err := tx.Create(header).Error; err != nil {
			return err
		}

		var total float64 = 0

		for i := range details {
			d := &details[i]

			var barang models.Barang
			if err := tx.First(&barang, d.BarangID).Error; err != nil {
				if err == gorm.ErrRecordNotFound {
					return fmt.Errorf("barang_id %d not found", d.BarangID)
				}
				return err
			}

			var stok models.Stok
			if err := tx.
				Where("barang_id = ?", d.BarangID).
				First(&stok).Error; err != nil {

				if err == gorm.ErrRecordNotFound {
					return fmt.Errorf("INSUFFICIENT_STOCK: stok untuk barang_id %d tidak mencukupi", d.BarangID)
				}
				return err
			}

			if stok.StokAkhir < d.Qty {
				return fmt.Errorf("INSUFFICIENT_STOCK: stok untuk barang_id %d tidak mencukupi", d.BarangID)
			}

			d.JualHeaderID = header.ID
			d.Subtotal = float64(d.Qty) * d.Harga
			total += d.Subtotal

			stokSebelum := stok.StokAkhir
			stok.StokAkhir = stok.StokAkhir - d.Qty

			if err := tx.Save(&stok).Error; err != nil {
				return err
			}

			history := models.HistoryStok{
				BarangID:       d.BarangID,
				UserID:         header.UserID,
				JenisTransaksi: "keluar",
				Jumlah:         d.Qty,
				StokSebelum:    stokSebelum,
				StokSesudah:    stok.StokAkhir,
				Keterangan:     fmt.Sprintf("Penjualan %s", header.NoFaktur),
			}

			if err := tx.Create(&history).Error; err != nil {
				return err
			}
		}

		if err := tx.Create(&details).Error; err != nil {
			return err
		}

		header.Total = total
		if err := tx.Save(header).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	var result models.PenjualanHeader
	if err := r.DB.
		Preload("User").
		Preload("Details").
		Preload("Details.Barang").
		First(&result, header.ID).Error; err != nil {
		return nil, err
	}

	return &result, nil
}



func (r *PenjualanRepository) GetAllPenjualan(startDate, endDate string) ([]models.PenjualanHeader, error) {
	var penjualans []models.PenjualanHeader

	tx := r.DB.
		Preload("User").
		Preload("Details").
		Preload("Details.Barang").
		Order("created_at DESC")

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
		return nil, err
	}

	return penjualans, nil
}


func (r *PenjualanRepository) GetPenjualanByID(id uint) (*models.PenjualanHeader, error) {
	var penjualan models.PenjualanHeader

	if err := r.DB.
		Preload("User").
		Preload("Details").
		Preload("Details.Barang").
		First(&penjualan, id).Error; err != nil {
		return nil, err
	}

	return &penjualan, nil
}

