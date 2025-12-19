const x = document.getElementById("demo");
let chips = 200;
let betStep = 50;
let currentBet = 0;

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

function updateBankUI() {
    document.getElementById("chipsDisplay").textContent = chips;
    document.getElementById("currentBetDisplay").textContent = currentBet;
}

function populateBetDropdown(selectedBet = null) {
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

    if (typeof data.chips === "number") {
        chips = data.chips;
    }

    if (typeof data.current_bet === "number") {
        currentBet = data.current_bet;
    }

    if (resetDropdown) {
        populateBetDropdown(currentBet);
    }

    updateBankUI();

    if (data.game_over) {
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
    startBtn.onclick = newRound;

    document.getElementById("betting").style.display = "block";
    currentBet = 0;
    updateBankUI();
}

async function startGame() {
    const bet = parseInt(document.getElementById("betSelect").value, 10);
    currentBet = bet;

    const data = await callGameApi("/api/start_blackjack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bet })
    });

    if (typeof data.chips === "number") {
        chips = data.chips;
    }

    currentBet = bet;
    handleGameState(data, false);
}

async function newRound() {
    const bet = parseInt(document.getElementById("betSelect").value, 10);
    currentBet = bet;

    const data = await callGameApi("/new_round", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bet })
    });

    if (typeof data.chips === "number") {
        chips = data.chips;
    }

    currentBet = bet;
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