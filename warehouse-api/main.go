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

	stokRepo := repositories.NewStokRepository(config.DB)
	stokHandler := handlers.NewStokHandler(stokRepo)

	historyRepo := repositories.NewHistoryStokRepository(config.DB)
	historyHandler := handlers.NewHistoryStokHandler(historyRepo)

	pembelianRepo := repositories.NewPembelianRepository((config.DB))
	pembelianHandler := handlers.NewPembelianHandler(pembelianRepo)

	penjualanRepo := repositories.NewPenjualanRepository(config.DB)
	penjualanHandler := handlers.NewPenjualanHandler(penjualanRepo)

	api := router.Group("/api")
	{
		api.GET("/barang", barangHandler.GetAllBarang)
		api.GET("/barang/:id", barangHandler.GetBarangByID)
		api.GET("/barang/stok", barangHandler.GetBarangWithStok)
		api.POST("/barang", barangHandler.CreateBarang)
		api.PUT("/barang/:id", barangHandler.UpdateBarang)
		api.GET("/stok", stokHandler.GetAllStok)
		api.GET("/stok/:barang_id", stokHandler.GetStokByBarang)
		api.GET("/history-stok", historyHandler.GetAllHistory)
		api.GET("/history-stok/:barang_id", historyHandler.GetHistoryByBarang)
		api.POST("/pembelian", pembelianHandler.CreatePembelian)
		api.GET("/pembelian", pembelianHandler.GetAllPembelian)
		api.GET("/pembelian/:id", pembelianHandler.GetPembelianByID)
		api.POST("/penjualan", penjualanHandler.CreatePenjualan)
		api.GET("/penjualan", penjualanHandler.GetAllPenjualan)
		api.GET("/penjualan/:id", penjualanHandler.GetPenjualanByID)
	}

	log.Println("🚀 Server running on :8080")
	if err := router.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
