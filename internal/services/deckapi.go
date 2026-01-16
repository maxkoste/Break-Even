package services

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

func NewDeck() string {
	url := "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6&jokers_enabled=true"
	data, err := http.Get(url)
	if err != nil {
		fmt.Println("{DECK OF CARDS API} HTTP request failed ")
	}

	body, err := io.ReadAll(data.Body)
	if err != nil {
		fmt.Println("{DECK OF CARDS API} Reading body failed ")
	}

	var jsonResp map[string]any
	json.Unmarshal(body, &jsonResp)

	deckID := jsonResp["deck_id"].(string)

	return deckID
}

func DrawCards(deckID string, count int) [][2]string {
	url := fmt.Sprintf(
		"https://deckofcardsapi.com/api/deck/%s/draw/?count=%d",
		deckID,
		count,
	)

	data, err := http.Get(url)
	if err != nil {
		fmt.Println("{DECK OF CARDS API} HTTP request failed when drawing cards ")
	}

	body, err := io.ReadAll(data.Body)
	if err != nil {
		fmt.Println("{DECK OF CARDS API} Reading body failed when drawing cards")
	}

	var jsonResp map[string]any
	json.Unmarshal(body, &jsonResp)

	cards := make([][2]string, 0)

	for _, card := range jsonResp["cards"].([]any) {
		c := card.(map[string]any)
		value := c["value"].(string)
		suit := c["suit"].(string)
		cards = append(cards, [2]string{value, suit})
	}

	return cards
}
