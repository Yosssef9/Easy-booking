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
  const citySelect = document.querySelector(".city");

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
    document.getElementById("house-thumbnail").disabled = true;
  } else if (propertyType === "house") {
    houseFields.style.display = "block";
    hotelFields.style.display = "none";
  } else {
    hotelFields.style.display = "none";
    houseFields.style.display = "none";
  }
}

// Function to handle form submission
// Function to handle form submission
document
  .querySelector(".accommodation-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent default form submission

    const propertyType = document.getElementById("property-type").value;
    let imageField, thumbnailField;

    // Select the correct image input field based on property type
    if (propertyType === "hotel") {
      thumbnailField = document.getElementById("hotel-thumbnail"); // Thumbnail field
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

    // Ensure at least one room is added for hotel property
    if (propertyType === "hotel" && !document.querySelector(".hotel-room")) {
      alert("Please add at least one room.");
      return;
    }

    // Create FormData object to send form data and files
    const formData = new FormData();
    formData.append("propertyType", propertyType); // Backend expects "propertyType"

    if (propertyType === "hotel") {
      formData.append("name", document.getElementById("hotel-name").value);
      formData.append(
        "description",
        document.getElementById("hotel-description").value
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

      formData.append("hotel-thumbnail", thumbnailField.files[0]);

      // Loop through each room and add room data
      const roomsData = [];
      document.querySelectorAll(".hotel-room").forEach((roomDiv) => {
        const roomType = roomDiv.querySelector("select").value;
        const pricePerNight = roomDiv.querySelector(
          "input[placeholder='Price per Night']"
        ).value;
        const maxGuests = roomDiv.querySelector(
          "input[placeholder='Max Guests']"
        ).value;
        const NumberOfRooms = roomDiv.querySelector(
          "input[placeholder='Number Of Rooms']"
        ).value;
        const amenities = Array.from(
          roomDiv.querySelector("#hotel-amenities").selectedOptions
        ).map((option) => option.value);
        const roomImages = roomDiv.querySelector("#roomImages").files;
        const thumbnail = roomDiv.querySelector("#roomThumbnail").files[0];
        console.log("roomImages:", roomImages);
        console.log("thumbnail:", thumbnail);
        // Add room data to formData
        roomsData.push({
          roomType,
          pricePerNight,
          maxGuests,
          amenities,
          roomImages,
          thumbnail,
          NumberOfRooms,
        });
      });

      formData.append("rooms", JSON.stringify(roomsData));
      // Send data using Fetch API
      fetchApi(`http://localhost:5000/api/hotel/add-hotel`, formData);

      // Send all rooms as JSON string
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
    fetchApi(`http://localhost:5000/api/house/add-house`, formData);
  });

const roomTypes = ["Single Room", "Double Room", "Suite"];

function addHotelRoom() {
  const container = document.getElementById("hotel-rooms-container");

  const roomDiv = document.createElement("div");
  roomDiv.classList.add("hotel-room");

  // Room Type Select
  const roomTypeSelect = document.createElement("select");
  roomTypeSelect.required = true;
  let defaultOption = document.createElement("option");
  defaultOption.textContent = "Select...";
  defaultOption.disabled = true;
  defaultOption.defaultSelected = true;
  roomTypeSelect.appendChild(defaultOption);
  roomTypes.forEach((type) => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    roomTypeSelect.appendChild(option);
  });
  roomTypeSelect.addEventListener("change", validateRoomSelection);

  // Price Per Night
  const priceInput = document.createElement("input");
  priceInput.type = "number";
  priceInput.placeholder = "Price per Night";
  priceInput.required = true;
  priceInput.min = 1;

  // Max Guests
  const guestsInput = document.createElement("input");
  guestsInput.type = "number";
  guestsInput.placeholder = "Max Guests";
  guestsInput.required = true;

  const amenitiesLabel = document.createElement("label");
  amenitiesLabel.textContent = "Amenities:";
  amenitiesLabel.setAttribute("for", "hotel-amenities");

  const amenitiesSelect = document.createElement("select");
  amenitiesSelect.id = "hotel-amenities";
  amenitiesSelect.name = "hotel-amenities[]";
  amenitiesSelect.multiple = true; // Allow multiple selections

  const amenitiesOptions = [
    "Wi-Fi",
    "TV",
    "Air Conditioning",
    "Heating",
    "Mini Fridge",
    "Safe Box",
    "Room Service",
    "Balcony",
    "Coffee Maker",
    "Hair Dryer",
    "Iron & Ironing Board",
    "Towels & Toiletries",
    "Work Desk",
    "Sofa",
    "Extra Bed",
    "Bathtub",
    "Shower",
    "City View",
    "Sea View",
    "Mountain View",
  ];
  amenitiesOptions.forEach((amenity) => {
    const option = document.createElement("option");
    option.value = amenity.toLowerCase(); // Use lowercase values (e.g., wifi, gym)
    option.textContent = amenity;
    amenitiesSelect.appendChild(option);
  });

  // Image URLs
  const imagesLabel = document.createElement("label");
  imagesLabel.textContent = "Images:";
  const imagesInput = document.createElement("input");
  imagesInput.id = "roomImages";

  imagesInput.type = "file";
  imagesInput.placeholder = "Images";
  imagesInput.required = true;
  imagesInput.accept = "image/*";

  // Thumbnail
  const thumbnailLabel = document.createElement("label");
  thumbnailLabel.textContent = "Thumbnail:";

  const thumbnailInput = document.createElement("input");
  thumbnailInput.type = "file";
  thumbnailInput.id = "roomThumbnail";

  thumbnailInput.placeholder = "Thumbnail";
  thumbnailInput.required = true;
  thumbnailInput.accept = "image/*";
  // numeber of rooms
  const numeberOfRoomsInput = document.createElement("input");
  numeberOfRoomsInput.type = "number";
  numeberOfRoomsInput.placeholder = "Number Of Rooms";
  numeberOfRoomsInput.required = true;
  numeberOfRoomsInput.min = 1;

  // Remove Button
  const removeButton = document.createElement("button");
  removeButton.style.backgroundColor = "#d43f3f";
  removeButton.type = "button";
  removeButton.textContent = "Remove";
  removeButton.onclick = () => {
    container.removeChild(roomDiv);
    validateRoomSelection();
  };
  let addRoomBtn = document.getElementById("addRoomBtn");
  // Append Inputs
  roomDiv.appendChild(roomTypeSelect);
  roomDiv.appendChild(priceInput);
  roomDiv.appendChild(guestsInput);
  roomDiv.appendChild(amenitiesLabel);
  roomDiv.appendChild(amenitiesSelect);
  roomDiv.appendChild(imagesLabel);
  roomDiv.appendChild(imagesInput);
  roomDiv.appendChild(thumbnailLabel);
  roomDiv.appendChild(thumbnailInput);
  roomDiv.appendChild(numeberOfRoomsInput);
  roomDiv.appendChild(removeButton);
  container.insertBefore(roomDiv, addRoomBtn);

  validateRoomSelection();
}

function validateRoomSelection() {
  const selectedTypes = [
    ...document.querySelectorAll(".hotel-room select"),
  ].map((select) => select.value);
  document.querySelectorAll(".hotel-room select option").forEach((option) => {
    option.disabled = selectedTypes.includes(option.value);
  });
}

async function fetchApi(url, formData) {
  console.log("formData:", formData);
  try {
    const response = await fetch(`${url}`, {
      method: "POST",
      body: formData,
    });

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
}

document.getElementById("logout").addEventListener("click", function (e) {
  e.preventDefault(); // Prevent default link behavior

  fetch("http://localhost:5000/api/auth/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Ensure cookies are included
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message === "Logout successful") {
        window.location.href = "/login"; // Redirect after logout
      }
    })
    .catch((error) => console.error("Error logging out:", error));
});
