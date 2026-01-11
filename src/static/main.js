const x = document.getElementById("demo");
const betStep = 50;
let dealerFirstCardRevealed = false;
let lastJokerCount = 0;
let shownEvents = new Set();

/**
 * Requests the user's current geographic location.
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
 * @param {number} debt - The player's current debt.
 */
function updateBankUI(chips, bet, debt) {
    document.getElementById("chipsDisplay").textContent = chips;
    document.getElementById("currentBetDisplay").textContent = bet;
    if (debt !== undefined) {
        document.getElementById("debtDisplay").textContent = debt;
    }
}

/**
 * Extracts the bet amount from the player's hand.
 */
function extractBet(hands) {
    if (!Array.isArray(hands) || hands.length === 0) {
        return 0;
    }
    return hands.reduce((sum, hand) => {
        const betEntry = hand.find(([, suit]) => suit === "BET");
        return sum + (betEntry ? betEntry[0] : 0);
    }, 0);
}

/**
 * Populates the bet dropdown based on available chips.
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
 */
async function callGameApi(url, options = {}) {
    const response = await fetch(url, options);
    return await response.json();
}

function debug(data) {
    //const el = document.getElementById("output");
    //if (el) el.textContent = JSON.stringify(data, null, 2);
}

function powerupsModal(powerups) {
    populateModalButtonsFromArray(powerups);
}

function dealerCards(data) {
    const dealer = data.dealer;
    const gameStarted = data.game_started;
    const gameOver = data.game_over;

    if (dealer) {
        const hideDealerCard = gameStarted && !gameOver;
        renderCards("dealerCards", dealer, hideDealerCard);

        const dealerScoreEl = document.getElementById("dealerScore");
        if (dealerScoreEl) {
            let scoreText;
            if (gameStarted && !gameOver) {
                const visibleScore = calculateVisibleDealerScore(dealer);
                scoreText = `Score: ${visibleScore}`;
            } else {
                scoreText = `Score: ${data.dealer_score}`;
            }
            dealerScoreEl.textContent = scoreText;
        }
    }
}

function playerHands(data) {
    const container = document.getElementById("playerHandsContainer");
    if (!container) return;
    container.innerHTML = "";

    const handsToRender = data.player_hands || (data.player ? [data.player] : []);
    const scores = data.player_scores || [];

    handsToRender.forEach((hand, index) => {
        const isActive = data.player_hands ? (index === data.active_hand_index) : true;
        const handDiv = document.createElement("div");
        handDiv.className = `hand-section ${isActive ? 'active-hand' : 'inactive-hand'}`;

        const handScore = scores[index] !== undefined ? scores[index] : 0;

        handDiv.innerHTML = `
            <h3>Hand ${index + 1}</h3>
            <div id="playerScore-${index}" class="score">Score: ${handScore}</div>
            <div id="card-${index}" class="cards-container"></div>
            <div class="hand-controls">
                ${isActive && data.game_started && !data.game_over ? `
                    <button class="deck-button" onclick="hit()">Hit</button>
                    <button class="deck-button" onclick="stand()">Stand</button>
                    <button class="deck-button" onclick="split()">Split</button>
                ` : ''}
            </div>
        `;
        container.appendChild(handDiv);
        renderCards(`card-${index}`, hand);
    });
}

function bets(data, resetDropdown) {
    const chips = data.chips;
    const handsToCheck = data.player_hands || (data.player ? [data.player] : []);
    const debt = data.debt;
    const bet = extractBet(handsToCheck);

    if (resetDropdown) {
        populateBetDropdown(chips, bet);
    }

    updateBankUI(chips, bet, debt);
}

function handleRoundState(data) {
    if (!data.game_started) return;

    if (data.game_over) {

        // VICTORY
        if (data.victory) {
            window.location.href = "/victory";
            return;
        }

        // GAME OVER
        if (data.chips <= 0) {
            window.location.href = "/game-over";
            return;
        }

        endRoundUI();
        return;
    }

    inRoundUI();
}


