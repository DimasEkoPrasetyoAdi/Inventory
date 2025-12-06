package main

import (
	"log"
	"warehouse-api/config"
	"warehouse-api/handlers"
	"warehouse-api/repositories"

	"github.com/gin-gonic/gin"
)

func main() {

	config.InitDB()

	router := gin.Default()

	barangRepo := repositories.NewBarangRepository(config.DB)
	barangHandler := handlers.NewBarangHandler(barangRepo)

	api := router.Group("/api")
	{
		api.GET("/barang", barangHandler.GetAllBarang)
		api.GET("/barang/:id", barangHandler.GetBarangByID)
		api.GET("/barang/stok", barangHandler.GetBarangWithStok)
		api.POST("/barang", barangHandler.CreateBarang)
		api.PUT("/barang/:id", barangHandler.UpdateBarang)
	}

	log.Println("🚀 Server running on :8080")
	if err := router.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
