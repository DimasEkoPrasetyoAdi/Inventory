package main

import (
	"log"
	"os"
	"time"
	"warehouse-api/config"
	"warehouse-api/handlers"
	"warehouse-api/middleware"
	"warehouse-api/repositories"

	"github.com/joho/godotenv"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables/defaults")
	}

	config.InitDB()

	router := gin.Default()

	clientOrigin := os.Getenv("CLIENT_PORT")

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{clientOrigin},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	barangRepo := repositories.NewBarangRepository(config.DB)
	stokRepo := repositories.NewStokRepository(config.DB)
	historyRepo := repositories.NewHistoryStokRepository(config.DB)
	pembelianRepo := repositories.NewPembelianRepository(config.DB)
	penjualanRepo := repositories.NewPenjualanRepository(config.DB)
	laporanRepo := repositories.NewLaporanRepository(config.DB)
	userRepo := repositories.NewUserRepository(config.DB)

	barangHandler := handlers.NewBarangHandler(barangRepo)
	stokHandler := handlers.NewStokHandler(stokRepo)
	historyHandler := handlers.NewHistoryStokHandler(historyRepo)
	pembelianHandler := handlers.NewPembelianHandler(pembelianRepo)
	penjualanHandler := handlers.NewPenjualanHandler(penjualanRepo)
	laporanHandler := handlers.NewLaporanHandler(laporanRepo)
	authHandler := handlers.NewAuthHandler(userRepo)

	api := router.Group("/api")

	api.POST("/login", authHandler.Login)
	api.GET("/barang", barangHandler.GetAllBarang)
	api.GET("/barang/:id", barangHandler.GetBarangByID)

	auth := api.Group("/")
	auth.Use(middleware.JWTAuth())
	{

		auth.POST("/barang", barangHandler.CreateBarang)
		auth.PUT("/barang/:id", barangHandler.UpdateBarang)

		auth.GET("/barang/stok", barangHandler.GetBarangWithStok)
		auth.GET("/stok", stokHandler.GetAllStok)
		auth.GET("/stok/:barang_id", stokHandler.GetStokByBarang)
		auth.GET("/history-stok", historyHandler.GetAllHistory)
		auth.GET("/history-stok/:barang_id", historyHandler.GetHistoryByBarang)

		auth.POST("/pembelian", pembelianHandler.CreatePembelian)
		auth.GET("/pembelian", pembelianHandler.GetAllPembelian)
		auth.GET("/pembelian/:id", pembelianHandler.GetPembelianByID)

		auth.POST("/penjualan", penjualanHandler.CreatePenjualan)
		auth.GET("/penjualan", penjualanHandler.GetAllPenjualan)
		auth.GET("/penjualan/:id", penjualanHandler.GetPenjualanByID)

		auth.GET("/laporan/stok", laporanHandler.GetLaporanStok)
		auth.GET("/laporan/penjualan", laporanHandler.GetLaporanPenjualan)
		auth.GET("/laporan/pembelian", laporanHandler.GetLaporanPembelian)
	}

	log.Println("🚀 Server running on :8080")
	if err := router.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
