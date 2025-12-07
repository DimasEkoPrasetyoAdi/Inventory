package repositories

import (
	"fmt"
	"warehouse-api/models"
	"gorm.io/gorm"
	"time"
)

type PembelianRepository struct {
	DB *gorm.DB
}

func NewPembelianRepository(db *gorm.DB) *PembelianRepository {
	return &PembelianRepository{DB: db}
}

func (r *PembelianRepository) CreatePembelian(header *models.PembelianHeader, details []models.PembelianDetail) (*models.PembelianHeader, error) {
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

			d.BeliHeaderID = header.ID
			d.Subtotal = float64(d.Qty) * d.Harga
			total += d.Subtotal

			var stok models.Stok
			if err := tx.
				Where("barang_id = ?", d.BarangID).
				First(&stok).Error; err != nil {

				if err == gorm.ErrRecordNotFound {

					stok = models.Stok{
						BarangID:  d.BarangID,
						StokAkhir: d.Qty,
					}
					if err := tx.Create(&stok).Error; err != nil {
						return err
					}
				} else {
					return err
				}
			} else {

				stokSebelum := stok.StokAkhir
				stok.StokAkhir = stok.StokAkhir + d.Qty
				if err := tx.Save(&stok).Error; err != nil {
					return err
				}

				history := models.HistoryStok{
					BarangID:       d.BarangID,
					UserID:         header.UserID,
					JenisTransaksi: "masuk",
					Jumlah:         d.Qty,
					StokSebelum:    stokSebelum,
					StokSesudah:    stok.StokAkhir,
					Keterangan:     fmt.Sprintf("Pembelian %s", header.NoFaktur),
				}
				if err := tx.Create(&history).Error; err != nil {
					return err
				}
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

	var result models.PembelianHeader
	if err := r.DB.
		Preload("User").
		Preload("Details").
		Preload("Details.Barang").
		First(&result, header.ID).Error; err != nil {
		return nil, err
	}

	return &result, nil
}

func (r *PembelianRepository) GetAllPembelian(startDate, endDate string) ([]models.PembelianHeader, error) {
	var pembelians []models.PembelianHeader

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

	if err := tx.Find(&pembelians).Error; err != nil {
		return nil, err
	}

	return pembelians, nil
}
