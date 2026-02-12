package game

type GameState struct {
	PlayerHands     [][][2]string `json:"player_hands"`
	PlayerScores    []int         `json:"player_scores"`
	ActiveHandIndex int           `json:"active_hand_index"`
	Dealer          [][2]string   `json:"dealer"`
	DealerScore     int           `json:"dealer_score"`
	HandAdjustments []int         `json:"hand_adjustments`
	SaturnActive    bool          `json:"saturn_active"`
	Chips           int           `json:"chips"`
	ChipsWon        int           `json:"chips_won"`
	Debt            int           `json:"debt"`
	Powerups        []int         `json:"powerups"`
	PowerupInfo     any           `json:"powerup_info"`
	PlayerSign      string        `json:"player_sign"`
	GameStarted     bool          `json:"game_started"`
	GameOver        bool          `json:"game_over"`
	Winner          string        `json:"winner,omitempty"`
	Victory         bool          `json:"victory"`
}
