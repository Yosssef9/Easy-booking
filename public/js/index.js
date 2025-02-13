let cardsContainer = document.getElementById("cards-container");
async function fetchHouses() {
  try {
    const response = await fetch("http://localhost:5000/api/house/get-houses", {
      method: "GET",
    });

    if (response.ok) {
      const result = await response.json();
      console.log("Houses data:", result);
      result.data.forEach((house) => {
        let houseCard = document.createElement("div");
        houseCard.classList.add("listing-card");
        console.log("house :", house);
        houseCard.innerHTML = `
        <img
              src="${house.thumbnail}"
              alt="Hotel Image"
            />
            <div class="listing-info">
              <h3>Hotel</h3>
              <p>From $${house.pricePerNight} per night</p>
              <button>Book Now</button>
            </div>
      `;
        cardsContainer.appendChild(houseCard);
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
