const x = document.getElementById("demo");

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

async function startGame() {
    let response = await fetch("/api/start_blackjack");
    let data = await response.json();
    
    document.getElementById("output").textContent =
        JSON.stringify(data, null, 2);

    document.getElementById("startBtn").style.display = "none"; 
    document.getElementById("gameButtons").style.display = "block"; 
}

async function hit() {
    let response = await fetch("/api/hit");
    let data = await response.json();
    
    document.getElementById("output").textContent =
        JSON.stringify(data, null, 2);

    if (data.game_over) {
        document.getElementById("gameButtons").style.display = "none";
        document.getElementById("startBtn").style.display = "block";
        document.getElementById("startBtn").textContent = "New Round";
    }
}

async function stand() {
    let response = await fetch("/api/stand");
    let data = await response.json();
    
    document.getElementById("output").textContent =
        JSON.stringify(data, null, 2);

    document.getElementById("gameButtons").style.display = "none"; 
    document.getElementById("startBtn").style.display = "block"; 
    document.getElementById("startBtn").textContent = "New Round";
}