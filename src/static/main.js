const x = document.getElementById("demo");
const betStep = 50;

function getLocation() {
  if (!navigator.geolocation) {
    x.textContent = "Geolocation is not supported by this browser.";
    return;
  }

  navigator.geolocation.getCurrentPosition(success, handleError);
}

function success(position) {
  const { latitude, longitude, altitude } = position.coords;

  x.innerHTML =
    `Latitude: ${latitude}<br>` +
    `Longitude: ${longitude}<br>` +
    `Altitude: ${altitude ?? "Not available"}`;
}

function handleError(err) {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      x.textContent = "User denied the request for Geolocation.";
      break;
    case err.POSITION_UNAVAILABLE:
      x.textContent = "Location information is unavailable.";
      break;
    case err.TIMEOUT:
      x.textContent = "The request to get user location timed out.";
      break;
    default:
      x.textContent = "An unknown error occurred.";
  }
}

//https://api.opentopodata.org/v1/srtm90m?locations=LAT,LON
//Link to free elevation api, elevation unlikely to be return correct without

function updateBankUI(chips, bet) {
    document.getElementById("chipsDisplay").textContent = chips;
    document.getElementById("currentBetDisplay").textContent = bet;
}

// function extractBet(playerHand) {
//     if (!Array.isArray(playerHand) || playerHand.length === 0) {
//         return 0;
//     }
//     return playerHand[0];
// }
function extractBet(playerHand) {
    if (!Array.isArray(playerHand) || playerHand.length === 0) {
        return 0;
    }

    const betEntry = playerHand.find(([value, suit]) => suit === "BET");
    return betEntry ? betEntry[0] : 0;
}

function populateBetDropdown(chips, selectedBet = null) {
    const select = document.getElementById("betSelect");
    select.innerHTML = "";

    if (chips < betStep) {
        select.disabled = true;
        return;
    }
    select.disabled = false;

    for (let bet = betStep; bet <= chips; bet += betStep) {
        const option = document.createElement("option");
        option.value = bet;
        option.textContent = bet;
        select.appendChild(option);
    }

    if (selectedBet !== null && select.querySelector(`option[value="${selectedBet}"]`)) {
        select.value = selectedBet;
    } else if (select.options.length > 0) {
        select.value = select.options[0].value;
    }
}

async function callGameApi(url, options = {}) {
    const response = await fetch(url, options);
    return await response.json();
}

function handleGameState(data, resetDropdown = true) {
    document.getElementById("output").textContent =
        JSON.stringify(data, null, 2);

    populateModalButtonsFromArray(data.powerups);

	if (data.player) {
    renderCards("playerCards", data.player);
	}
	if (data.dealer) {
		renderCards("dealerCards", data.dealer);
	}

    const chips = data.chips;
    const bet = extractBet(data.player);

    if (resetDropdown) {
        populateBetDropdown(chips, bet);
    }

    updateBankUI(chips, bet);

    if (!data.game_started) {
        return // We should use a better flag system than this for different game states.
    } else if (data.game_over) {
        endRoundUI();
    } else {
        inRoundUI();
    }
}

function inRoundUI() {
    document.getElementById("startBtn").style.display = "none";
    document.getElementById("controls").style.display = "block";
    document.getElementById("betting").style.display = "none";
}

function endRoundUI() {
    document.getElementById("controls").style.display = "none";

    const startBtn = document.getElementById("startBtn");
    startBtn.style.display = "block";
    startBtn.textContent = "New Round";
    startBtn.onclick = startGame;

    document.getElementById("betting").style.display = "block";
}


async function startGame() {
    let bet = parseInt(document.getElementById("betSelect").value, 10);

	if (!bet || bet <= 0) {
		// discard or alert user
		console.log("No valid bet selected, setting it to 50");
		bet = 50;
	}
    const data = await callGameApi("/api/deal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bet })
    });

    handleGameState(data, false);
}


async function hit() {
    const data = await callGameApi("/api/hit");
    handleGameState(data);
}

async function stand() {
    const data = await callGameApi("/api/stand");
    handleGameState(data);
}

function populateModalButtonsFromArray(numbers) {
    const container = document.getElementById("modalButtons");
    container.innerHTML = "";

    // Remove duplicates
    const uniqueNumbers = [...new Set(numbers)];

    uniqueNumbers.forEach(num => {
        const btn = document.createElement("button");

        btn.className = "btn btn-primary m-1";
        btn.textContent = num;

        btn.onclick = () => {
            usePowerUp(num)
        };

        container.appendChild(btn);
    });
}

async function usePowerUp(num) {
    const data = await callGameApi("/api/use_powerup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ num })
    });
    handleGameState(data);
}

