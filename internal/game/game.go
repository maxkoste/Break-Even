// Package game contains all the game logic
package game

import "github.com/maxkoste/Break-Even/internal/state"

type State struct{}

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

func PopulateDeck(){
//TODO: populates the games internal data structure with 
// the cards drawn from the service module 
}

func DrawCard() {}

func StartGame() {}

func UsePowerup() {}

func NextTurn() {}

func GameOver() {}

func DubbleDown() {}

func Split() {}
