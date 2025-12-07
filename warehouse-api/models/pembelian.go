package models

import "time"


type PembelianHeader struct {
	ID       uint    `gorm:"column:id;primaryKey" json:"id"`
	NoFaktur string  `gorm:"column:no_faktur" json:"no_faktur"`
	Supplier string  `gorm:"column:supplier" json:"supplier"`
	Total    float64 `gorm:"column:total" json:"total"`
	UserID   uint    `gorm:"column:user_id" json:"user_id"`
	Status   string  `gorm:"column:status" json:"status"`

	CreatedAt time.Time `gorm:"column:created_at" json:"created_at"`

	User    User               `gorm:"foreignKey:UserID;references:ID" json:"user"`
	Details []PembelianDetail  `gorm:"foreignKey:BeliHeaderID;references:ID" json:"details"`
}

func (PembelianHeader) TableName() string {
	return "beli_header"
}


type PembelianDetail struct {
	ID           uint    `gorm:"column:id;primaryKey" json:"id"`
	BeliHeaderID uint    `gorm:"column:beli_header_id" json:"beli_header_id"`
	BarangID     uint    `gorm:"column:barang_id" json:"barang_id"`
	Qty          int     `gorm:"column:qty" json:"qty"`
	Harga        float64 `gorm:"column:harga" json:"harga"`
	Subtotal     float64 `gorm:"column:subtotal" json:"subtotal"`

	Barang Barang `gorm:"foreignKey:BarangID;references:ID" json:"barang"`
}

func (PembelianDetail) TableName() string {
	return "beli_detail"
}