const CARD_IMAGES = {
    "HEARTS": {
        "ACE": "https://deckofcardsapi.com/static/img/AH.png",
        "2": "https://deckofcardsapi.com/static/img/2H.png",
        "3": "https://deckofcardsapi.com/static/img/3H.png",
        "4": "https://deckofcardsapi.com/static/img/4H.png",
        "5": "https://deckofcardsapi.com/static/img/5H.png",
        "6": "https://deckofcardsapi.com/static/img/6H.png",
        "7": "https://deckofcardsapi.com/static/img/7H.png",
        "8": "https://deckofcardsapi.com/static/img/8H.png",
        "9": "https://deckofcardsapi.com/static/img/9H.png",
        "10": "https://deckofcardsapi.com/static/img/0H.png",
        "J": "https://deckofcardsapi.com/static/img/JH.png",
        "Q": "https://deckofcardsapi.com/static/img/QH.png",
        "K": "https://deckofcardsapi.com/static/img/KH.png"
    },
    "CLUBS": {
        "ACE": "https://deckofcardsapi.com/static/img/AC.png",
        "2": "https://deckofcardsapi.com/static/img/2C.png",
        "3": "https://deckofcardsapi.com/static/img/3C.png",
        "4": "https://deckofcardsapi.com/static/img/4C.png",
        "5": "https://deckofcardsapi.com/static/img/5C.png",
        "6": "https://deckofcardsapi.com/static/img/6C.png",
        "7": "https://deckofcardsapi.com/static/img/7C.png",
        "8": "https://deckofcardsapi.com/static/img/8C.png",
        "9": "https://deckofcardsapi.com/static/img/9C.png",
        "10": "https://deckofcardsapi.com/static/img/0C.png",
        "J": "https://deckofcardsapi.com/static/img/JC.png",
        "Q": "https://deckofcardsapi.com/static/img/QC.png",
        "K": "https://deckofcardsapi.com/static/img/KC.png"
	},
    "DIAMONDS": {
        "ACE": "https://deckofcardsapi.com/static/img/AD.png",
        "2": "https://deckofcardsapi.com/static/img/2D.png",
        "3": "https://deckofcardsapi.com/static/img/3D.png",
        "4": "https://deckofcardsapi.com/static/img/4D.png",
        "5": "https://deckofcardsapi.com/static/img/5D.png",
        "6": "https://deckofcardsapi.com/static/img/6D.png",
        "7": "https://deckofcardsapi.com/static/img/7D.png",
        "8": "https://deckofcardsapi.com/static/img/8D.png",
        "9": "https://deckofcardsapi.com/static/img/9D.png",
        "10": "https://deckofcardsapi.com/static/img/0D.png",
        "J": "https://deckofcardsapi.com/static/img/JD.png",
        "Q": "https://deckofcardsapi.com/static/img/QD.png",
        "K": "https://deckofcardsapi.com/static/img/KD.png"
	},
    "SPADES": {
        "ACE": "https://deckofcardsapi.com/static/img/AS.png",
        "2": "https://deckofcardsapi.com/static/img/2S.png",
        "3": "https://deckofcardsapi.com/static/img/3S.png",
        "4": "https://deckofcardsapi.com/static/img/4S.png",
        "5": "https://deckofcardsapi.com/static/img/5S.png",
        "6": "https://deckofcardsapi.com/static/img/6S.png",
        "7": "https://deckofcardsapi.com/static/img/7S.png",
        "8": "https://deckofcardsapi.com/static/img/8S.png",
        "9": "https://deckofcardsapi.com/static/img/9S.png",
        "10": "https://deckofcardsapi.com/static/img/0S.png",
        "J": "https://deckofcardsapi.com/static/img/JS.png",
        "Q": "https://deckofcardsapi.com/static/img/QS.png",
        "K": "https://deckofcardsapi.com/static/img/KS.png"
	},
	"JOKER": {
        "JOKER": "https://deckofcardsapi.com/static/img/X2.png"
	}
};

function renderCards(containerId, cards) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = ""; // Clear previous cards
	
    console.log(containerId, cards);

    cards
        // Filter out BET entries
        .filter(([value, suit]) => suit !== "BET")
        .forEach(([value, suit]) => {
            // Convert numeric values to string keys for CARD_IMAGES
			if (suit === "BLACK" || suit === "RED") suit = "JOKER"; // map joker suits

            if (value === 1) value = "ACE";
            else if (value === 11) value = "J";
            else if (value === 12) value = "Q";
            else if (value === 13) value = "K";
            else value = value.toString();

            const img = document.createElement("img");

			img.src = CARD_IMAGES[suit][value];
			img.alt = `${value} of ${suit}`;

            img.className = "card";
            img.width = 72;
            img.height = 96;
            container.appendChild(img);
        });
}
