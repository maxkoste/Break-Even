package game

import (
	"testing"
)

func Test_calcScore(t *testing.T) {
	tests := []struct {
		name           string
		gs             *GameState
		handIndex      int
		expectedDealer int
		expectedPlayer []int
	}{
		{
			name: "Dealer simple numeric cards",
			gs: &GameState{
				Dealer:          [][2]string{{"10", "H"}, {"7", "S"}},
				HandAdjustments: []int{0, 0},
			},
			handIndex:      0,
			expectedDealer: 17,
		},
		{
			name: "Player face cards",
			gs: &GameState{
				PlayerHands:     [][][2]string{{{"KING", "H"}, {"QUEEN", "S"}}},
				PlayerScores:    []int{0},
				HandAdjustments: []int{0, 0},
			},
			handIndex:      1,
			expectedPlayer: []int{20},
		},
		{
			name: "Soft ace adjustment",
			gs: &GameState{
				PlayerHands:     [][][2]string{{{"ACE", "H"}, {"9", "S"}, {"5", "D"}}},
				PlayerScores:    []int{0},
				HandAdjustments: []int{0, 0},
			},
			handIndex:      1,
			expectedPlayer: []int{15}, // 11+9+5=25 → soft ace → 15
		},
		{
			name: "Saturn wraps score",
			gs: &GameState{
				PlayerHands:     [][][2]string{{{"KING", "H"}, {"KING", "S"}, {"5", "D"}}},
				PlayerScores:    []int{0},
				HandAdjustments: []int{0, 0},
				SaturnActive:    true,
			},
			handIndex:      1,
			expectedPlayer: []int{4}, // 10+10+5=25 → wrap 21 → 4
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			calcScore(tt.gs, tt.handIndex)

			if tt.handIndex == 0 {
				if tt.gs.DealerScore != tt.expectedDealer {
					t.Errorf("expected dealer score %d, got %d",
						tt.expectedDealer,
						tt.gs.DealerScore,
					)
				}
			} else {
				for i, expected := range tt.expectedPlayer {
					if tt.gs.PlayerScores[i] != expected {
						t.Errorf("expected player score %d, got %d",
							expected,
							tt.gs.PlayerScores[i],
						)
					}
				}
			}
		})
	}
}

