package models

import "time"


type Stok struct{
	ID        uint      `gorm:"column:id;primaryKey" json:"id"`
	BarangID  uint      `gorm:"column:barang_id" json:"barang_id"`
	StokAkhir int       `gorm:"column:stok_akhir" json:"stok_akhir"`
	UpdatedAt time.Time `gorm:"column:updated_at" json:"updated_at"`

	Barang Barang `gorm:"foreignKey:BarangID;references:ID" json:"barang"`
}

func (Stok) TableName() string {
	return "mstok"
}