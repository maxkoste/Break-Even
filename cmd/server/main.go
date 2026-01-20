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

	err := godotenv.Load()
	if err != nil {
		fmt.Printf("Error when loading .env\n" )
	}

	log.Println("Server Running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", mux))

}
