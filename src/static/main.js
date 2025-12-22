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
        const hideDealerCard =
            data.game_started && !data.game_over;

        renderCards("dealerCards", data.dealer, hideDealerCard);
    }

    const chips = data.chips;
    const bet = extractBet(data.player);

    if (resetDropdown) {
        populateBetDropdown(chips, bet);
    }

    updateBankUI(chips, bet);

    if (!data.game_started) return;
    else if (data.game_over) endRoundUI();
    else inRoundUI();
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
        "ACE": "static/assets/AH.png",
        "2": "static/assets/2H.png",
        "3": "static/assets/3H.png",
        "4": "static/assets/4H.png",
        "5": "static/assets/5H.png",
        "6": "static/assets/6H.png",
        "7": "static/assets/7H.png",
        "8": "static/assets/8H.png",
        "9": "static/assets/9H.png",
        "10": "static/assets/TH.png",
        "J": "static/assets/JH.png",
        "Q": "static/assets/QH.png",
        "K": "static/assets/KH.png"
    },
    "CLUBS": {
        "ACE": "static/assets/AC.png",
        "2": "static/assets/2C.png",
        "3": "static/assets/3C.png",
        "4": "static/assets/4C.png",
        "5": "static/assets/5C.png",
        "6": "static/assets/6C.png",
        "7": "static/assets/7C.png",
        "8": "static/assets/8C.png",
        "9": "static/assets/9C.png",
        "10": "static/assets/TC.png",
        "J": "static/assets/JC.png",
        "Q": "static/assets/QC.png",
        "K": "static/assets/KC.png",
	},
    "DIAMONDS": {
        "ACE": "static/assets/AD.png",
        "2": "static/assets/2D.png",
        "3": "static/assets/3D.png",
        "4": "static/assets/4D.png",
        "5": "static/assets/5D.png",
        "6": "static/assets/6D.png",
        "7": "static/assets/7D.png",
        "8": "static/assets/8D.png",
        "9": "static/assets/9D.png",
        "10": "static/assets/TD.png",
        "J": "static/assets/JD.png",
        "Q": "static/assets/QD.png",
        "K": "static/assets/KD.png",
	},
    "SPADES": {
        "ACE": "static/assets/AS.png",
        "2": "static/assets/2S.png",
        "3": "static/assets/3S.png",
        "4": "static/assets/4S.png",
        "5": "static/assets/5S.png",
        "6": "static/assets/6S.png",
        "7": "static/assets/7S.png",
        "8": "static/assets/8S.png",
        "9": "static/assets/9S.png",
        "10": "static/assets/TS.png",
        "J": "static/assets/JS.png",
        "Q": "static/assets/QS.png",
        "K": "static/assets/KS.png",
	},
	"JOKER": {
        "JOKER": "static/assets/Joker.png",
	},
    "BACKGROUND": {
        "BACKGROUND": "static/assets/Background.png",
    }
};

function renderCards(containerId, cards, hideFirst = false) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";

    cards
        .filter(([value, suit]) => suit !== "BET")
        .forEach(([value, suit], index) => {

            const img = document.createElement("img");
            img.className = "card";
            img.loading = "eager";

            // Hide dealer's first card
            if (hideFirst && index === 0) {
                img.src = CARD_IMAGES.BACKGROUND.BACKGROUND;
                img.alt = "Face-down card";
                container.appendChild(img);
                return;
            }

            if (suit === "BLACK" || suit === "RED") suit = "JOKER";

            if (value === "ACE") value = "ACE";
            else if (value === "JACK") value = "J";
            else if (value === "QUEEN") value = "Q";
            else if (value === "KING") value = "K";
            else value = value.toString();

            img.src = CARD_IMAGES[suit][value];
            img.alt = `${value} of ${suit}`;

            container.appendChild(img);
        });
}

