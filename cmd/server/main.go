package main

import (
	"log"
	"net/http"

	"github.com/joho/godotenv"
	"github.com/maxkoste/Break-Even/internal/api"
)

func main() {
	mux := http.NewServeMux()
	
	api.Register(mux)
	api.Handle(mux)

	godotenv.Load()

	log.Println("Server Running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", mux))
}
