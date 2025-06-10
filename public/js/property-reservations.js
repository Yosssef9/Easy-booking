const urlParams = new URLSearchParams(window.location.search);
const propertyId = urlParams.get("id");
console.log(propertyId);
async function getAllReservations() {
  const propertyId = new URLSearchParams(window.location.search).get("id");

  try {
    const response = await fetch(
      `http://localhost:5000/api/property/getProperty-Reservations/${propertyId}`,
      {
        method: "GET",
        credentials: "include", // 🔥 THIS IS IMPORTANT
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const result = await response.json();
    console.log(result);
    if (response.ok) {
      displayAllReservations(result.data);
    } else {
      // const errorData = await response.json();
      console.log("no reservations");
      document.getElementById("reservations-container").innerHTML = `
        <div class="no-reservations">
          <p>No reservations found.</p>
        </div>
      `;
      // throw new Error(errorData.message || "Failed to fetch reservations.");
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
        <h3>Tenant: ${Reservation.tenant.username}</h3>
        <p>Start Date: ${reservationStartDate}</p>
        <p>End Date:   ${reservationEndDate}</p>
        ${statusHTML}
      `;
    let headerTitle = document.getElementById("headerTitle");
    headerTitle.innerHTML = `Reservations for: ${Reservation.propertyId.name}`;
    reservationsContainer.appendChild(div);
  });
}

getAllReservations();

// import logout function
import { setupLogout } from "./utils.js";

setupLogout();
