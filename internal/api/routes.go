package api

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/maxkoste/Break-Even/internal/state"
)

func Register(mux *http.ServeMux) {
	mux.HandleFunc("/api/ping", ping)
	mux.HandleFunc("/api/init-game-state", initGameState)
	mux.HandleFunc("/reset", reset)
	mux.HandleFunc("/api/deal", deal)
	mux.HandleFunc("/api/hit", hit)
	mux.HandleFunc("/api/stand", stand)
	mux.HandleFunc("/api/split", splitAction)
	mux.HandleFunc("/api/use_powerup", usePowerup)
	mux.HandleFunc("/api/draw_card_by_index", drawCardByIndex)
}

func ping(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"status":"ok"}`))
}

func initGameState(w http.ResponseWriter, r *http.Request) {
	fmt.Println("init game state was called")

	var payload struct {
		SelectedSign string `json:"selectedSign"`
	}

	_ = json.NewDecoder(r.Body).Decode(&payload)

	game := state.InitGame(payload.SelectedSign)

	w.Header().Set("Content-Type",  "application/json")

	json.NewEncoder(w).Encode(game)

	gameJSON, _ := json.MarshalIndent(game, "", "  ")

	fmt.Printf("Game Data: %s \n", string(gameJSON))
}

func reset(w http.ResponseWriter, r *http.Request) {
	fmt.Println("reset was called")
}

func deal(w http.ResponseWriter, r *http.Request) {
	// Struct for storing the JSON data
	var payload struct {
		Bet int `json:"bet"`
	}
	// decode JSON from the request body, ignoring errors for now
	_ = json.NewDecoder(r.Body).Decode(&payload)

	fmt.Println("deal was called with bet:", payload.Bet)
}

func hit(w http.ResponseWriter, r *http.Request) {
	fmt.Println("hit was called")
}

func stand(w http.ResponseWriter, r *http.Request) {
	fmt.Println("stand was called")
}

func splitAction(w http.ResponseWriter, r *http.Request) {
	fmt.Println("splitAction was called")
}

func usePowerup(w http.ResponseWriter, r *http.Request) {

	var payload struct {
		Powerup string `json:"num"`
	}

	_ = json.NewDecoder(r.Body).Decode(&payload)

	w.Write([]byte(`{"status":"ok"}`))

	fmt.Println("usePowerup was called")
}

func drawCardByIndex(w http.ResponseWriter, r *http.Request) {
	fmt.Println("drawCardByIndex was called")
}

func newBlackJackDeck() {
	fmt.Println("newBlackJackDeck was called")
}

func drawCards(deckID string, count int) {
	fmt.Println("drawCards was called")
}

func getCelestialData() {
	fmt.Println("getCelestialData was called")
}
