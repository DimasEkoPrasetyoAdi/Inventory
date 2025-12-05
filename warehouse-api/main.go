package main

import (
	"log"
	"net/http"

	"warehouse-api/config" // <- ini harus sama dengan nama module di go.mod

	"github.com/gin-gonic/gin"
)

func main() {
	// Inisialisasi koneksi database (pakai .env)
	config.InitDB()

	// Inisialisasi router Gin
	router := gin.Default()

	// Endpoint health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "warehouse-api is running",
			"data":    nil,
		})
	})

	log.Println("🚀 Server running on :8080")
	if err := router.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
