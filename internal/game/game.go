// Package game contains all the game logic
package game

import (
	"github.com/maxkoste/Break-Even/internal/state"
)

type Stack struct {
	Cards [][2]string
}

func(s *Stack) Push(card [2]string){
	s.Cards = append(s.Cards, card)
}

func(s *Stack) Pop() ([2]string, bool){
	if len(s.Cards)==0{
		return [2]string{}, false
	}
	lastValue := len(s.Cards)-1
	value:=s.Cards[lastValue]
	s.Cards = s.Cards[:lastValue]

	return value, true
}


var ValueMap = map[string]int{
	"ACE":   11,
	"JACK":  10,
	"QUEEN": 10,
	"KING":  10,
}

var BodyPowerups = map[string]int{
	"Moon":    0,
	"Sun":     1,
	"Mercury": 2,
	"Venus":   3,
	"Earth":   4,
	"Mars":    5,
	"Jupiter": 6,
	"Saturn":  7,
	"Uranus":  8,
	"Neptune": 9,
	"Pluto":   10,
}

func InitGame(playerSign string) *state.GameState {

	return &state.GameState{
		Chips:      250,
		Debt:       10000,
		PlayerSign: playerSign,
		PlayerHands: [][][2]string{
			{}, // first hand
			{}, // second hand
		},
		PlayerScores:    []int{0, 0},
		Dealer:          [][2]string{}, // empty dealer hand
		Powerups:        []int{0,2,3,4,5},
		PowerupInfo:     []any{},
		GameStarted:     false,
		ActiveHandIndex: 1,
		GameOver:        false,
		Winner:          "",
		Victory:         false,
	}
}

func StartGame(s *Stack, gs *state.GameState){
	DrawCard(gs, 0, s)
	DrawCard(gs, 0, s)
	DrawCard(gs, 1, s)
	DrawCard(gs, 1, s)
}

func ResetGame(gs *state.GameState) {
	if gs != nil {
		gs.Chips = 250
		gs.Debt = 10000
		gs.PlayerSign = ""
		gs.PlayerHands = make([][][2]string, 2)
		gs.PlayerScores = []int{0, 0}
		gs.Dealer = [][2]string{}
		gs.Powerups = []int{}
		gs.PowerupInfo = []any{}
		gs.GameStarted = false
		gs.ActiveHandIndex = 1
		gs.GameOver = false
		gs.Winner = ""
		gs.Victory = false
	}
}

func (s *Stack) PopulateDeck(newDeck [][2]string){
	s.Cards = newDeck
}

func DrawCard(gs *state.GameState, handIndex int, deck *Stack) {
	card, ok := deck.Pop()
	if !ok{
		return
	}
	if handIndex == 0 {
		gs.Dealer = append(gs.Dealer, card)
	}
	if handIndex == 1 {
		gs.PlayerHands[0] = append(gs.PlayerHands[0], card)
	}
}

func UsePowerup() {}

func NextTurn() {}

func GameOver(gs *state.GameState) {}

func DubbleDown() {}

func Split(gs *state.GameState) {}
