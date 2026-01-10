const x = document.getElementById("demo");
const betStep = 50;
let dealerFirstCardRevealed = false;

/**
 * Requests the user's current geographic location.
 * Displays an error message if geolocation is not supported.
 *
 * @returns {void}
 */
function getLocation() {
  if (!navigator.geolocation) {
    x.textContent = "Geolocation is not supported by this browser.";
    return;
  }

  return navigator.geolocation.getCurrentPosition(success, handleError);
}

/**
 * Handles a successful geolocation request.
 *
 * @param {GeolocationPosition} position - The user's current position.
 */
function success(position) {
  const { latitude, longitude, altitude } = position.coords;

  x.innerHTML =
    `Latitude: ${latitude}<br>` +
    `Longitude: ${longitude}<br>` +
    `Altitude: ${altitude ?? "Not available"}`;
}

/**
 * Handles errors from the geolocation API.
 *
 * @param {GeolocationPositionError} err - The error object.
 */
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

/**
 * Updates the displayed chip count and current bet.
 *
 * @param {number} chips - The player's total chips.
 * @param {number} bet - The current bet amount.
 */
function updateBankUI(chips, bet) {
    document.getElementById("chipsDisplay").textContent = chips;
    document.getElementById("currentBetDisplay").textContent = bet;
}

/**
 * Extracts the bet amount from the player's hand.
 *
 * @param {Array} playerHand - The player's hand including bet entries.
 * @returns {number} The bet amount or 0 if none exists.
 */
function extractBet(playerHand) {
    if (!Array.isArray(playerHand) || playerHand.length === 0) {
        return 0;
    }

    const betEntry = playerHand.find(([value, suit]) => suit === "BET");
    return betEntry ? betEntry[0] : 0;
}

/**
 * Populates the bet dropdown based on available chips.
 *
 * @param {number} chips - The player's available chips.
 * @param {number|null} selectedBet - The currently selected bet.
 */
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

/**
 * Calls a backend API endpoint and returns the JSON response.
 *
 * @param {string} url - The API endpoint.
 * @param {Object} options - Fetch options.
 * @returns {Promise<Object>} The parsed JSON response.
 */
async function callGameApi(url, options = {}) {
    const response = await fetch(url, options);
    return await response.json();
}

/**
 * Updates the game UI based on the current game state.
 *
 * @param {Object} data - The game state returned from the backend.
 * @param {boolean} resetDropdown - Whether to reset the bet dropdown.
 */
function handleGameState(data, resetDropdown = true) {
	// Renders debugg information 
    // document.getElementById("output").textContent =
        // JSON.stringify(data, null, 0);

    populateModalButtonsFromArray(data.powerups);

    if (data.player) {
        renderCards("playerCards", data.player);
    }

    if (data.dealer) {
        const hideDealerCard =
            data.game_started && !data.game_over;

        renderCards("dealerCards", data.dealer, hideDealerCard);
    }

    // 🔹 PLAYER SCORE (alltid fullt)
    document.getElementById("playerScore").textContent =
        `Score: ${data.player_score}`;

    // 🔹 DEALER SCORE
    if (data.game_started && !data.game_over) {
        const visibleScore = calculateVisibleDealerScore(data.dealer);
        document.getElementById("dealerScore").textContent =
            `Score: ${visibleScore}`;
    } else {
        document.getElementById("dealerScore").textContent =
            `Score: ${data.dealer_score}`;
    }
    
    const chips = data.chips;
    const bet = extractBet(data.player);

    if (resetDropdown) {
        populateBetDropdown(chips, bet);
    }

    updateBankUI(chips, bet);

    if (!data.game_started) return;
    else if (data.game_over) {
        if (data.chips <= 0) {
            // Spelaren har inga chips kvar → redirect till game-over-sidan
            window.location.href = "/game-over";
        } else {
            endRoundUI(); // vanlig runda slut
        }
    } else {
        inRoundUI();
    }
}

/**
 * Updates the UI for an active round.
 */
function inRoundUI() {
    document.getElementById("startBtn").style.display = "none";
    document.getElementById("controls").style.display = "block";
    document.getElementById("betting").style.display = "none";
}

/**
 * Updates the UI when a round has ended.
 */
function endRoundUI() {
    document.getElementById("controls").style.display = "none";

    const startBtn = document.getElementById("startBtn");
    startBtn.style.display = "block";
    startBtn.textContent = "New Round";
    startBtn.onclick = startGame;

    document.getElementById("betting").style.display = "block";
}

/**
 * Starts a new game round by placing a bet and dealing cards.
 */
