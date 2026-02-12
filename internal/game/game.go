// Package game contains all the game logic
package game

import (
	"fmt"
)

type CardStack struct {
	Cards [][2]string
}

func (s *CardStack) Push(card [2]string) {
	s.Cards = append(s.Cards, card)
}

func (s *CardStack) Pop() ([2]string, bool) {
	if len(s.Cards) == 0 {
		return [2]string{}, false
	}
	lastValue := len(s.Cards) - 1
	value := s.Cards[lastValue]
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

func InitGame(playerSign string) *GameState {
	return &GameState{
		Chips:      250,
		Debt:       10000,
		PlayerSign: playerSign,
		PlayerHands: [][][2]string{
			{}, // first hand
			{}, // second hand
		},
		HandAdjustments: []int{0, 0},
		SaturnActive:    false,
		PlayerScores:    []int{0, 0},
		Dealer:          [][2]string{}, // empty dealer hand
		Powerups:        []int{0, 2, 3, 4, 5},
		PowerupInfo:     []any{},
		GameStarted:     false,
		ActiveHandIndex: 1,
		GameOver:        false,
		Winner:          "",
		Victory:         false,
	}
}

func StartGame(s *CardStack, gs *GameState) *GameState {
	DrawCard(gs, 0, s)
	DrawCard(gs, 0, s)
	DrawCard(gs, 1, s)
	DrawCard(gs, 0, s)

	return gs
}

func ResetGame(gs *GameState) {
	if gs != nil {
		gs.Chips = 250
		gs.Debt = 10000
		gs.PlayerSign = ""
		gs.PlayerHands = make([][][2]string, 2)
		gs.PlayerScores = []int{0, 0}
		gs.HandAdjustments = []int{0, 0}
		gs.SaturnActive = false
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

func (s *CardStack) PopulateDeck(newDeck [][2]string) {
	s.Cards = newDeck
}

func DrawCard(gs *GameState, handIndex int, deck *CardStack) bool {
	card, ok := deck.Pop()
	if !ok {
		return false
	}
	if handIndex == 0 {
		gs.Dealer = append(gs.Dealer, card)
	}
	if handIndex == 1 {
		gs.PlayerHands[0] = append(gs.PlayerHands[0], card)
	}
	return calcScore(gs, handIndex)
}

func calcScore(gs *GameState, handIndex int) bool {
	rawScore := 0
	aces := 0

	var hand [][2]string

	if handIndex == 0 {
		hand = gs.Dealer
	} else {
		hand = gs.PlayerHands[handIndex-1]
	}

	for _, card := range hand {
		value := card[0]

		if card[1] == "BET" {
			continue
		}

		if value == "ACE" {
			rawScore += 11
			aces++
			continue
		}

		if mapped, exists := ValueMap[value]; exists {
			rawScore += mapped
			continue
		}

		if value != "JOKER" {
			// numeric card (2-10)
			var numeric int
			fmt.Sscanf(value, "%d", &numeric)
			rawScore += numeric
		}

		for rawScore > 21 && aces > 0 {
			rawScore -= 10
			aces--
		}
	}

	for rawScore > 21 && aces > 0 {
		rawScore -= 10
		aces -= 1
	}

	score := rawScore - gs.HandAdjustments[handIndex]

	if handIndex == 0 {
		gs.DealerScore = score
		return score > 21
	}

	gs.PlayerScores[handIndex-1] = score

	if score > 21 && gs.SaturnActive {
		additional := ((score - 1) / 21) * 21
		gs.HandAdjustments[handIndex] += additional
		gs.PlayerScores[handIndex-1] -= additional
		gs.SaturnActive = false
	}

	return score > 21
}

func PerformHit(gs *GameState, rotateAmount int, deck *CardStack) *GameState {
	// TODO : Not nearly finished here
	activeHandIndex := gs.ActiveHandIndex
	busted := DrawCard(gs, activeHandIndex, deck)

	if busted {
		if activeHandIndex < len(gs.PlayerHands)-1 {
			gs.ActiveHandIndex += 1
			return gs
		}
		
		resultStr := GameOver(gs)

		winner := resultStr
		chipsWon := 0

		gs.Winner = winner
		gs.ChipsWon = chipsWon
		gs.GameOver = true

		ResetGame(gs)
		return gs
	}
	
	return gs
}

func GameOver(gs *GameState) string {
	// TODO : Not nearly finished here either
	if gs.DealerScore > gs.PlayerScores[0] {
		return "Dealer Wins"
	} else if gs.DealerScore < gs.PlayerScores[0]{
		return "Player Wins!"
	} else {
		return "Its a tie"
	}
}

func Bet() string{
	// TODO: implement this shieeet buddy 
	return "successful"
}

func Split(gs *GameState) {}
