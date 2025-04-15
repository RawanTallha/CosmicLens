const API_KEY = '6PUAjVYbsEpxZga9mqZF9lV6slqma3LA5t6Be1FP';

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

const gallerySection = document.querySelector(".mars-photos");

// Global vars
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
//mewowowowoow
      console.log(`[${rover}] Trying sol: ${randomSol}`);

      const apiUrl = `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?sol=${randomSol}&api_key=${API_KEY}`;

      fetch(apiUrl)
        .then((res) => res.json())
        .then((data) => {
//mwurrrrrrrrrrrrrrrrrrrrrrrrrrrr
          console.log(`[${rover}] Found ${data.photos.length} photos on sol ${randomSol}`);

          currentPhotos = data.photos;

          if (currentPhotos.length === 0) {
            displayMessage(`No photos found for ${rover} on sol ${randomSol}.`);
            return;
          }

          const randomPhotos = getRandomItems(currentPhotos, 6);
          renderGallery(randomPhotos);
        });
    })
    .catch((err) => {
      console.error("Error getting manifest:", err);
      displayMessage("Couldn't load photos, try again!");
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
      ${photos
      .map(
        (photo) => `
        <div class="photo-card">
          <img src="${photo.img_src.replace('http://', 'https://')}" alt="Mars photo" />
          <p>${photo.earth_date}</p>
        </div>
      `
      )
      .join("")}
    </div>
    <div class="gallery-buttons">
      <button onclick="shufflePhotos()">Shuffle</button>
      <button onclick="pickDate()">Pick a Date</button>
      <button onclick="randomDate()">Surprise Me!</button>
    </div>
  `;

  const oldGallery = document.querySelector(".gallery");
  if (oldGallery) oldGallery.remove();

  // Also remove old date picker if it exists
  const oldPicker = document.getElementById("date-picker-wrapper");
  if (oldPicker) oldPicker.remove();

  gallerySection.appendChild(gallery);
}

function shufflePhotos() {
  if (currentPhotos.length === 0) {
    displayMessage("Nothing to shuffle yet! Try selecting a rover.");
    return;
  }

  const shuffled = getRandomItems([...currentPhotos], 6);
  renderGallery(shuffled);
}

function pickDate() {
  const existing = document.getElementById("date-picker-wrapper");
  if (existing) existing.remove();

  const wrapper = document.createElement("div");
  wrapper.id = "date-picker-wrapper";
  wrapper.style.marginTop = "10px";

  wrapper.innerHTML = `
    <label for="date-input" style="color:white;">Choose a date: </label>
    <input type="date" id="date-input" max="${new Date().toISOString().split('T')[0]}"/>
    <button id="fetch-by-date">Go</button>
  `;

  gallerySection.appendChild(wrapper);

  document.getElementById("fetch-by-date").onclick = () => {
    const userDate = document.getElementById("date-input").value;
    if (!userDate) return;

    const url = `https://api.nasa.gov/mars-photos/api/v1/rovers/${currentRover}/photos?earth_date=${userDate}&api_key=${API_KEY}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.photos.length === 0) {
          displayMessage("No photos found on that date.");
          return;
        }
        currentPhotos = data.photos;
        const randomPhotos = getRandomItems(currentPhotos, 6);
        renderGallery(randomPhotos);
      })
      .catch((err) => {
        console.error("Error fetching by date:", err);
      });

    wrapper.remove(); // Clean up picker after submission
  };
}

function randomDate() {
  if (!currentRover) {
    alert("Pick a rover first!");
    return;
  }

  const randomSol = Math.floor(Math.random() * 2000); // safer upper range

  const url = `https://api.nasa.gov/mars-photos/api/v1/rovers/${currentRover}/photos?sol=${randomSol}&api_key=${API_KEY}`;

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      if (data.photos.length === 0) {
        displayMessage("No photos on this surprise sol! Try again.");
        return;
      }
      currentPhotos = data.photos;
      const randomPhotos = getRandomItems(currentPhotos, 6);
      renderGallery(randomPhotos);
    })
    .catch((err) => {
      console.error("Error with surprise sol:", err);
    });
}

function displayMessage(message) {
  const msg = document.createElement("p");
  msg.textContent = message;
  msg.style.color = "white";
  msg.style.marginTop = "10px";

  gallerySection.appendChild(msg);

  setTimeout(() => msg.remove(), 5000);
}