async function startGame() {
    dealerFirstCardRevealed = false;

	let bet = 0;

	try {
		bet = parseInt(document.getElementById("betSelect").value, 10);
	} catch (error) {
		console.log("Value is null - setting bet to 50 for first round")
		bet = 50;
	}

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

/**
 * Initializes the game by sending player data and fetching mashup API data.
 */
async function initGameState(){

	const currentLocation = getLocation();

	const currentLocationJson = JSON.stringify(currentLocation);

    const select = document.getElementById("sign");
    const selectedSign = select.value;

	const gameData = await callGameApi("/api/init-game-state", {
		method: "POST",
		headers: {"Content-Type": "application/json"},
		body: JSON.stringify({ selectedSign })
	});

	localStorage.setItem("gameData", JSON.stringify(gameData));

	const savedDataString = localStorage.getItem("gameData");

	if (savedDataString) {
		// const savedData = JSON.parse(savedDataString);
		console.log(savedDataString);
	} else{
		console.log("No saved data :( ")
	}

    window.location.href="/game";
}

/**
 * Requests a hit action from the backend.
 */
async function hit() {
    const data = await callGameApi("/api/hit");
    handleGameState(data);
}

/**
 * Requests a stand action from the backend.
 */
async function stand() {
    const data = await callGameApi("/api/stand");
    handleGameState(data);
}

/**
 * Creates buttons for available power-ups.
 *
 * @param {number[]} numbers - List of available power-up IDs.
 */
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
            const modalEl = document.getElementById("exampleModal");
            const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
            modal.hide();          // This will trigger the fade out animation
            
            usePowerUp(num)
        };

        container.appendChild(btn);
    });
}

/**
 * Uses a selected power-up.
 *
 * @param {number} num - The power-up ID.
 */
async function usePowerUp(num) {
    const data = await callGameApi("/api/use_powerup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ num })
    });

    switch (num) {
        case 0:
            powerup0(data)
            break;
        case 1:
            powerup1(data);
            break;
        default:
            console.log("Fix this powerup: " + num)
    }

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

function getCardImageSrc(value, suit) {
    if (suit === "BLACK" || suit === "RED") suit = "JOKER";

    if (value === "JACK") value = "J";
    else if (value === "QUEEN") value = "Q";
    else if (value === "KING") value = "K";
    else value = value.toString();

    return CARD_IMAGES[suit][value];
}

/**
 * Renders playing cards in a given container.
 *
 * @param {string} containerId - The DOM container ID.
 * @param {Array} cards - List of cards to render.
 * @param {boolean} hideFirst - Whether to hide the first card.
 */
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
            if (hideFirst && index === 0 && !dealerFirstCardRevealed) {
                img.src = CARD_IMAGES.BACKGROUND.BACKGROUND;
                img.alt = "Face-down card";
                container.appendChild(img);
                return;
            }

            img.src = getCardImageSrc(value, suit);
            img.alt = `${value} of ${suit}`;

            container.appendChild(img);
        });
}

/**
 * Calculates the dealer's visible score (excluding hidden card).
 *
 * @param {Array} dealerCards - The dealer's cards.
 * @returns {number} The visible score.
 */
function calculateVisibleDealerScore(dealerCards) {
    if (!dealerCards || dealerCards.length === 0) return 0;

    let score = 0;
    let aces = 0;

    for (let i = dealerFirstCardRevealed ? 0 : 1; i < dealerCards.length; i++) {
        const [value] = dealerCards[i];

        if (value === "ACE") {
            score += 11;
            aces++;
        } else if (["KING", "QUEEN", "JACK"].includes(value)) {
            score += 10;
        } else if (value !== "JOKER") {
            score += parseInt(value);
        }
    }

    // Hantera ess
    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }

    return score;
}

function powerup0(data) {
    const [value, suit] = data.powerup_info;

    const dealerCardsContainer = document.getElementById("dealerCards");

    const firstCard = dealerCardsContainer.querySelector("img");

    if (firstCard) {
        firstCard.src = getCardImageSrc(value, suit);
        firstCard.alt = `${value} of ${suit}`;
        dealerFirstCardRevealed = true;
    }

    if (data.dealer && data.dealer.length > 0) {
        const dealerScore = data.dealer_score;
        document.getElementById("dealerScore").textContent = `Score: ${dealerScore}`;
    }
}

function powerup1(data) {
    const overlay = document.getElementById("displayOverlay");
    const content = document.getElementById("displayContent");

    content.innerHTML = "";
    overlay.classList.remove("hidden");

    const [value, suit] = data.powerup_info;

    const peekImg = document.createElement("img");
    peekImg.className = "card";
    peekImg.src = getCardImageSrc(value, suit);
    peekImg.onclick = () => draw_card_by_index(0);

    const backImg = document.createElement("img");
    backImg.className = "card";
    backImg.src = CARD_IMAGES.BACKGROUND.BACKGROUND;
    backImg.onclick = () => draw_card_by_index(1);

    content.appendChild(peekImg);
    content.appendChild(backImg);
}

async function draw_card_by_index(index) {
    const overlay = document.getElementById("displayOverlay");
    const content = document.getElementById("displayContent");

    content.innerHTML = "";

    const data = await callGameApi("/api/draw_card_by_index", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            index: index
        })
    });

    overlay.classList.add("hidden");
    handleGameState(data);
}
