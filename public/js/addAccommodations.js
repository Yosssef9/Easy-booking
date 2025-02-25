// Array of cities in Egypt
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

// Function to populate the dropdown with Egyptian cities
function populateCities() {
  const citySelect = document.getElementById("house-city");

  egyptCities.forEach((city) => {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    citySelect.appendChild(option);
  });
}

// Call the function to populate the cities when the page loads
window.onload = populateCities;

// Function to show additional fields based on property type (hotel or house)
function showAdditionalFields() {
  const propertyType = document.getElementById("property-type").value;
  const hotelFields = document.getElementById("hotel-fields");
  const houseFields = document.getElementById("house-fields");

  if (propertyType === "hotel") {
    hotelFields.style.display = "block";
    houseFields.style.display = "none";
  } else if (propertyType === "house") {
    houseFields.style.display = "block";
    hotelFields.style.display = "none";
  } else {
    hotelFields.style.display = "none";
    houseFields.style.display = "none";
  }
}

// Function to handle form submission
document
  .querySelector(".accommodation-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent default form submission

    const propertyType = document.getElementById("property-type").value;
    let imageField, thumbnailField;

    // Select the correct image input field based on property type
    if (propertyType === "hotel") {
      imageField = document.getElementById("hotel-image");
    } else if (propertyType === "house") {
      imageField = document.getElementById("house-image");
      thumbnailField = document.getElementById("house-thumbnail"); // Thumbnail field
    }

    // Check if at least one image is selected
    if (imageField && imageField.files.length === 0) {
      alert("Please upload at least one image.");
      return;
    }
    if (thumbnailField && thumbnailField.files.length === 0) {
      alert("Please upload a thumbnail image.");
      return;
    }
    // Create FormData object to send form data and files
    const formData = new FormData();
    formData.append("propertyType", propertyType); // Backend expects "propertyType"

    if (propertyType === "hotel") {
      formData.append("name", document.getElementById("hotel-name").value);
      formData.append(
        "pricePerNight",
        document.getElementById("hotel-price").value
      );
      formData.append(
        "maxGuests",
        document.getElementById("hotel-max-guests").value
      );
      formData.append("city", document.getElementById("hotel-city").value);
      formData.append("zone", document.getElementById("hotel-zone").value);
      formData.append("street", document.getElementById("hotel-street").value);

      // Send amenities as JSON string
      formData.append(
        "amenities",
        JSON.stringify(
          Array.from(
            document.getElementById("hotel-amenities").selectedOptions
          ).map((option) => option.value)
        )
      );

      // Append multiple images
      for (let i = 0; i < imageField.files.length; i++) {
        formData.append("images", imageField.files[i]); // Backend expects "images"
      }
    } else if (propertyType === "house") {
      formData.append("name", document.getElementById("house-name").value);
      formData.append(
        "pricePerNight",
        document.getElementById("house-price").value
      );
      formData.append(
        "maxGuests",
        document.getElementById("house-max-guests").value
      );
      formData.append("city", document.getElementById("house-city").value);
      formData.append("zone", document.getElementById("house-zone").value);
      formData.append("street", document.getElementById("house-street").value);
      formData.append(
        "houseNumber",
        document.getElementById("house-number").value
      );
      formData.append(
        "description",
        document.getElementById("house-description").value
      );

      // Send amenities as JSON string
      formData.append(
        "amenities",
        JSON.stringify(
          Array.from(
            document.getElementById("house-amenities").selectedOptions
          ).map((option) => option.value)
        )
      );
      formData.append("house-thumbnail", thumbnailField.files[0]);

      // Append multiple images
      for (let i = 0; i < imageField.files.length; i++) {
        formData.append("house-image", imageField.files[i]);
      }
    }

    // Log FormData to check if all fields are appended correctly
    console.log("FormData Entries:");
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    // Send data using Fetch API
    try {
      const response = await fetch(
        "http://localhost:5000/api/house/add-house",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("Accommodation added successfully:", result);
        alert("Accommodation added successfully!");
        document.querySelector(".accommodation-form").reset(); // Clear the form
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add accommodation.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("There was an error adding the accommodation. Please try again.");
    }
  });




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