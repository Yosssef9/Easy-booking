async function getAllProperties() {
  try {
    const response = await fetch(
      "http://localhost:5000/api/property/getAllUserProperties",
      {
        method: "GET",
      }
    );

    if (response.ok) {
      const result = await response.json();
      console.log(result);
      displayAllProperties(result.data);
    } else {
      console.log("no properties");
      const reservationsContainer = document.getElementById(
        "properties-container"
      );

      reservationsContainer.innerHTML = `
              <div class="no-properties">
                <p>No properties found.</p>
              </div>
            `;
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch properties.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("There was an error fetching the properties. Please try again.");
  }
}

async function displayAllProperties(data) {
  const propertiesContainer = document.getElementById("properties-container");

  data.forEach((property) => {
    // Create the <a> element
    const link = document.createElement("a");
    link.href = `property-reservations.html?id=${property._id}`;
    link.classList.add("property-link"); // Optional class for styling

    // Create the property card
    const div = document.createElement("div");
    div.classList.add("property-card");

    div.innerHTML = `
      <img src="${property.thumbnail}" alt="${property.name}">
      <h3>${property.name}</h3>
    `;

    // Append the card to the link, and the link to the container
    link.appendChild(div);
    propertiesContainer.appendChild(link);
  });
}

getAllProperties();

// import logout function
import { setupLogout } from "./utils.js";

setupLogout();
