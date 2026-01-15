// Package state stores the game state
package state

type Card struct {
	Value string `json:"value"`
	Suit  string `json:"suit"`
}

type GameState struct {
	PlayerHands     [][][2]string     `json:"player_hands"`
	PlayerScores    []int             `json:"player_scores"`
	ActiveHandIndex int               `json:"active_hand_index"`
	Dealer          [][2]string       `json:"dealer"`
	DealerScore     int               `json:"dealer_score"`
	Chips           int               `json:"chips"`
	ChipsWon        int               `json:"chips_won"`
	Debt            int               `json:"debt"`
	Powerups        []int             `json:"powerups"`
	PowerupInfo     any               `json:"powerup_info"`
	PlayerSign      string            `json:"player_sign"`
	GameStarted     bool              `json:"game_started"`
	GameOver        bool              `json:"game_over"`
	Winner          string            `json:"winner,omitempty"`
	Victory         bool              `json:"victory"`
	CelestialData   map[string]string `json:"celestial_data"`
}

var CurrentGame *GameState

func InitGame(playerSign string) *GameState {
	CurrentGame = &GameState{
		Chips:      250,
		Debt:       10000,
		PlayerSign: playerSign,
		PlayerHands: [][][2]string{
			{}, // first hand
			{}, // second hand
		},
		PlayerScores:    []int{0, 0},
		Dealer:          [][2]string{}, // empty dealer hand
		Powerups:        []int{},
		PowerupInfo:     []any{},
		GameStarted:     false,
		ActiveHandIndex: 1,
		CelestialData:   map[string]string{},
		GameOver:        false,
		Winner:          "",
		Victory:         false,
	}
	return CurrentGame
}

func GetGame() *GameState {
	return CurrentGame
}

func ResetGame() {
	if CurrentGame != nil {
		CurrentGame.Chips = 250
		CurrentGame.Debt = 10000
		CurrentGame.PlayerSign = ""
		CurrentGame.PlayerHands = make([][][2]string, 2)
		CurrentGame.PlayerScores = []int{0, 0}
		CurrentGame.Dealer = [][2]string{}
		CurrentGame.Powerups = []int{}
		CurrentGame.PowerupInfo = []any{}
		CurrentGame.GameStarted = false
		CurrentGame.ActiveHandIndex = 1
		CurrentGame.CelestialData = map[string]string{}
		CurrentGame.GameOver = false
		CurrentGame.Winner = ""
		CurrentGame.Victory = false
	}
}
