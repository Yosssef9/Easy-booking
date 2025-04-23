async function getAllReservations() {
  try {
    const response = await fetch(
      "http://localhost:5000/api/property/getAllReservations",
      {
        method: "GET",
      }
    );

    if (response.ok) {
      const result = await response.json();
      console.log(result);
      displayAllReservations(result.data);
    } else {
      console.log("no reservations");
      const reservationsContainer = document.getElementById(
        "reservations-container"
      );

      reservationsContainer.innerHTML = `
        <div class="no-reservations">
          <p>No reservations found.</p>
        </div>
      `;
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch reservations.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("There was an error fetching the reservations. Please try again.");
  }
}

async function displayAllReservations(data) {
  let reservationsContainer = document.getElementById("reservations-container");
  data.forEach((Reservation) => {
    let div = document.createElement("div");
    div.classList.add("reservation-card");

    // Conditional HTML for status
    let statusHTML = Reservation.isTheReservationOver
      ? '<span class="status expired">Expired</span>'
      : '<span class="status active">Active</span>';
    let reservationStartDate = new Date(Reservation.reservationStartDate);
    let reservationEndDate = new Date(Reservation.reservationEndDate);
    reservationStartDate = reservationStartDate.toLocaleDateString();
    reservationEndDate = reservationEndDate.toLocaleDateString();

    div.innerHTML = `
        <h3>${Reservation.propertyId.name}</h3>
        <p>Start Date: ${reservationStartDate}</p>
        <p>End Date:   ${reservationEndDate}</p>
        ${statusHTML}
      `;

    reservationsContainer.appendChild(div);
  });
}

getAllReservations();

// import logout function
import { setupLogout } from "./utils.js";

setupLogout()

