package config

import (
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {

	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using existing environment variables")
	}

	host := getEnv("DB_HOST", "")
	portStr := getEnv("DB_PORT", "")
	user := getEnv("DB_USER", "postgres")
	password := getEnv("DB_PASSWORD", "")
	dbname := getEnv("DB_NAME", "")
	sslmode := getEnv("DB_SSLMODE", "")

	port, err := strconv.Atoi(portStr)
	if err != nil {
		log.Fatalf("Invalid DB_PORT value: %v", err)
	}

	dsn := fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		host, port, user, password, dbname, sslmode,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to open db connection: %v", err)
	}

	log.Println("✅ Connected to database (GORM)")
	DB = db
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
