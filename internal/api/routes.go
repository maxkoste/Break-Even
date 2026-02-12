package api

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/maxkoste/Break-Even/internal/game"
	"github.com/maxkoste/Break-Even/internal/services"
)

var currentGame *game.GameState // routes.go owns the game state for now

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

// Test
func ping(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"status":"ok"}`))
}

func initGameState(w http.ResponseWriter, r *http.Request) {

	var payload struct {
		SelectedSign string `json:"selectedSign"`
	}

	_ = json.NewDecoder(r.Body).Decode(&payload)

	celestialData, err := services.FetchCelestialData()
	if err != nil {
		fmt.Println("Error when fetching celestial data")
	}

	currentGame := game.InitGame(payload.SelectedSign)

	response := struct {
		CelestialData *services.CelestialData `json:"celestial_data"`
		DeckReady     bool                    `json:"deck_ready"`
		GameState     *game.GameState        `json:"game_state"`
	}{
		CelestialData: celestialData,
		DeckReady: false,
		GameState: currentGame,
	}

	deckID := services.NewDeck()
	cards := services.DrawCards(deckID, 324)
	
	cardStack := &game.CardStack{}
	cardStack.PopulateDeck(cards)
	game.StartGame(cardStack, currentGame)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)

	// gameJSON, _ := json.MarshalIndent(response, "", "  ")
	// fmt.Printf("Game Data: %s \n", string(gameJSON))
}

func reset(w http.ResponseWriter, r *http.Request) {
	fmt.Println("reset was called")

	game.ResetGame(currentGame)
}

func deal(w http.ResponseWriter, r *http.Request) {
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

}