function handleGameState(data, resetDropdown = true) {
    debug(data);
    triggerAnimations(data);
    triggerEvent("POWERUPS_GAINED", data);
    powerupsModal(data.powerups);
    dealerCards(data);
    playerHands(data);
    bets(data, resetDropdown);
    handleRoundState(data);
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
    dealerFirstCardRevealed = false;
    let bet = 0;

    try {
        bet = parseInt(document.getElementById("betSelect").value, 10);
    } catch (error) {
        console.log("Value is null - setting bet to 50 for first round");
        bet = 50;
    }

    if (!bet || bet <= 0) {
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

async function initGameState() {
    const currentLocation = getLocation();
    const currentLocationJson = JSON.stringify(currentLocation);
    const select = document.getElementById("sign");
    const selectedSign = select.value;

    const gameData = await callGameApi("/api/init-game-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedSign })
    });

    localStorage.setItem("gameData", JSON.stringify(gameData));
    const savedDataString = localStorage.getItem("gameData");

    if (savedDataString) {
        console.log(savedDataString);
    } else {
        console.log("No saved data :( ");
    }

    window.location.href = "/game";
    triggerEvent("POWERUPS_GAINED", gameData);
}

async function hit() {
    const data = await callGameApi("/api/hit");
    handleGameState(data);
}

async function stand() {
    const data = await callGameApi("/api/stand");
    handleGameState(data);
}

async function split() {
    const data = await callGameApi("/api/split", { method: "POST" });
    if (data.error) {
        alert(data.error);
    } else {
        handleGameState(data);
    }
}

function populateModalButtonsFromArray(numbers) {
    const container = document.getElementById("modalButtons");
    container.innerHTML = "";
    const uniqueNumbers = [...new Set(numbers)];

    uniqueNumbers.forEach(num => {
        const btn = document.createElement("button");
        btn.className = "game-button m-1";
        btn.type = "button";
        const item = createPowerupItem(num);
        btn.appendChild(item);
        btn.onclick = () => {
            const modalEl = document.getElementById("powerupModal");
            const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
            modal.hide();
            usePowerUp(num);
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

    switch (num) {
        case 0:
            powerup0(data);
            break;
        case 1:
            powerup1(data);
            break;
        default:
            console.log("Powerup handled in backend: " + num);
    }
    handleGameState(data);
}

const SUITS = ['HEARTS', 'CLUBS', 'DIAMONDS', 'SPADES'];
const VALUES = ['ACE', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const IMAGES = {
    JOKER: { JOKER: "static/assets/Joker.png" },
    BACKGROUND: { BACKGROUND: "static/assets/Background.png" },
    POWERUP: {
        0: "static/assets/Sun.png",
        1: "static/assets/Moon.png",
        2: "static/assets/Mercury.png",
        3: "static/assets/Venus.png",
        4: "static/assets/Earth.png",
        5: "static/assets/Mars.png",
        6: "static/assets/Jupiter.png",
        7: "static/assets/Saturn.png",
        8: "static/assets/Uranus.png",
        9: "static/assets/Neptune.png",
        10: "static/assets/Pluto.png"
    }
};

SUITS.forEach(suit => {
    IMAGES[suit] = {};
    VALUES.forEach(val => {
        const code = val === 'J' ? 'J' : val === 'Q' ? 'Q' : val === 'K' ? 'K' : val === '10' ? 'T' : val === 'ACE' ? 'A' : val;
        IMAGES[suit][val] = `static/assets/${code}${suit[0]}.png`;
    });
});

function getCardImageSrc(value, suit) {
    if (suit === "BLACK" || suit === "RED") suit = "JOKER";
    if (value === "JACK") value = "J";
    else if (value === "QUEEN") value = "Q";
    else if (value === "KING") value = "K";
    else value = value.toString();

    return IMAGES[suit][value];
}

function renderCards(containerId, cards, hideFirst = false) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    cards
        .filter(([value, suit]) => suit !== "BET" && value !== "JOKER")
        .forEach(([value, suit], index) => {
            const img = document.createElement("img");
            img.className = "card";
            img.loading = "eager";

            if (hideFirst && index === 0 && !dealerFirstCardRevealed) {
                img.src = IMAGES.BACKGROUND.BACKGROUND;
                img.alt = "Face-down card";
                container.appendChild(img);
                return;
            }

            img.src = getCardImageSrc(value, suit);
            img.alt = `${value} of ${suit}`;
            container.appendChild(img);
        });
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
    showEventOverlay();
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.gap = "20px";

    const [value, suit] = data.powerup_info;
    const peekImg = document.createElement("img");
    peekImg.className = "card";
    peekImg.src = getCardImageSrc(value, suit);
    peekImg.onclick = () => draw_card_by_index(0);

    const backImg = document.createElement("img");
    backImg.className = "card";
    backImg.src = IMAGES.BACKGROUND.BACKGROUND;
    backImg.onclick = () => draw_card_by_index(1);

    wrapper.appendChild(peekImg);
    wrapper.appendChild(backImg);
    setEventContent(wrapper);
}

async function draw_card_by_index(index) {
    hideEventOverlay();
    const data = await callGameApi("/api/draw_card_by_index", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index })
    });
    handleGameState(data);
}

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

    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }
    return score;
}

