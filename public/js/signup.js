const alertContainer = document.getElementById("alert-container");

function showAlert(message, type = "error") {
  const alert = document.createElement("div");
  alert.className = `alert ${type}`;
  alert.innerHTML = `${message}<button>×</button>`;
  alertContainer.appendChild(alert);
  setTimeout(() => alert.remove(), 3000);
  alert.querySelector("button").addEventListener("click", () => alert.remove());
}
// Array of cities in Egypt
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

// Function to populate the dropdown with Egyptian cities
function populateCities() {
  const citySelect = document.getElementById("favouriteCity");

  egyptCities.forEach((city) => {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    citySelect.appendChild(option);
  });
}

// Call the function to populate the cities when the page loads
window.onload = populateCities;

// Handle Signup Form Submission
const signupForm = document.getElementById("signup-form");

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get values from the form fields
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const yearBirth = document.getElementById("yearOfBirth").value.trim();
    const phoneNumber = document.getElementById("phoneNumber").value.trim();
    const avargePrice = document.getElementById("avargePrice").value.trim();
    const favouriteCity = document.getElementById("favouriteCity").value.trim();
    const termsAccepted = document.getElementById("terms").checked;

    // Check if all fields are filled and if terms are accepted
    if (
      !username ||
      !email ||
      !password ||
      !yearBirth ||
      !phoneNumber ||
      !favouriteCity ||
      !avargePrice ||
      !termsAccepted
    ) {
      showAlert("Please fill in all fields and accept the terms.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
          yearBirth,
          phoneNumber,
          avargePrice,
          favouriteCity,
        }),
      });
      const data = await response.json();
      console.log(data);

      if (data.success) {
        showAlert("Signup successful! Redirecting to login page.","success");
        window.location.href = "/login"; // Redirect to login page after signup
      } else {
        showAlert(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      showAlert(error.message);
    }
  });
}

console.log("Script loaded");
