# Break Even  
A tiny 8-bit blackjack descent into desperation.

## Premise

You’re Mike.  
You’re a washed-up, pixelated gambler with a talent for bad decisions and exactly $250 left in chips.

Your phone buzzes.  
It’s your wife, furious again:  
“Where are you? I hope you’re not out there gambling again, Mike!”

Too late.  
You’re already $10,000 in the hole.  
Your only goal now is to claw your way back to zero before the last chip disappears and your life collapses into a heap of 8-bit shame.

Welcome to *Break Even* — a blackjack simulator about pressure, probability, and poor life choices.

## What This Is

A game hosted on the web built with a JavaScript frontend and a Python backend. The game simulates blackjack with the single objective of returning your balance to zero. You start with $250. You will almost certainly lose. That’s part of the charm.

No casinos.  
No flashy animations.  
Just you, the deck, and a mounting sense that Mike might never emotionally recover from this.

### Features
- A simple, responsive browser UI written in JavaScript.
- A Python backend that handles shuffling, dealing, hit/stand logic, and balance updates.
- A persistent running total of your monstrous debt.
- The hollow thrill of chasing losses in retro 8-bit style.

### Gameplay Loop
1. Start at –$10,000.  
2. Hold $200 in chips.  
3. Play blackjack hands and try to climb back to zero.  
4. If you hit zero, you “break even” and Mike can go home with something resembling dignity.  
5. If you bust your last chip, you lose the game and face the music.

### Tech Overview

**Frontend:**  
- JavaScript  
- Simple UI rendering  
- Fetch requests to communicate with the backend  

**Backend:**  
- Python  
- Deck of Cards API
- Astronomy API
- Returns hand results, updated balance, celestial data, powerups, and game state  


### Instructions

**Install instructions**
1. Clone the repository with git or download the zip file from GitHub:
git clone https://github.com/Love335/BreakEven.git

If you download the zip file, unpack it on your computer.

2. Create and activate a Python virtual environment:
python -m venv .venv
source .venv/bin/activate (macOS/Linux)
.venv\Scripts\activate (Windows)

3. Install dependencies:
pip install -r requirements.txt

4. Create a .env file in the project root with your API keys. Example:
ASTRONOMY_APP_ID = your_astronomy_app_id
ASTRONOMY_APP_SECRET = your_astronomy_app_secret
Note: the .env file should not be uploaded to GitHub or shared publicly.

**Running the Game**
1. Activate the Python environment (if not already active).

2. Start the backend server:
flask --debug --app src/app run (with automatic reload)
flask --app src/app run (without automatic reload)

3. Open your web browser and go to http://localhost:5000/



# BreakEven - API Documentation

BreakEven is a web-based Blackjack game built as a mashup project.
The game combines traditional Blackjack mechanics with data from
external APIs to create a unique experience using astrology-based
powerups.

The application is developed as part of a university course and is
intended for educational purposes.

## External APIs

### Deck of Cards API
Used to create and shuffle Blackjack decks and draw cards.

https://deckofcardsapi.com/

### Astronomy API
Used to retrieve celestial body positions and constellation data,
which are then used to assign powerups to the player.

https://astronomyapi.com/

### POST /api/init-game-state

Initializes the game state when a new session starts.

This endpoint:
- Stores the player’s selected zodiac sign
- Fetches live celestial data from the Astronomy API
- Creates a new shuffled card deck
- Returns a combined “mashup” response containing all initial data

**Request body**
```json
{
  "selectedSign": "sagittarius"
}
```
**Response (example)**
```json
{
  "celestial_data": {
    "Sun": "Sagittarius",
    "Moon": "Libra",
    "Mars": "Sagittarius"
  },
  "deck_ready": true,
  "game_state": {
    "chips": 200,
    "player_sign": "sagittarius",
    "player_hands": [],
    "dealer": [],
    "game_started": true,
    "game_over": false
  }
}

```
### POST /api/deal

Starts a new round of Blackjack.

This endpoint:
- Places the player’s bet
- Deals the initial cards
- Updates the game state

**Request body**
```json
{
  "bet": 50
}
```
**Response (example)**
```json
{
  "active_hand_index": 0,
  "chips": 150,
  "dealer": [
    ["6", "SPADES"],
    ["10", "HEARTS"]
  ],
  "player_hands": [
    [
      [50, "BET"],
      ["7", "DIAMONDS"],
      ["4", "SPADES"]
    ]
  ],
  "player_scores": [11],
  "game_over": false,
  "winner": null
}
```
**Error Response**

- 400 Bad Request – Invalid bet value or deck not initialized

## GET /api/hit

Draws one card for the player. If the player busts, the round ends automatically and the game state
is updated.

**Response (example)**
```json
{
  "player_hands": [
    [
      [50, "BET"],
      ["2", "CLUBS"],
      ["JOKER", "RED"],
      ["KING", "SPADES"]
    ]
  ],
  "player_scores": [12],
  "game_over": false,
  "winner": null
}
```
## GET /api/stand

Ends the player’s turn and plays the dealer’s turn automatically.

This endpoint:
- Executes the dealer’s draw logic
- Determines the winner
- Updates chips and game state

**Response (example)**
```json
{
  "dealer": [
    ["6", "SPADES"],
    ["10", "HEARTS"],
    ["10", "CLUBS"]
  ],
  "dealer_score": 26,
  "player_scores": [21],
  "chips": 250,
  "game_over": true,
  "winner": "Player wins! Dealer busted"
}
```

## POST /api/split

Splits the player’s current hand into two separate hands.

This endpoint can only be used when:
- The player has exactly two cards
- Both cards have the same value
- The player has enough chips to place an additional bet

**Response**
Returns the updated game state if the split was successful.
```json
{
  "game_state": { "...": "..." }
}
```

**Error Response**
```
{
  "error": "Split not allowed for this hand"
}
```

## POST /api/use_powerup

Applies a power-up to the current game state.

Power-ups are unlocked based on celestial data and the player’s zodiac sign.

**Request Body**
```json
{
  "num": 5
}
```
**Response**
Returns the updated game state after the power-up has been applied.
```json
{
  "game_state": { "...": "..." }
}
```

## POST /api/draw_card_by_index

Draws a card from the deck at a specified index. 
The deck is rotated to the given index before drawing the card.
This endpoint is primarily used by power-ups that allow card preview
or manipulation.

**Request body**
```json
{
  "index": 5
}
```
**Response**
Returns the updated game state after the draw.
```json
{
  "game_state": { "...": "..." }
}
```

## POST /reset

Resets the entire game state and redirects the user to the landing page.

This endpoint:
- Clears all game data
- Resets chips and power-ups
- Restarts the session

**Response**
- HTTP redirect to /

## API Notes

- All API endpoints are intended for internal use by the frontend and are not designed as a public API.
- The backend integrates with the following external services:
  - **Deck of Cards API** – used for creating and drawing cards from blackjack decks.
  - **Astronomy API** – used to retrieve celestial data that affects in-game power-ups.
- Environment variables are required for the Astronomy API and must be provided in a `.env` file:
  - `ASTRONOMY_APP_ID`
  - `ASTRONOMY_APP_SECRET`
- The `.env` file should never be committed to version control.
