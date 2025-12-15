# TODO: Import neccessary utilities and make the API calls to handle the shuffling of cards.
# Create endpoints that the frontend can access
#
from flask import Flask, render_template, jsonify
import requests, base64
import logic
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

app = Flask(__name__)

VALUE_MAP = { #PROBLEMATIC, Cards should always be tracked so that splits etc work correctly.
    "ACE": 11,
    "JACK": 10,
    "QUEEN": 10,
    "KING": 10
}

@app.route("/")
def main():
    return render_template("index.html")

@app.route("/game")
def game():
    return render_template("game.html")

@app.route("/api/start_blackjack")
def start_blackjack():
    deck_id = new_blackjack_deck()
    cards = draw_cards(deck_id, 324)
    logic.populate_deck(cards)
    initial_hands = logic.start_game()

    return jsonify(initial_hands)

def new_blackjack_deck():
    url = "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6&jokers_enabled=true"
    response = requests.get(url)
    data = response.json()
    deck_id = data["deck_id"]
    return deck_id

def draw_cards(deck_id, count):
    url = f"https://deckofcardsapi.com/api/deck/{deck_id}/draw/?count={count}"

    response = requests.get(url)
    data = response.json()

    cards = []

    for card in data["cards"]:
        value = card["value"]
        suit = card["suit"]

        if value == "JOKER":
            cards.append(["JOKER", suit])
        elif value in VALUE_MAP:
            cards.append([VALUE_MAP[value], suit])
        else:
            cards.append([int(value), suit])

    return cards


@app.route("/api/getcelestialdata")
def get_celestial_data():
    app_id = os.getenv("ASTRONOMY_APP_ID")
    app_secret = os.getenv("ASTRONOMY_APP_SECRET")
    
    auth_str = base64.b64encode(f"{app_id}:{app_secret}".encode()).decode()

    url = "https://api.astronomyapi.com/api/v2/bodies/positions"

    today = datetime.now().strftime("%Y-%m-%d")
    current_time = datetime.now().strftime("H%:M%:%S")

    params = {
        "latitude": "55.6050",
        "longitude": "13.0038",
        "elevation": "12",
        "from_date": today,
        "to_date": today,
        "time": current_time
    }

    headers = {
        "Authorization": f"Basic {auth_str}"
    }


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
    
    for constellation in results.values():
        print(constellation)

    print(moon_phase)
    return results

#logic.populate_deck(draw_card(get_blackjack_deck()))
#logic.populate_deck([(3, "Diamonds"), (10, "Hearts"), ("JOKER", "BLACK"), (11, "Spades")])
#logic.start_game()
#print(logic.use_powerup(0))

if __name__ == "__main__":
    app.run(debug=True, port=5000)
