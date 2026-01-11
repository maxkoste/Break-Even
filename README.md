# Break Even  
A tiny 8-bit blackjack descent into desperation.

## Premise

You’re Mike.  
You’re a washed-up, pixelated gambler with a talent for bad decisions and exactly $200 left in chips.

Your phone buzzes.  
It’s your wife, furious again:  
“Where are you? I hope you’re not out there gambling again, Mike!”

Too late.  
You’re already $10,000 in the hole.  
Your only goal now is to claw your way back to zero before the last chip disappears and your life collapses into a heap of 8-bit shame.

Welcome to *Break Even* — a blackjack simulator about pressure, probability, and poor life choices.

## What This Is

A game hosted on the web built with a JavaScript frontend and a Python backend. The game simulates blackjack with the single objective of returning your balance to zero. You start with $200. You will almost certainly lose. That’s part of the charm.

No casinos.  
No flashy animations.  
Just you, the deck, and a mounting sense that Mike might never emotionally recover from this.

### Features
- A simple, responsive browser UI written in JavaScript.
- A Python backend that handles shuffling, dealing, hit/stand logic, and balance updates.
- A persistent running total of your monstrous debt.
- Text messages from your wife reminding you what’s at stake.
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
- Returns hand results, updated balance, and game state  


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
  "selectedSign": "leo"
}

**Response**
```json
{
  "Celestial Data": {
    "Sun": "Leo",
    "Moon": "Cancer",
    "Mars": "Aries"
  },
  "Deck Data": {
    "deck_id": "3p40paa87x90",
    "remaining": 324
  },
  "Game State": {
    "chips": 200,
    "hands": [],
    "scores": []
  }
}

### POST /api/deal

Starts a new round of Blackjack

- Places the player’s bet
- Creates a new multi-deck Blackjack deck
- Draws all cards needed for the round
- Deals the initial hands

**Request body**
```json
{
  "bet": 50
}

**Response**
```json
{
  "chips": 150,
  "hands": [
    [["KING", "HEARTS"], ["7", "CLUBS"]],
    [["9", "SPADES"], ["HIDDEN", "CARD"]]
  ],
  "scores": [17, 9],
  "currentTurn": "player"
}

**Error Response**

- 400 Bad Request – Invalid or missing bet value

## GET /api/hit

Draws one card for the player

If the player busts:
- The round ends immediately
- The winner is determined
- The game state is updated

**Response**
```json
{
  "hands": [
    [["KING", "HEARTS"], ["7", "CLUBS"], ["5", "DIAMONDS"]]
  ],
  "scores": [22],
  "gameOver": true,
  "winner": "dealer"
}

## GET /api/stand

Ends the player’s turn and plays the dealer’s turn automatically.

This endpoint:
- Executes the dealer’s draw logic
- Determines the winner
- Updates chips and game state

**Response**
```json
{
  "hands": [
    [["10", "HEARTS"], ["8", "SPADES"]],
    [["9", "DIAMONDS"], ["7", "CLUBS"], ["5", "HEARTS"]]
  ],
  "scores": [18, 21],
  "winner": "dealer",
  "gameOver": true
}

## POST /api/use_powerup

Applies a power-up to the current game state.

Power-ups are unlocked based on celestial data and the player’s zodiac sign.

**Request Body**
```json
{
  "num": 5
}

**Response**
```json
{
  "hands": [...],
  "scores": [...],
  "powerups": [...],
  "powerupInfo": {
    "Planet": "Mars",
    "Player Sign": "aries"
  }
}

## GET /api/state

Returns the current game state.

This endpoint exists mainly for debugging and development purposes.

**Response**
```json
{
  "chips": 120,
  "hands": [...],
  "scores": [...],
  "currentTurn": "player"
}

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
