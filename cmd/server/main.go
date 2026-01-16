package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/joho/godotenv"
	"github.com/maxkoste/Break-Even/internal/api"
	"github.com/maxkoste/Break-Even/internal/services"
)

func main() {
	mux := http.NewServeMux()
	
	api.Register(mux)
	api.Handle(mux)

	deckID := services.NewDeck()

	fmt.Printf("deckID: %s \n", deckID)

	godotenv.Load()

	log.Println("Server Running on http://localhost:8080")
log.Fatal(http.ListenAndServe(":8080", mux))
}
