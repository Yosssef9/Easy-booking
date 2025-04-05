let propertyData = null;
let selectedRoomType = null;

document.addEventListener("DOMContentLoaded", () => {
  const stripe = Stripe(
    "pk_test_51QtUnvBmn7mp6OnVNPOAqqFGZt8E4uErl1tIF5oOsycfhVuLPmkYQXfzmjkDsTtRTp1tWHlvyYv1XSbXJKnZtFsM00ZGq4hLPG"
  );

  const cardElement = document.getElementById("card-element");
  const paymentForm = document.getElementById("payment-form");
  const payBtn = document.getElementById("payBtn");
  const paymentModal = document.getElementById("payment-modal");
  const closeBtn = document.getElementById("close-btn");
  const proceedToPay = document.getElementById("proceedToPay");
  const startDate = document.getElementById("startDate");
  const endDate = document.getElementById("endDate");
  const errorMessage = document.getElementById("error-message");
  const modal = document.getElementById("modal");
  const overlay = document.getElementById("overlay");
  const closeModal = document.getElementById("closeModal");
  const roomSelectionModal = document.getElementById("room-selection-modal");
  const roomTypeList = document.getElementById("room-type-list");
  const proceedToDates = document.getElementById("proceedToDates");
  const closeRoomModal = document.getElementById("closeRoomModal");
  const roomErrorMessage = document.getElementById("room-error-message");

  const urlParams = new URLSearchParams(window.location.search);
  const propertyId = urlParams.get("id");

  async function fetchPropertyDetails(propertyId) {
    try {
      const response = await fetch(
        `http://localhost:5000/api/property/getProperty/${propertyId}`
      );
      const data = await response.json();
      console.log("Property Data:", data);
      propertyData = data;

      let propertyDetails = document.getElementById("property_details");
      if (data.propertyType.toLowerCase() === "house") {
        propertyDetails.innerHTML = `
          <h2 id="name">${data.propertyType}: ${data.name}</h2>
          <div class="hotel-card-content">
            <img src="${data.thumbnail}" alt="" />
            <div class="hotel-info">
              <h3>Luxury Oceanview Suite</h3>
              <p>${data.description}</p>
              <ul>
                <li id="price">Price: $${data.pricePerNight} per night</li>
                <li id="Amenities">Amenities: ${data.amenities}</li>
                <li id="rating">Rating: ${data.rating}/5</li>
              </ul>
              <button id="bookBtn">Book Now</button>
            </div>
          </div>
          <h3 id="property_description">${data.propertyType} Description</h3>
          <p id="description">${data.description}</p>
          <h3>Location</h3>
          <p>
            <span id="house-number">House Number: ${data.location.houseNumber}</span>,
            <span id="street">Street: ${data.location.street}</span>,
            <span id="zone">Zone: ${data.location.zone}</span>,
            <span id="city">City: ${data.location.city}</span>
          </p>
        `;
      } else if (data.propertyType.toLowerCase() === "hotel") {
        propertyDetails.innerHTML = `
          <h2 id="name">${data.propertyType}: ${data.name}</h2>
          <div class="hotel-card-content">
            <img src="${data.thumbnail}" alt="" />
            <div class="hotel-info">
              <h3>Available Room Types</h3>
              <p>${data.description}</p>
              <ul>
                <li id="price">Room Prices Start From: $${data.minRoomPrice} per night</li>
                <li id="Amenities">Amenities: ${data.amenities}</li>
                <li id="rating">Rating: ${data.rating}/5</li>
              </ul>
              <button id="bookBtn">Book Now</button>
            </div>
          </div>
          <h3 id="property_description">${data.propertyType} Description</h3>
          <p id="description">${data.description}</p>
          <h3>Location</h3>
          <p>
            <span id="street">Street: ${data.location.street}</span>,
            <span id="zone">Zone: ${data.location.zone}</span>,
            <span id="city">City: ${data.location.city}</span>
          </p>
        `;
        // Populate room type prices
        let roomTypeList = document.getElementById("room-type-list");
        roomTypeList.innerHTML = `
       
      ${
        data.roomTypes.single
          ? `
        <div class="room-card" data-type="single">
          <p><strong>Single Room</strong></p>
          <p>Price: $${data.roomTypes.single.price} per night</p>
        </div>
      `
          : ""
      }
      ${
        data.roomTypes.double
          ? `
        <div class="room-card" data-type="double">
          <p><strong>Double Room</strong></p>
          <p>Price: $${data.roomTypes.double.price} per night</p>
        </div>
      `
          : ""
      }
      ${
        data.roomTypes.suite
          ? `
        <div class="room-card" data-type="suite">
          <p><strong>Suite</strong></p>
          <p>Price: $${data.roomTypes.suite.price} per night</p>
        </div>
      `
          : ""
      }
     `;
        addRoomTypeSelectionListeners();
      }

      const bookBtn = document.getElementById("bookBtn");
      if (bookBtn) {
        bookBtn.addEventListener("click", () => {
          if (data.propertyType.toLowerCase() === "hotel") {
            roomSelectionModal.classList.remove("hidden");
            overlay.classList.remove("hidden");
            addRoomTypeSelectionListeners();
            const proceedToDates = document.getElementById("proceedToDates");
            const closeRoomModal = document.getElementById("closeRoomModal");
            proceedToDates.addEventListener("click", () => {
              if (!selectedRoomType) {
                roomErrorMessage.textContent = "Please select a room type.";
                setTimeout(() => (roomErrorMessage.textContent = ""), 3000);
                return;
              }
              roomSelectionModal.classList.add("hidden");
              modal.classList.remove("hidden");
            });
            closeRoomModal.addEventListener("click", () => {
              roomSelectionModal.classList.add("hidden");
              overlay.classList.add("hidden");
              selectedRoomType = null;
            });
          } else {
            modal.classList.remove("hidden");
            overlay.classList.remove("hidden");
          }
        });
      }
    } catch (error) {
      console.error("Error fetching property details:", error);
    }
  }
  fetchPropertyDetails(propertyId);

  // Add click listeners to room type cards
  function addRoomTypeSelectionListeners() {
    const roomCards = roomTypeList.querySelectorAll(".room-card");
    roomCards.forEach((card) => {
      card.addEventListener("click", () => {
        roomCards.forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");
        selectedRoomType = card.getAttribute("data-type");
        console.log(`selectedRoomType:${selectedRoomType}`);
      });
    });
  }

  // Proceed to date selection after selecting a room type
  if (proceedToDates) {
    proceedToDates.addEventListener("click", () => {
      if (!selectedRoomType) {
        roomErrorMessage.textContent = "Please select a room type.";
        setTimeout(() => (roomErrorMessage.textContent = ""), 3000);
        return;
      }
      roomSelectionModal.classList.add("hidden");
      modal.classList.remove("hidden");
    });
  }

  // Close room selection modal
  if (closeRoomModal) {
    closeRoomModal.addEventListener("click", () => {
      roomSelectionModal.classList.add("hidden");
      overlay.classList.add("hidden");
      selectedRoomType = null;
    });
  }

  // Payment Intent Creation
  function createPaymentIntent(amount) {
    fetch("http://localhost:5000/api/auth/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    })
      .then((response) => response.json())
      .then((data) => {
        const clientSecret = data.clientSecret;
        const elements = stripe.elements();
        const card = elements.create("card");
        card.mount(cardElement);

        payBtn.addEventListener("click", () => {
          payBtn.disabled = true;
          stripe
            .confirmCardPayment(clientSecret, {
              payment_method: { card: card },
            })
            .then((result) => {
              if (result.error) {
                alert("Payment failed: " + result.error.message);
              } else {
                let reservationData = {
                  propertyId: propertyId,
                  reservationStartDate: startDate.value,
                  reservationEndDate: endDate.value,
                  ...(propertyData.propertyType.toLowerCase() === "hotel" && {
                    roomType: selectedRoomType,
                  }),
                };
                makeReservation(reservationData);
                paymentModal.style.display = "none";
                alert("Payment successful!");
              }
            })
            .finally(() => (payBtn.disabled = false));
        });
      });
  }

  // Close payment modal
  closeBtn.addEventListener("click", () => {
    paymentModal.style.display = "none";
  });

  // Date validation and payment
  proceedToPay.addEventListener("click", async () => {
    if (validateDates(startDate.value, endDate.value)) {
      let available = await checkReservationAvailability(
        propertyId,
        startDate.value,
        endDate.value,
        propertyData.propertyType.toLowerCase() === "hotel"
          ? selectedRoomType
          : null
      );
      if (available) {
        const price =
          (propertyData.propertyType.toLowerCase() === "hotel"
            ? propertyData.roomTypes[selectedRoomType].price
            : propertyData.pricePerNight) * 100;
        createPaymentIntent(price);
        paymentModal.style.display = "block";
        modal.classList.add("hidden");
        overlay.classList.add("hidden");
      } else {
        errorMessage.textContent = "Selected dates are unavailable.";
        setTimeout(() => (errorMessage.textContent = ""), 3000);
      }
    }
  });

  closeModal.addEventListener("click", closeModalFunc);

  function closeModalFunc() {
    modal.classList.add("hidden");
    overlay.classList.add("hidden");
    errorMessage.textContent = "";
    startDate.value = "";
    endDate.value = "";
  }

  function validateDates(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (!startDate || !endDate) {
      errorMessage.textContent = "Please select both start and end dates.";
      setTimeout(() => (errorMessage.textContent = ""), 3000);
      return false;
    }
    if (end <= start) {
      errorMessage.textContent = "End date must be after the start date.";
      setTimeout(() => (errorMessage.textContent = ""), 3000);
      return false;
    }
    const today = new Date();
    if (start < today || end < today) {
      errorMessage.textContent = "Please choose a future date.";
      setTimeout(() => (errorMessage.textContent = ""), 3000);
      return false;
    }
    return true;
  }
});

async function checkReservationAvailability(
  propertyId,
  startDate,
  endDate,
  roomType = null
) {
  try {
    const url = roomType
      ? `http://localhost:5000/api/auth/check-reservation-availability/${propertyId}?startDate=${startDate}&endDate=${endDate}&roomType=${roomType}`
      : `http://localhost:5000/api/auth/check-reservation-availability/${propertyId}?startDate=${startDate}&endDate=${endDate}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.available;
  } catch (error) {
    console.error("Error checking availability:", error);
    return false;
  }
}

async function makeReservation(reservationData) {
  try {
    const response = await fetch(
      `http://localhost:5000/api/auth/makeReservation`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservationData),
      }
    );
    const data = await response.json();
    console.log("Reservation Data:", data);
  } catch (error) {
    console.error("Error making reservation:", error);
  }
}

document.getElementById("logout").addEventListener("click", function (e) {
  e.preventDefault();
  fetch("http://localhost:5000/api/auth/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message === "Logout successful") {
        window.location.href = "/login";
      }
    })
    .catch((error) => console.error("Error logging out:", error));
});
