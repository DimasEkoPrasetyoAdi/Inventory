package middleware

import (
    "net/http"
    "strings"

    "warehouse-api/utils"

    "github.com/gin-gonic/gin"
)

func JWTAuth() gin.HandlerFunc {
    return func(c *gin.Context) {
        header := c.GetHeader("Authorization")
        if header == "" {
            c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Missing Authorization header"})
            c.Abort()
            return
        }

        parts := strings.SplitN(header, " ", 2)
        if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
            c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Invalid Authorization header"})
            c.Abort()
            return
        }

        token := parts[1]
        claims, err := utils.ParseToken(token)
        if err != nil {
            c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Invalid or expired token"})
            c.Abort()
            return
        }

        // store user info in context
        c.Set("currentUser", claims) // claims.UserID, claims.Role
        c.Next()
    }
}
