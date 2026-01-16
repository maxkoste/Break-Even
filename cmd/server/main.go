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

	godotenv.Load()

	services.SayHello()

	data,error := services.FetchCelestialData()

	if error != nil {
		fmt.Println("Error when gathering celestial data")
	}

	for body, constel := range data.Bodies{
		fmt.Printf("%s: %s: ", body, constel)
	}

	fmt.Println("Moon phase ", data.MoonPhase)

	log.Println("Server Running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", mux))

}
