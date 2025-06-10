let cardsContainer = document.getElementById("cards-container");
const searchForm = document.querySelector(".search-form");
const alertContainer = document.getElementById("alert-container");
const citySelect = searchForm.querySelector('select[name="city"]');

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

function populateCityDropdown() {
  egyptCities.forEach((city) => {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    citySelect.appendChild(option);
  });
}

function showAlert(message, type = "error") {
  const alert = document.createElement("div");
  alert.className = `alert ${type}`;
  alert.innerHTML = `
    ${message}
    <button>×</button>
  `;
  alertContainer.appendChild(alert);

  setTimeout(() => alert.remove(), 3000);
  alert.querySelector("button").addEventListener("click", () => alert.remove());
}

function renderProperties(properties, userId = "") {
  const noMessageBox = document.getElementById("no-properties-message");
  cardsContainer.innerHTML = ""; // Clear previous listings
  noMessageBox.innerHTML = ""; // Clear previous messages
  noMessageBox.style.display = "none";

  const filteredProperties = properties.filter(
    (property) => property.owner !== userId
  );

  if (filteredProperties.length === 0) {
    console.log("No properties found.");
    noMessageBox.innerHTML = `
      <div class="no-properties">
        <p>No properties found.</p>
      </div>
    `;
    noMessageBox.style.display = "block";
    return;
  }

  filteredProperties.forEach((property) => {
    let propertyCard = document.createElement("div");
    propertyCard.classList.add("listing-card");
    propertyCard.innerHTML = `
      <img src="${property.thumbnail}" alt="${property.propertyType} Image" />
      <div class="listing-info">
          <h3>${property.name} ${property.propertyType}</h3>
          <p class="city"><i class="fas fa-map-marker-alt"></i> ${
            property.location.city || "Unknown City"
          }</p>
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
    cardsContainer.appendChild(propertyCard);
  });
}

async function fetchAllProperties() {
  try {
    const response = await fetch(
      "http://localhost:5000/api/property/getAllProperties",
      {
        method: "GET",
      }
    );
    const result = await response.json();

    console.log(result);
    if (response.ok) {
      renderProperties(result.data, result.user?.id || "");
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to get data.");
    }
  } catch (error) {
    console.error("Error:", error);
    showAlert("Error fetching properties. Please try again.");
  }
}

async function searchProperties(city, propertyType, name, minPrice, maxPrice) {
  try {
    const response = await fetch(
      "http://localhost:5000/api/property/searchProperties",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, propertyType, name, minPrice, maxPrice }),
      }
    );

    if (response.ok) {
      const result = await response.json();
      renderProperties(result.data, result.user?.id || "");
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to search properties.");
    }
  } catch (error) {
    console.error("Error:", error);
    showAlert("Error searching properties. Please try again.");
  }
}

function setupGridToggle() {
  const gridButtons = document.querySelectorAll(".grid-btn");
  const cardsGrid = document.getElementById("cards-container");
  const savedGrid = localStorage.getItem("gridLayout") || "3";

  cardsGrid.classList.remove("grid-1", "grid-2", "grid-3");
  cardsGrid.classList.add(`grid-${savedGrid}`);
  gridButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.grid === savedGrid);
  });

  gridButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const gridSize = button.dataset.grid;
      cardsGrid.classList.remove("grid-1", "grid-2", "grid-3");
      cardsGrid.classList.add(`grid-${gridSize}`);
      gridButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      localStorage.setItem("gridLayout", gridSize);
    });
  });
}

// ✅ Form submission handler with price validation
searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(searchForm);

  const city = formData.get("city");
  const name = formData.get("name").trim();
  const propertyType = formData.get("property-type");
  const minPrice = formData.get("minPrice")
    ? parseFloat(formData.get("minPrice"))
    : null;
  const maxPrice = formData.get("maxPrice")
    ? parseFloat(formData.get("maxPrice"))
    : null;

  if (minPrice !== null && maxPrice !== null && maxPrice < minPrice) {
    showAlert("Max price must be greater than or equal to Min price.");
    return;
  }

  await searchProperties(city, propertyType, name, minPrice, maxPrice);
});

// ✅ Init
window.onload = () => {
  populateCityDropdown();
  fetchAllProperties();
  setupGridToggle();
};

// Logout button setup (assumes utils.js exports setupLogout)
import { setupLogout } from "./utils.js";
setupLogout();
