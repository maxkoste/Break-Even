from flask import Flask, render_template, jsonify, request, redirect
import requests, base64
import logic
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

app = Flask(__name__)

@app.route("/")
def main():
    """
    Renders the landing page of the application.
    """
    return render_template("index.html")


@app.route("/game")
def game():
    """
    Renders the main game page.

    If the player has no chips left, the game over page is shown instead.
    """
    if logic.chips <= 0:
        return render_template("game_over.html")

    return render_template("game.html", chips=logic.chips)

@app.route("/game-over")
def game_over():
    """
    Renders the game over page.
    """
    return render_template("game_over.html")

@app.route("/api/init-game-state", methods =["POST"])
def init_game_state():
    """
    Initializes the game state by combining data from multiple APIs.

    Stores the player's sign, fetches celestial data, creates a new card deck,
    and returns the initial game state as a mashup response.
    """
    player_sign = request.get_json()
    logic.set_player_sign(player_sign)

    celestial_data = get_celestial_data()

    deck_id = new_blackjack_deck()
    cards = draw_cards(deck_id, 324)
    logic.populate_deck(cards)

    logic.bet(50)
    logic.start_game()

    #This is the mashup api endpoint that gives the user combined data from the api:s
    return {
        "Celestial Data" : celestial_data,
        "Deck Ready": True,
        "Game State": logic.game_state()
    }


@app.route("/reset", methods=["POST"])
def reset():
    """
    Resets the game state and redirects to the landing page.
    """
    logic.reset_game()
    return redirect("/")


@app.route("/api/state")  # This route should not exist. Proper initial load method preferred.
def state():
    """
    Returns the current game state as JSON.
    """
    return jsonify(logic.game_state())


@app.route("/api/deal", methods=["POST"])
def deal():
    """
    Starts a new round by placing a bet, creating a new deck,
    and dealing initial cards.
    """
    data = request.get_json()
    bet = data.get("bet")

    if not isinstance(bet, int) or bet <= 0:
        return jsonify({"error": "Invalid bet"}), 400

    if not logic.deck_ready():
        return jsonify({"error": "Deck not initialized"}), 400

    logic.bet(bet)
    return jsonify(logic.start_game())


def new_blackjack_deck():
    """
    Requests a new shuffled Blackjack deck from the Deck of Cards API.

    Returns:
        str: The ID of the newly created deck.
    """
    url = "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6&jokers_enabled=true"
    response = requests.get(url)
    data = response.json()
    deck_id = data["deck_id"]
    return deck_id


def draw_cards(deck_id, count):
    """
    Draws a specified number of cards from a deck using the Deck of Cards API.

    Args:
        deck_id (str): The ID of the deck.
        count (int): Number of cards to draw.

    Returns:
        list[tuple]: List of cards as (value, suit).
    """
    url = f"https://deckofcardsapi.com/api/deck/{deck_id}/draw/?count={count}"
    response = requests.get(url)
    data = response.json()
    cards = [(card["value"], card["suit"]) for card in data["cards"]]
    return cards

def get_celestial_data():
    """
    Fetches celestial body positions from the Astronomy API.

    Retrieves current constellation data and stores it in the game logic.

    Returns:
        dict: A mapping of celestial body names to constellation names.
    """
    app_id = os.getenv("ASTRONOMY_APP_ID")
    app_secret = os.getenv("ASTRONOMY_APP_SECRET")

    auth_str = base64.b64encode(f"{app_id}:{app_secret}".encode()).decode()

    url = "https://api.astronomyapi.com/api/v2/bodies/positions"

    today = datetime.now().strftime("%Y-%m-%d")
    current_time = datetime.now().strftime("%H:%M:%S")

    params = {
        "latitude": "55.6050",
        "longitude": "13.0038",
        "elevation": "12",
        "from_date": today,
        "to_date": today,
        "time": current_time,
    }

    headers = {"Authorization": f"Basic {auth_str}"}

    response = requests.get(url, headers=headers, params=params)
    data = response.json()

    results = {}
    moon_phase = None

    rows = data["data"]["table"]["rows"]

    for row in rows:
        body_name = row["entry"]["name"]
        cell = row["cells"][0]

        constellation = cell["position"]["constellation"]["name"]
        results[body_name] = constellation

        if row["entry"]["id"] == "moon":
            moon_phase = cell["extraInfo"]["phase"]["string"]

    celestial_data = results

    logic.set_celestial_data(results)

    return results


@app.route("/api/hit")
def hit():
    """
    Handles the player hit action by drawing a card.

    Ends the round if the player busts.
    """
    hand_index = logic.active_hand_index
    busted = logic.draw_card(hand_index)

    if busted:
        # If there are more split hands, move to the next one instead of ending the round
        if hand_index < len(logic.hands) - 1:
            logic.active_hand_index += 1
            return jsonify(logic.game_state())

        winner = logic.game_over()
        result = logic.game_state(winner, game_over=True)
        logic.next_turn(winner)
        return jsonify(result)

    return jsonify(logic.game_state())


@app.route("/api/stand")
def stand():
    """
    Handles the player stand action and plays the dealer's turn.
    """
    result = logic.stand()
    if result.get("game_over"):
        logic.next_turn(result.get("winner"))
  
    return jsonify(result)

@app.route("/api/split", methods=["POST"])
def split_action():
    result = logic.split()
    if "successful" in result:
        return jsonify(logic.game_state())
    
    return jsonify({"error": result}), 400


@app.route("/api/use_powerup", methods=["POST"])
def use_powerup():
    """
    Applies a selected power-up to the current game state.
    """
    data = request.get_json()
    powerup = data.get("num")
    
    return jsonify(logic.use_powerup(powerup))

@app.route("/api/draw_card_by_index", methods=["POST"])
def draw_card_by_index():
    data = request.get_json()
    index = data.get("index")
    logic.rotate_deck(index)

    return hit()


if __name__ == "__main__":
    app.run(debug=True, port=5000)
