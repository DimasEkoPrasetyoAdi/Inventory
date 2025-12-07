package models

import "time"

type PenjualanHeader struct {
	ID        uint      `gorm:"column:id;primaryKey" json:"id"`
	NoFaktur  string    `gorm:"column:no_faktur" json:"no_faktur"`
	Customer  string    `gorm:"column:customer" json:"customer"`
	Total     float64   `gorm:"column:total" json:"total"`
	UserID    uint      `gorm:"column:user_id" json:"user_id"`
	Status    string    `gorm:"column:status" json:"status"`
	CreatedAt time.Time `gorm:"column:created_at" json:"created_at"`

	User    User              `gorm:"foreignKey:UserID;references:ID" json:"user"`
	Details []PenjualanDetail `gorm:"foreignKey:JualHeaderID;references:ID" json:"details"`
}

func (PenjualanHeader) TableName() string {
	return "jual_header"
}

type PenjualanDetail struct {
	ID           uint    `gorm:"column:id;primaryKey" json:"id"`
	JualHeaderID uint    `gorm:"column:jual_header_id" json:"jual_header_id"`
	BarangID     uint    `gorm:"column:barang_id" json:"barang_id"`
	Qty          int     `gorm:"column:qty" json:"qty"`
	Harga        float64 `gorm:"column:harga" json:"harga"`
	Subtotal     float64 `gorm:"column:subtotal" json:"subtotal"`

	Barang Barang `gorm:"foreignKey:BarangID;references:ID" json:"barang"`
}

func (PenjualanDetail) TableName() string {
	return "jual_detail"
}
