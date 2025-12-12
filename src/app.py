# TODO: Import neccessary utilities and make the API calls to handle the shuffling of cards.
# Create endpoints that the frontend can access
#
from flask import Flask, render_template
import requests

app = Flask(__name__)


@app.route("/")
def hello_world():
    return render_template("index.html")

@app.route("/")
def get_deck():
    url = "https://deckofcardsapi.com/api/deck/new/" 
    response = requests.get(url)
    data = response.json()
    print(data)
    user_id = data['deck_id']
    print(user_id)

@app.route("/")
def draw_card():
    url = "https://deckofcardsapi.com/api/deck/iun3e4moglhs/draw/?count=2"
    response = requests.get(url)
    data = response.json()
    print(data)

draw_card()