function triggerAnimations(data) {
    const handsToCheck = data.player_hands || (data.player ? [data.player] : []);
    const jokerCount = handsToCheck.reduce((count, hand) =>
        count + hand.filter(([value]) => value === "JOKER").length, 0);

    if (jokerCount > lastJokerCount) {
        showJokerPopup();
    }
    lastJokerCount = jokerCount;
}

function showJokerPopup() {
    const img = document.createElement("img");
    img.src = IMAGES.JOKER.JOKER;
    img.className = "joker-popup";
    document.body.appendChild(img);

    requestAnimationFrame(() => {
        img.classList.add("show");
    });

    setTimeout(() => {
        img.classList.remove("show");
        img.addEventListener("transitionend", () => img.remove(), { once: true });
    }, 1000);
}

function showEventOverlay() {
    document.getElementById("displayOverlay").classList.remove("hidden");
    document.body.classList.add("modal-open");
}

function hideEventOverlay() {
    document.getElementById("displayOverlay").classList.add("hidden");
    document.body.classList.remove("modal-open");
}

function setEventContent(node) {
    const content = document.getElementById("displayContent");
    content.innerHTML = "";
    content.appendChild(node);
}

function eventPowerupsGained(data) {
    showEventOverlay();
    const wrapper = document.createElement("div");
    wrapper.className = "event-box";

    const title = document.createElement("h3");
    const name = data.player_sign;
    title.textContent = "Celestial Guidance | " + name[0].toUpperCase() + name.slice(1) + " |";
    wrapper.appendChild(title);

    const description = document.createElement("p");
    description.textContent = "The stars align over Vegas, the heavens themselves at your beck and call:";
    wrapper.appendChild(description);

    const grid = document.createElement("div");
    grid.className = "event-powerup-grid";

    data.powerups.forEach(id => {
        grid.appendChild(createPowerupItem(id));
    });

    wrapper.appendChild(grid);
    const continueBtn = document.createElement("button");
    continueBtn.className = "game-button mt-3";
    continueBtn.textContent = "Continue";
    continueBtn.onclick = hideEventOverlay;

    wrapper.appendChild(continueBtn);
    setEventContent(wrapper);
}

const EVENTS = {
    POWERUPS_GAINED: eventPowerupsGained,
};

function triggerEvent(type, data) {
    if (shownEvents.has(type)) return;
    shownEvents.add(type);
    EVENTS[type]?.(data);
}

function createPowerupItem(id) {
    const imgPath = IMAGES.POWERUP[id];
    const name = imgPath.split("/").pop().replace(".png", "");
    const item = document.createElement("div");
    item.className = "event-powerup-item";
    const img = document.createElement("img");
    img.src = imgPath;
    img.alt = name;
    img.className = "powerup-icon";
    const label = document.createElement("div");
    label.textContent = name;
    item.appendChild(img);
    item.appendChild(label);
    return item;
}