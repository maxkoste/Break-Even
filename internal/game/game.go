// Package game contains all the game logic
package game

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

func StartGame() {}

func UsePowerup() {}

func NextTurn() {}

func GameOver() {}

func DubbleDown() {}

func Split() {}
