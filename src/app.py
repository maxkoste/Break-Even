# TODO: Import neccessary utilities and make the API calls to handle the shuffling of cards.
# Create endpoints that the frontend can access
#
from flask import Flask, render_template
import requests, base64

app = Flask(__name__)


@app.route("/")
def main():
    return render_template("index.html")

@app.route("/game")
def game():
    return render_template("game.html")


@app.route("/api/newdeck")
def get_deck():
    url = "https://deckofcardsapi.com/api/deck/new/"
    response = requests.get(url)
    data = response.json()
    print(data)
    user_id = data["deck_id"]
    print(user_id)
    return data


@app.route("/api/drawcard")
def draw_card():
    url = "https://deckofcardsapi.com/api/deck/iun3e4moglhs/draw/?count=2"
    response = requests.get(url)
    data = response.json()
    print(data)
    return data

@app.route("/api/getcelestialdata")
def get_celestial_data():
    app_id = ""
    app_secret = ""
    auth_str = base64.b64encode(f"{app_id}:{app_secret}".encode()).decode()

    url = "https://api.astronomyapi.com/api/v2/bodies/positions"

    params = {
        "latitude": "55.6050",
        "longitude": "13.0038",
        "elevation": "12",
        "from_date": "2025-12-13",
        "to_date": "2025-12-13",
        "time": "10:35:00"
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

get_celestial_data()

#if __name__ == "__main__":
#    app.run(debug=True, port=5000)
