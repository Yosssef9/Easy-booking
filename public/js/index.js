// index.js
import { setupLogout } from "./utils.js";

const cardsContainer = document.getElementById("cards-container");
const searchForm = document.querySelector(".search-form");
const alertContainer = document.getElementById("alert-container");
const citySelect = searchForm.querySelector('select[name="city"]');
const recommendedSection = document.querySelector(".recommended-section");
const recommendedContainer = document.querySelector(".recommended-places");

const egyptCities = [
  "Alexandria",
  "Aswan",
  "Assiut",
  "Damanhur",
  "Beni Suef",
  "Cairo",
  "Mansoura",
  "Damietta",
  "Faiyum",
  "Tanta",
  "Giza",
  "Ismailia",
  "Kafr El Sheikh",
  "Luxor",
  "Marsa Matruh",
  "Minya",
  "Shibin El Kom",
  "Kharga",
  "Arish",
  "Port Said",
  "Banha",
  "Qena",
  "Hurghada",
  "Zagazig",
  "Sohag",
  "El Tor",
  "Suez",
];

// Populate city dropdown
function populateCityDropdown() {
  egyptCities.forEach((city) => {
    const opt = document.createElement("option");
    opt.value = city;
    opt.textContent = city;
    citySelect.appendChild(opt);
  });
}

// Show alert messages
function showAlert(message, type = "error") {
  const alert = document.createElement("div");
  alert.className = `alert ${type}`;
  alert.innerHTML = `${message}<button>×</button>`;
  alertContainer.appendChild(alert);
  setTimeout(() => alert.remove(), 3000);
  alert.querySelector("button").addEventListener("click", () => alert.remove());
}

// Render full property listings
function renderProperties(properties, userId = "") {
  const noMsg = document.getElementById("no-properties-message");
  cardsContainer.innerHTML = "";
  noMsg.innerHTML = "";
  noMsg.style.display = "none";

  const filtered = properties.filter((p) => p.owner !== userId);
  if (!filtered.length) {
    noMsg.innerHTML = `<div class="no-properties"><p>No properties found.</p></div>`;
    noMsg.style.display = "block";
    return;
  }

  filtered.forEach((property) => {
    const card = document.createElement("div");
    card.className = "listing-card";
    card.innerHTML = `
      <img src="${property.thumbnail}" alt="${property.propertyType} Image"/>
      <div class="listing-info">
        <h3>${property.name} ${property.propertyType}</h3>
        <p class="city">
          <i class="fas fa-map-marker-alt"></i>
          ${property.location.city || "Unknown City"}
        </p>
        ${
          property.propertyType === "House"
            ? `<p class="price">From $${property.pricePerNight} per night</p>`
            : `<p class="price">Room Price From: $${property.minRoomPrice} per night</p>`
        }
        <a href="showDetails.html?id=${property._id}">
          <button>Book Now</button>
        </a>
      </div>
    `;
    cardsContainer.appendChild(card);
  });
}

// Fetch all properties
async function fetchAllProperties() {
  try {
    const res = await fetch(
      "http://localhost:5000/api/property/getAllProperties"
    );
    const result = await res.json();
    console.log(`hhhhhhhhhhhhhhhhhhhh`);
    console.log(`result:${result}`);
    if (res.ok) {
      renderProperties(result.data, result.user?.id || "");
    } else {
      throw new Error(result.message || "Failed to load properties.");
    }
  } catch (err) {
    console.error("Error fetching properties:", err);
    showAlert("Error fetching properties. Please try again.");
  }
}

// Search handler
async function searchProperties(city, type, name, minP, maxP) {
  try {
    const res = await fetch(
      "http://localhost:5000/api/property/searchProperties",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city,
          propertyType: type,
          name,
          minPrice: minP,
          maxPrice: maxP,
        }),
      }
    );
    const result = await res.json();
    if (res.ok) {
      renderProperties(result.data, result.user?.id || "");
    } else {
      throw new Error(result.message || "Search failed.");
    }
  } catch (err) {
    console.error("Error searching properties:", err);
    showAlert("Error searching properties. Please try again.");
  }
}

// Grid toggle for listings
function setupGridToggle() {
  const btns = document.querySelectorAll(".grid-btn");
  const grid = cardsContainer;
  const saved = localStorage.getItem("gridLayout") || "3";
  grid.classList.remove("grid-1", "grid-2", "grid-3");
  grid.classList.add(`grid-${saved}`);
  btns.forEach((b) => b.classList.toggle("active", b.dataset.grid === saved));
  btns.forEach((b) =>
    b.addEventListener("click", () => {
      const g = b.dataset.grid;
      grid.classList.remove("grid-1", "grid-2", "grid-3");
      grid.classList.add(`grid-${g}`);
      btns.forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      localStorage.setItem("gridLayout", g);
    })
  );
}

// Handle search form submit
searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(searchForm);
  const city = fd.get("city"),
    name = fd.get("name").trim();
  const type = fd.get("property-type");
  const minP = fd.get("minPrice") ? parseFloat(fd.get("minPrice")) : null;
  const maxP = fd.get("maxPrice") ? parseFloat(fd.get("maxPrice")) : null;
  if (minP != null && maxP != null && maxP < minP) {
    showAlert("Max price must be ≥ Min price");
    return;
  }
  await searchProperties(city, type, name, minP, maxP);
});

// Render recommendation cards (uses same .listing-card styles)
function renderRecommendations(recs) {
  recommendedContainer.innerHTML = "";
  if (!recs.length) {
    recommendedSection.style.display = "none";
    return;
  }
  recs.forEach((prop) => {
    const card = document.createElement("div");
    card.className = "place-card listing-card";
    card.innerHTML = `
      <img src="${prop.thumbnail}" alt="${prop.name}" />
      <div class="listing-info place-info">
        <h4>${prop.name}</h4>
        <p class="city"><i class="fas fa-map-marker-alt"></i> ${prop.location.city}</p>
        <a href="showDetails.html?id=${prop._id}"><button>View Details</button></a>
      </div>
    `;
    recommendedContainer.appendChild(card);
  });
}

// Fetch & display top-5 recommendations
async function fetchRecommendations() {
  try {
    const res = await fetch(
      "http://localhost:5000/api/property/getBasicRecommendations",
      {
        credentials: "include",
      }
    );
    if (!res.ok) throw new Error("Failed to fetch recommendations");
    const { recommendations } = await res.json();
    renderRecommendations(recommendations.slice(0, 5));
  } catch (err) {
    console.error("Recommendations error:", err);
    recommendedSection.style.display = "none";
  }
}

// Initialize
window.onload = () => {
  populateCityDropdown();
  fetchRecommendations();
  fetchAllProperties();
  setupGridToggle();
  setupLogout();
};
