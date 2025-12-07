package utils

import (
    "os"
    "time"

    "github.com/golang-jwt/jwt/v5"
)

type Claims struct {
    UserID uint   `json:"user_id"`
    Role   string `json:"role"`
    jwt.RegisteredClaims
}

func GenerateToken(userID uint, role string) (string, error) {
    secret := os.Getenv("JWT_SECRET")
    if secret == "" {
        secret = "dev_secret"
    }
    expHours := 24
    if v := os.Getenv("JWT_EXPIRES_HOURS"); v != "" {
        // ignore parse error for brevity
        // you can parse and set expHours
    }

    claims := &Claims{
        UserID: userID,
        Role:   role,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * time.Duration(expHours))),
            IssuedAt:  jwt.NewNumericDate(time.Now()),
            Issuer:    "warehouse-api",
        },
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString([]byte(secret))
}

func ParseToken(tokenStr string) (*Claims, error) {
    secret := os.Getenv("JWT_SECRET")
    token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(t *jwt.Token) (any, error) {
        return []byte(secret), nil
    })
    if err != nil {
        return nil, err
    }
    if claims, ok := token.Claims.(*Claims); ok && token.Valid {
        return claims, nil
    }
    return nil, jwt.ErrTokenInvalidClaims
}
