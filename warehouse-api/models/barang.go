package models

import "time"


type Barang struct {
	ID         int       `gorm:"column:id;primaryKey" json:"id"`
	KodeBarang string    `gorm:"column:kode_barang" json:"kode_barang"`
	NamaBarang string    `gorm:"column:nama_barang" json:"nama_barang"`
	Deskripsi  string    `gorm:"column:deskripsi" json:"deskripsi"`
	Satuan     string    `gorm:"column:satuan" json:"satuan"`
	HargaBeli  float64   `gorm:"column:harga_beli" json:"harga_beli"`
	HargaJual  float64   `gorm:"column:harga_jual" json:"harga_jual"`
	CreatedAt  time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt  time.Time `gorm:"column:updated_at" json:"updated_at"`
}


func (Barang) TableName() string {
	return "master_barang"
}

