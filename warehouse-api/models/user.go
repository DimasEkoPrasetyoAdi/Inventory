package models

import "time"

type User struct {
	ID       uint   `gorm:"column:id;primaryKey" json:"id"`
	Username string `gorm:"column:username" json:"username"`
	Password string `gorm:"column:password" json:"-"`
	Email    string `gorm:"column:email" json:"email"`
	FullName string `gorm:"column:full_name" json:"full_name"`
	Role     string `gorm:"column:role" json:"role"`

	CreatedAt time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at" json:"updated_at"`
}

func (User) TableName() string {
	return "users"
}
