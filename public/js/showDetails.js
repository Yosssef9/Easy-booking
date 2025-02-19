let propertyData = null;

document.addEventListener("DOMContentLoaded", () => {
  const stripe = Stripe(
    "pk_test_51QtUnvBmn7mp6OnVNPOAqqFGZt8E4uErl1tIF5oOsycfhVuLPmkYQXfzmjkDsTtRTp1tWHlvyYv1XSbXJKnZtFsM00ZGq4hLPG"
  ); // Replace with your public key

  const cardElement = document.getElementById("card-element");
  const paymentForm = document.getElementById("payment-form");
  const payBtn = document.getElementById("payBtn"); // Pay Now button inside the payment form
  const paymentModal = document.getElementById("payment-modal"); // Modal
  const closeBtn = document.getElementById("close-btn"); // Close button inside the modal
  const proceedToPay = document.getElementById("proceedToPay");
  const startDate = document.getElementById("startDate");
  const endDate = document.getElementById("endDate");
  const errorMessage = document.getElementById("error-message");
  const modal = document.getElementById("modal");
  const overlay = document.getElementById("overlay");
  const closeModal = document.getElementById("closeModal");

  // Fetch property details
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
      propertyDetails.innerHTML = `
        <h2 id="name">${data.propertyType}: ${data.name}</h2>
        <div class="hotel-card-content">
          <img src="${data.thumbnail}" alt="" />
          <div class="hotel-info">
            <h3>Luxury Oceanview Suite</h3>
            <p>
              Located by the beach, this luxurious suite offers stunning
              ocean views and world-class amenities.
            </p>
            <ul>
              <li id="price">Price: $${data.pricePerNight} per night</li>
              <li id="Amenities">Amenities: ${data.amenities}</li>
              <li id="rating">Rating: ${data.rating}/5</li>
              ${
                data.propertyType.toLowerCase() === "house"
                  ? `<li id="available">Available: ${data.available}</li>`
                  : `<li id="rooms-available">Rooms Available: 5</li>`
              }
            </ul>
            <button id="bookBtn">Book Now</button>
          </div>
        </div>
         <h3 id="property_description">${data.propertyType} Description</h3>
         <p id="description">${data.description}.</p>

         <h3>Location</h3>
         <p>
           <span id="house-number">House Number: ${
             data.location.houseNumber
           }</span>,
           <span id="street">Street: ${data.location.street}</span>,
           <span id="zone">Zone: ${data.location.zone}</span>,
           <span id="city">City: ${data.location.city}</span>
         </p> 
      `;

      // Add event listener to the Book Now button
      const bookBtn = document.getElementById("bookBtn");
      if (bookBtn) {
        bookBtn.addEventListener("click", () => {
          modal.classList.remove("hidden");
          overlay.classList.remove("hidden");
        });
      }
    } catch (error) {
      console.error("Error fetching property details:", error);
    }
  }
  fetchPropertyDetails(propertyId);

  // Function to create the PaymentIntent
  function createPaymentIntent(amount) {
    fetch("http://localhost:5000/api/auth/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    })
      .then((response) => response.json())
      .then((data) => {
        const clientSecret = data.clientSecret;

        // Create an instance of Stripe Elements
        const elements = stripe.elements();
        const card = elements.create("card");
        card.mount(cardElement);

        // Handle the payment when the "Pay Now" button is clicked
        if (payBtn) {
          payBtn.addEventListener("click", function () {
            payBtn.disabled = true; // Disable to prevent multiple clicks

            stripe
              .confirmCardPayment(clientSecret, {
                payment_method: {
                  card: card,
                },
              })
              .then((result) => {
                if (result.error) {
                  console.error(result.error.message);
                  alert("Payment failed: " + result.error.message);
                } else {
                  let reservationData = {
                    propertyId: propertyId,
                    reservationStartDate: startDate.value,
                    reservationEndDate: endDate.value,
                  };
                  makeReservation(reservationData);
                  paymentModal.style.display = "none"; // Show the modal

                  alert("Payment successful!");
                }
              })
              .catch((error) => {
                console.error("Error during payment:", error);
                alert("An error occurred during the payment process.");
              })
              .finally(() => {
                payBtn.disabled = false; // Re-enable after processing
              });
          });
        }
      })
      .catch((error) => console.error("Error creating payment intent:", error));
  }

  // Close modal when the close button is clicked
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      console.log("closeBtn clicked");
      paymentModal.style.display = "none"; // Close the modal
    });
  }

  // Close modal if clicked outside of the modal content
  window.addEventListener("click", (event) => {
    if (event.target === paymentModal) {
      paymentModal.style.display = "none"; // Close the modal
    }
  });

  // Function to close the booking modal
  function closeModalFunc() {
    modal.classList.add("hidden");
    overlay.classList.add("hidden");
    errorMessage.textContent = "";
    proceedToPay.disabled = true;
    startDate.value = "";
    endDate.value = "";
  }

  // Function to validate dates
  function validateDates(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    console.log(`startDate: ${startDate}`);
    console.log(`endDate: ${endDate}`);
    console.log(`start: ${start}`);
    console.log(`end: ${end}`);
    // Ensure both dates are selected
    if (!startDate || !endDate) {
      errorMessage.textContent = "Please select both start and end dates.";
      setTimeout(() => {
        errorMessage.textContent = "";
      }, 3000);
      return false;
    }

    // Ensure end date is after start date
    if (end <= start) {
      errorMessage.textContent = "End date must be after the start date.";
      setTimeout(() => {
        errorMessage.textContent = "";
      }, 3000);
      return false;
    }

    return true; // Validation successful
  }

  // Add event listeners
  if (closeModal) closeModal.addEventListener("click", closeModalFunc);

  // Fix for Proceed to Pay button
  if (proceedToPay) {
    proceedToPay.addEventListener("click", async () => {
      console.log("proceedToPay clicked");
      if (validateDates(startDate.value, endDate.value)) {
        let available = await checkReservationAvailability(
          propertyId,
          startDate.value,
          endDate.value
        );
        if (available) {
          const price = propertyData.pricePerNight * 100; // Convert price to cents
          createPaymentIntent(price);
          paymentModal.style.display = "block"; // Show the modal
          modal.classList.add("hidden");
          overlay.classList.add("hidden");
        } else {
          errorMessage.textContent =
            "Sorry Your Chosen Date is Unavailable try to choose another date";
          setTimeout(() => {
            errorMessage.textContent = "";
          }, 3000);
        }
      }
    });
  } else {
    console.error("proceedToPay button not found!");
  }
});

async function checkReservationAvailability(propertyId, startDate, endDate) {
  try {
    const response = await fetch(
      `http://localhost:5000/api/auth/check-reservation-availability/${propertyId}?startDate=${startDate}&endDate=${endDate}`
    );
    const data = await response.json();
    console.log(" Data:", data);
    return data.available;
  } catch (error) {
    console.log(" error:", error);
  }
}

async function makeReservation(reservationData) {
  try {
    const response = await fetch(
      `http://localhost:5000/api/auth/makeReservation`,
      {
        method: "POST", // Use POST method
        headers: {
          "Content-Type": "application/json", // Ensure the body is JSON
        },
        body: JSON.stringify(reservationData), // Send reservation data as a JSON string
      }
    );

    const data = await response.json();
    console.log("Data:", data);
  } catch (error) {
    console.log("Error:", error);
  }
}
