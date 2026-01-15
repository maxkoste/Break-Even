// Package state stores the game state
package state

type Card struct {
	Value string
	Suit  string
}

type GameState struct {
	Chips           int
	Debt            int
	DeckID          string
	Deck            []Card
	Hands           [][]Card
	Scores          []int
	Powerups        []int
	PowerupInfo     []any
	GameStarted     bool
	CelestialData   map[string]string
	PlayerSign      string
	ActiveHandIndex int
	HandAdjustment  []int
}

var CurrentGame *GameState

func InitGame(playerSign string) *GameState {
	CurrentGame = &GameState{
		Chips:           250,
		Debt:            10000,
		DeckID:          "",
		Deck:            []Card{},
		Hands:           [][]Card{{}, {}},
		Scores:          []int{0, 0},
		Powerups:        []int{},
		PowerupInfo:     []any{},
		GameStarted:     false,
		CelestialData:   map[string]string{},
		PlayerSign:      playerSign,
		ActiveHandIndex: 1,
		HandAdjustment:  []int{0, 0},
	}
	return CurrentGame
}

func GetGame()  *GameState{
	return CurrentGame
}

func ResetGame() {
	if CurrentGame != nil {
		CurrentGame.Chips = 250
		CurrentGame.Debt = 10000
		CurrentGame.DeckID = ""
		CurrentGame.Deck = []Card{}
		CurrentGame.Hands = [][]Card{{}, {}}
		CurrentGame.Scores = []int{0, 0}
		CurrentGame.Powerups = []int{}
		CurrentGame.PowerupInfo = []any{}
		CurrentGame.GameStarted = false
		CurrentGame.CelestialData = map[string]string{}
		CurrentGame.PlayerSign = ""
		CurrentGame.ActiveHandIndex = 1
		CurrentGame.HandAdjustment = []int{0, 0}
	}
}
