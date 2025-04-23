let cardsContainer = document.getElementById("cards-container");
const searchForm = document.querySelector(".search-form");
const alertContainer = document.getElementById("alert-container");
const citySelect = searchForm.querySelector('select[name="city"]');

const egyptCities = [
  "Cairo",
  "Alexandria",
  "Giza",
  "Shubra El Kheima",
  "Port Said",
  "Suez",
  "Mansoura",
  "Tanta",
  "Asyut",
  "Ismailia",
  "Fayoum",
  "Zagazig",
  "Minya",
  "Damanhur",
  "Luxor",
  "Aswan",
  "Damietta",
  "Beni Suef",
  "Hurghada",
  "Marsa Alam",
  "Sharm El Sheikh",
  "Sohag",
  "Qena",
  "Kafr El Sheikh",
  "New Cairo",
  "6th of October City",
  "Borg El Arab",
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

  // Auto-remove after 3 seconds
  setTimeout(() => alert.remove(), 3000);

  // Manual close
  alert.querySelector("button").addEventListener("click", () => alert.remove());
}

function validateDates(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to midnight

  if (!startDate || !endDate) {
    showAlert("Please select both start and end dates.");
    return false;
  }
  if (isNaN(start) || isNaN(end)) {
    showAlert("Invalid date format.");
    return false;
  }
  if (end <= start) {
    showAlert("End date must be after the start date.");
    return false;
  }
  if (start < today || end < today) {
    showAlert("Please choose future dates.");
    return false;
  }
  return true;
}

function validateForm(city, checkin, checkout, propertyType) {
  if (!city) {
    showAlert("Please select a city.");
    return false;
  }
  if (!checkin) {
    showAlert("Please select a check-in date.");
    return false;
  }
  if (!checkout) {
    showAlert("Please select a check-out date.");
    return false;
  }
  if (!propertyType) {
    showAlert("Please select a property type.");
    return false;
  }
  return true;
}

function renderProperties(properties, userId = "") {
  cardsContainer.innerHTML = ""; // Clear existing cards
  if (properties.length === 0) {
    showAlert("No properties found.", "success");
  }

  const filteredProperties = properties.filter(
    (property) => property.owner !== userId
  );

  filteredProperties.forEach((property) => {
    let propertyCard = document.createElement("div");
    propertyCard.classList.add("listing-card");
    console.log("property:", property);
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

    if (response.ok) {
      const result = await response.json();
      console.log("property data:", result);
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

async function searchProperties(
  city = "",
  checkin = "",
  checkout = "",
  propertyType = ""
) {
  try {
    const query = new URLSearchParams();
    if (city) query.append("city", city);
    if (checkin) query.append("checkin", checkin);
    if (checkout) query.append("checkout", checkout);
    if (propertyType) query.append("propertyType", propertyType);

    const response = await fetch(
      `http://localhost:5000/api/property/searchProperties?${query.toString()}`,
      {
        method: "GET",
      }
    );

    if (response.ok) {
      const result = await response.json();
      console.log("search data:", result);
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

// Grid toggle functionality
function setupGridToggle() {
  const gridButtons = document.querySelectorAll(".grid-btn");
  const cardsGrid = document.getElementById("cards-container");
  const savedGrid = localStorage.getItem("gridLayout") || "3";

  // Set initial grid layout
  cardsGrid.classList.remove("grid-1", "grid-2", "grid-3");
  cardsGrid.classList.add(`grid-${savedGrid}`);
  gridButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.grid === savedGrid);
  });

  // Add event listeners to grid buttons
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

// Form submission
searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(searchForm);
  const city = formData.get("city").trim();
  const checkin = formData.get("checkin");
  const checkout = formData.get("checkout");
  const propertyType = formData.get("property-type");

  // Validate all fields are present
  if (!validateForm(city, checkin, checkout, propertyType)) {
    return;
  }

  // Validate dates
  if (!validateDates(checkin, checkout)) {
    return;
  }

  await searchProperties(city, checkin, checkout, propertyType);
});

// Initialize
window.onload = () => {
  populateCityDropdown();
  fetchAllProperties();
  setupGridToggle();
};

// Import logout function
import { setupLogout } from "./utils.js";
setupLogout();
