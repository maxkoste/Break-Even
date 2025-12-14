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

@app.route("/api/getmoonphase")
def get_moonphase():
    app_id = ""
    app_secret = ""
    auth_str = base64.b64encode(f"{app_id}:{app_secret}".encode()).decode()


    url = "https://api.astronomyapi.com/api/v2/bodies/positions/moon"

    params = {
        "latitude": "55.6059",
        "longitude": "13.0038",
        "elevation": "10",
        "from_date": "2025-12-12",
        "to_date": "2025-12-12",
        "time": "20:00:00"
    }

    headers = {
        "Authorization": f"Basic {auth_str}"
    }

    response = requests.get(url, headers=headers, params=params)
    data = response.json()
    print(data["data"]["table"]["rows"][0]["cells"][0]["extraInfo"]["phase"]["string"])

@app.route("/api/getcelestialdata")
def get_celestial_data():
    app_id = "3f6e208a-f3a1-45c7-9e1f-d741f95e9999"
    app_secret = "c11b3451ef84139fc643554548e504c5fa8661fbdae6d87d69e9b1cac6eaefe4197b90819d3e71bf2454c9fc2e67157e5002c6a2317b74980fb6863c791f6b3558e37854c46a6888769599f32a2881c53d67cc6a1b47c327cc035c23ab02a80607b951b869e10739c4473eb06e3b6acb"
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
