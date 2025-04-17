const API_KEY = '6PUAjVYbsEpxZga9mqZF9lV6slqma3LA5t6Be1FP';


// Random background stars
// Source: https://prismic.io/blog/css-background-effects
function generateStarShadows(count) {
  let shadows = [];
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * 2000);
    const y = Math.floor(Math.random() * 2000);
    shadows.push(`${x}px ${y}px rgba(255, 255, 255, 0.34)`);
  }
  return shadows.join(', ');
}
const styleEl = document.getElementById('dynamic-stars');
styleEl.innerHTML = `
  #small-stars {
    width: 1px;
    height: 1px;
    background: transparent;
    position: absolute;
    top: 0;
    left: 0;
    box-shadow: ${generateStarShadows(700)};
    animation: animStar 100s linear infinite;
  }
  #small-stars::after {
    content: " ";
    position: absolute;
    top: 2000px;
    width: 1px;
    height: 1px;
    background: transparent;
    box-shadow: ${generateStarShadows(700)};
  }

  #medium-stars {
    width: 2px;
    height: 2px;
    background: transparent;
    position: absolute;
    top: 0;
    left: 0;
    box-shadow: ${generateStarShadows(200)};
    animation: animStar 150s linear infinite;
  }
  #medium-stars::after {
    content: " ";
    position: absolute;
    top: 2000px;
    width: 2px;
    height: 2px;
    background: transparent;
    box-shadow: ${generateStarShadows(200)};
  }

  #large-stars {
    width: 3px;
    height: 3px;
    background: transparent;
    position: absolute;
    top: 0;
    left: 0;
    box-shadow: ${generateStarShadows(100)};
    animation: animStar 150s linear infinite;
  }
  #large-stars::after {
    content: " ";
    position: absolute;
    top: 2000px;
    width: 3px;
    height: 3px;
    background: transparent;
    box-shadow: ${generateStarShadows(100)};
  }
`;
// End of background stars


// Fetching each rover's info into cards
function fetchRoverData(rover) {
  const manifestUrl = `https://api.nasa.gov/mars-photos/api/v1/manifests/${rover}?api_key=${API_KEY}`;

  fetch(manifestUrl)
    .then((res) => res.json())
    .then((manifestData) => {
      const roverData = manifestData.photo_manifest;
      updateRoverCard(rover, roverData);
    })
    .catch((error) => {
      console.error(`Error fetching data for ${rover}:`, error);
    });
}

function updateRoverCard(rover, roverData) {
  const roverCard = document.querySelector(`.rover-card[data-rover="${rover}"]`);
  if (roverCard) {
    const content = roverCard.querySelector(".content");
    content.innerHTML = `
      <h3>${roverData.name}</h3>
      <ul>
        <li>Status: ${roverData.status}</li>
        <li>Launch date: ${roverData.launch_date}</li>
        <li>Landing date: ${roverData.landing_date}</li>
        <li>Total photos: ${roverData.total_photos}</li>
      </ul>
    `;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  fetchRoverData("spirit");
  fetchRoverData("opportunity");
  fetchRoverData("curiosity");
  fetchRoverData("perseverance");
});

// Gallery section + buttons functions 
const gallerySection = document.querySelector(".mars-photos");

let currentRover = "";
let currentPhotos = [];

function fetchPhotos(rover) {
  currentRover = rover;

  const manifestUrl = `https://api.nasa.gov/mars-photos/api/v1/manifests/${rover}?api_key=${API_KEY}`;

  fetch(manifestUrl)
    .then((res) => res.json())
    .then((manifestData) => {
      const sols = manifestData.photo_manifest.photos.map(p => p.sol);
      const randomSol = sols[Math.floor(Math.random() * sols.length)];
      console.log(`[${rover}] Trying sol: ${randomSol}`);

      const apiUrl = `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?sol=${randomSol}&api_key=${API_KEY}`;

      fetch(apiUrl)
        .then((res) => res.json())
        .then((data) => {
          console.log(`[${rover}] Found ${data.photos.length} photos on sol ${randomSol}`);

          currentPhotos = data.photos;

          if (currentPhotos.length === 0) {
            displayMessage(`No photos found for ${rover} on sol ${randomSol}.`);
            return;
          }

          const randomPhotos = getRandomItems(currentPhotos, 8);
          renderGallery(randomPhotos);
        });
    })
    .catch((error) => {
      console.error("Error getting manifest:", error);
      displayMessage("Couldn't load photos, try again!", "There appears to be a problem with NASA's Server");
    });
}

