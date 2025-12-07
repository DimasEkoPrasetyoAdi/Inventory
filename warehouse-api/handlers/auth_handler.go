package handlers

import (
    "net/http"

    "warehouse-api/repositories"
    "warehouse-api/utils"

    "github.com/gin-gonic/gin"
)

type AuthHandler struct {
    UserRepo *repositories.UserRepository
}

func NewAuthHandler(u *repositories.UserRepository) *AuthHandler {
    return &AuthHandler{UserRepo: u}
}

type LoginRequest struct {
    Username string `json:"username" binding:"required"`
    Password string `json:"password" binding:"required"`
}

func (h *AuthHandler) Login(c *gin.Context) {
    var req LoginRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusUnprocessableEntity, gin.H{"success": false, "message": "Invalid input", "data": nil})
        return
    }

    user, err := h.UserRepo.GetByUsername(req.Username)
    if err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Invalid credentials", "data": nil})
        return
    }

    if !utils.CheckPasswordHash(req.Password, user.Password) {
        c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Invalid credentials", "data": nil})
        return
    }

    token, err := utils.GenerateToken(user.ID, user.Role)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to create token", "data": nil})
        return
    }

    c.JSON(http.StatusOK, gin.H{"success": true, "message": "Login successful", "data": gin.H{"token": token, "user": gin.H{"id": user.ID, "username": user.Username, "full_name": user.FullName, "role": user.Role}}})
}
