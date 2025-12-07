//go:build hashusers
// +build hashusers

// tools/hash_users.go
package main

import (
	"fmt"
	"log"

	"warehouse-api/config"
	"warehouse-api/models"

	"golang.org/x/crypto/bcrypt"
)

func hashPassword(pw string) (string, error) {
	b, err := bcrypt.GenerateFromPassword([]byte(pw), bcrypt.DefaultCost)
	return string(b), err
}

func main() {
	config.InitDB()
	db := config.DB 

	var users []models.User
	if err := db.Find(&users).Error; err != nil {
		log.Fatal("failed to fetch users:", err)
	}

	for _, u := range users {
		plain := u.Password

		if _, err := bcrypt.Cost([]byte(plain)); err == nil {
			fmt.Printf("skip (valid bcrypt): %s\n", u.Username)
			continue
		}

		hashed, err := hashPassword(plain)
		if err != nil {
			log.Fatalf("failed to hash for user %s: %v", u.Username, err)
		}

		if err := db.Model(&models.User{}).Where("id = ?", u.ID).Update("password", hashed).Error; err != nil {
			log.Fatalf("failed to update password for %s: %v", u.Username, err)
		}
		fmt.Printf("updated user %s\n", u.Username)
	}

	fmt.Println("done")
}