function getRandomItems(arr, num) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
}

function renderGallery(photos) {
  const gallery = document.createElement("div");
  gallery.className = "gallery";

  gallery.innerHTML = `
  <div class="photo-grid">
    ${photos.map(photo => `
      <div class="photo-card">
        <img src="${photo.img_src.replace('http://', 'https://')}" alt="Mars photo" />
        <div class="photo-info">
          <p>Rover: ${photo.rover.name}</p>
          <p>Earth Date: ${photo.earth_date}</p>
          <p>Sol: ${photo.sol}</p>
          <p>Camera: ${photo.camera.full_name}</p>
          <p>Camera ID: ${photo.camera.id}</p>
        </div>
      </div>
    `).join("")}
  </div>
`;

  const oldGallery = document.querySelector(".gallery");
  if (oldGallery) oldGallery.remove();

  const oldPicker = document.getElementById("date-picker-wrapper");
  if (oldPicker) oldPicker.remove();

  gallerySection.appendChild(gallery);
}


function shufflePhotos() {
  if (currentPhotos.length === 0) {
    displayMessage("Nothing to shuffle yet!", "Select a rover first");
    return;
  }

  const shuffled = getRandomItems([...currentPhotos], 8);
  renderGallery(shuffled);
}


function pickDate() {
  const userDate = prompt("Enter a date (YYYY-MM-DD):");
  if (!userDate) return;

  const url = `https://api.nasa.gov/mars-photos/api/v1/rovers/${currentRover}/photos?earth_date=${userDate}&api_key=${API_KEY}`;

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      if (data.photos.length === 0) {
        displayMessage("No photos found on that date.", "Try another date or press the Surprise Me! button.");
        return;
      }
      const randomPhotos = getRandomItems(data.photos, 8);
      renderGallery(randomPhotos);
    })
    .catch((error) => {
      console.error("Error fetching by date:", error);
    });
}


function randomDate() {
  if (currentPhotos.length === 0) {
    displayMessage("Select a rover first!", "Will surprise you with random photos");
    return;
  }

  const randomSol = Math.floor(Math.random() * 2000); 

  const url = `https://api.nasa.gov/mars-photos/api/v1/rovers/${currentRover}/photos?sol=${randomSol}&api_key=${API_KEY}`;

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      if (data.photos.length === 0) {
        displayMessage("No photos on this surprise sol!", "Try again");
        return;
      }
      currentPhotos = data.photos;
      const randomPhotos = getRandomItems(currentPhotos, 8);
      renderGallery(randomPhotos);
    })
    .catch((error) => {
      console.error("Error with surprise sol:", error);
    });
}


function displayMessage(message, hint) {
  const oldPhotoGrid = document.querySelector(".photo-grid");
  if (oldPhotoGrid) oldPhotoGrid.remove();
  
  const oldPicker = document.getElementById("date-picker-wrapper");
  if (oldPicker) oldPicker.remove();

  const oldMsg = document.querySelector(".gallery-message");
  if (oldMsg) oldMsg.remove();

  const msgContainer = document.createElement("div");
  msgContainer.className = "gallery-message";
  msgContainer.style.color = "white";
  msgContainer.style.marginTop = "20px";
  msgContainer.style.textAlign = "center";

  msgContainer.innerHTML = `
    <p class="message">${message}</p>
    <p class="hint">${hint}</p>
  `;

  gallerySection.appendChild(msgContainer);

  setTimeout(() => {
    msgContainer.style.display = 'none';
  }, 3000); 
}
