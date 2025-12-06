package models

import "time"

type HistoryStok struct {
	ID             uint      `gorm:"column:id;primaryKey" json:"id"`
	BarangID       uint      `gorm:"column:barang_id" json:"barang_id"`
	UserID         uint      `gorm:"column:user_id" json:"user_id"`
	JenisTransaksi string    `gorm:"column:jenis_transaksi" json:"jenis_transaksi"`
	Jumlah         int       `gorm:"column:jumlah" json:"jumlah"`
	StokSebelum    int       `gorm:"column:stok_sebelum" json:"stok_sebelum"`
	StokSesudah    int       `gorm:"column:stok_sesudah" json:"stok_sesudah"`
	Keterangan     string    `gorm:"column:keterangan" json:"keterangan"`
	CreatedAt      time.Time `gorm:"column:created_at" json:"created_at"`

	Barang Barang `gorm:"foreignKey:BarangID;references:ID" json:"barang"`
	User   User   `gorm:"foreignKey:UserID;references:ID" json:"user"`
}

func (HistoryStok) TableName() string {
	return "history_stok"
}
