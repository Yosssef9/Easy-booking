let cardsContainer = document.getElementById("cards-container");
async function fetchHouses() {
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
      result.data.forEach((property) => {
        let propertyCard = document.createElement("div");
        propertyCard.classList.add("listing-card");
        console.log("property :", property);
        propertyCard.innerHTML = `
        <img src="${property.thumbnail}" alt="Hotel Image" />
        <div class="listing-info">
            <h3>${property.propertyType}</h3>
            <p>From $${property.pricePerNight} per night</p>
            <a href="showDetails.html?id=${property._id}">
                <button>Book Now</button>
            </a>
        </div>
    `;

        cardsContainer.appendChild(propertyCard);
      });
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to get data.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("There was an error get data. Please try again.");
  }
}

window.onload = fetchHouses;




document.getElementById("logout").addEventListener("click", function (e) {
  e.preventDefault();  // Prevent default link behavior

  fetch("http://localhost:5000/api/auth/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",  // Ensure cookies are included
  })
  .then(response => response.json())
  .then(data => {
    if (data.message === "Logout successful") {
      window.location.href = "/login";  // Redirect after logout
    }
  })
  .catch(error => console.error("Error logging out:", error));
});