
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
function populateCities(ele) {
  const citySelect = document.querySelector(`#${ele}`);
  if (!citySelect) return; // Safety check

  egyptCities.forEach((city) => {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    citySelect.appendChild(option);
  });
}

// Call the function to populate the cities when the page loads
window.addEventListener("load", () => {
  populateCities("house-city");
  populateCities("hotel-city");
  // Initialize the form state
  showAdditionalFields();
});

// Function to show additional fields based on property type (hotel or house)
function showAdditionalFields() {
  const propertyType = document.getElementById("property-type").value;
  const hotelFields = document.getElementById("hotel-fields");
  const houseFields = document.getElementById("house-fields");

  if (propertyType === "hotel") {
    hotelFields.style.display = "block";
    houseFields.style.display = "none";

    // Enable hotel inputs
    Array.from(hotelFields.querySelectorAll("input, select, textarea")).forEach(
      (input) => {
        input.disabled = false;
      }
    );

    // Disable house inputs
    Array.from(houseFields.querySelectorAll("input, select, textarea")).forEach(
      (input) => {
        input.disabled = true;
      }
    );
  } else if (propertyType === "house") {
    houseFields.style.display = "block";
    hotelFields.style.display = "none";

    // Enable house inputs
    Array.from(houseFields.querySelectorAll("input, select, textarea")).forEach(
      (input) => {
        input.disabled = false;
      }
    );

    // Disable hotel inputs
    Array.from(hotelFields.querySelectorAll("input, select, textarea")).forEach(
      (input) => {
        input.disabled = true;
      }
    );
  } else {
    hotelFields.style.display = "none";
    houseFields.style.display = "none";

    // Disable both
    Array.from(hotelFields.querySelectorAll("input, select, textarea")).forEach(
      (input) => {
        input.disabled = true;
      }
    );
    Array.from(houseFields.querySelectorAll("input, select, textarea")).forEach(
      (input) => {
        input.disabled = true;
      }
    );
  }
}

// Add event listener for property type change
document
  .getElementById("property-type")
  .addEventListener("change", showAdditionalFields);

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
    } else {
      alert("Please select a property type.");
      return;
    }

    // Check if at least one image is selected (only applies to house)
    if (
      propertyType === "house" &&
      imageField &&
      imageField.files.length === 0
    ) {
      alert("Please upload at least one image.");
      return;
    }

    // Check thumbnail for both property types
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
      const hotelAmenities = document.getElementById("hotel-amenities");
      if (hotelAmenities) {
        formData.append(
          "amenities",
          JSON.stringify(
            Array.from(hotelAmenities.selectedOptions).map(
              (option) => option.value
            )
          )
        );
      }

      // Add thumbnail
      if (thumbnailField.files[0]) {
        formData.append("hotel-thumbnail", thumbnailField.files[0]);
      }

      // Handle room data correctly - process each room separately
      document.querySelectorAll(".hotel-room").forEach((roomDiv, index) => {
        // Get room data as simple values
        const roomData = {
          roomType: roomDiv.querySelector("select").value,
          pricePerNight: roomDiv.querySelector(
            "input[placeholder='Price per Night']"
          ).value,
          maxGuests: roomDiv.querySelector("input[placeholder='Max Guests']")
            .value,
          numberOfRooms: roomDiv.querySelector(
            "input[placeholder='Number Of Rooms']"
          ).value,
          amenities: Array.from(
            roomDiv.querySelector("select[id^='hotel-amenities-room']")
              .selectedOptions
          ).map((option) => option.value),
        };

        // Add room data as JSON string
        formData.append(`rooms[${index}][data]`, JSON.stringify(roomData));

        // Add room images separately
        const roomImagesInput = roomDiv.querySelector("#roomImages");
        if (roomImagesInput && roomImagesInput.files) {
          for (let i = 0; i < roomImagesInput.files.length; i++) {
            formData.append(
              `rooms[${index}][images][${i}]`,
              roomImagesInput.files[i]
            );
          }
        }

        // Add room thumbnail
        const roomThumbnailInput = roomDiv.querySelector("#roomThumbnail");
        if (roomThumbnailInput && roomThumbnailInput.files[0]) {
          formData.append(
            `rooms[${index}][thumbnail]`,
            roomThumbnailInput.files[0]
          );
        }
      });

      // Send data using Fetch API
      fetchApi(`http://localhost:5000/api/hotel/add-hotel`, formData);
    } else if (propertyType === "house") {
      // Gather house data
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
      const houseAmenities = document.getElementById("house-amenities");
      if (houseAmenities) {
        formData.append(
          "amenities",
          JSON.stringify(
            Array.from(houseAmenities.selectedOptions).map(
              (option) => option.value
            )
          )
        );
      }

      // Add thumbnail
      if (thumbnailField.files[0]) {
        formData.append("house-thumbnail", thumbnailField.files[0]);
      }

      // Append multiple images
      if (imageField && imageField.files) {
        for (let i = 0; i < imageField.files.length; i++) {
          formData.append("house-image", imageField.files[i]);
        }
      }

      // Send data using Fetch API
      fetchApi(`http://localhost:5000/api/house/add-house`, formData);
    }

    // Log FormData entries (for debugging)
    console.log("FormData Entries:");
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }
  });

const roomTypes = ["single", "double", "suite"];
let roomCounter = 0; // For generating unique IDs

function addHotelRoom() {
  roomCounter++;
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
  guestsInput.min = 1;

  // Amenities
  const amenitiesLabel = document.createElement("label");
  amenitiesLabel.textContent = "Amenities:";

  // Create unique ID for this room's amenities select
  const amenitiesId = `hotel-amenities-room-${roomCounter}`;
  amenitiesLabel.setAttribute("for", amenitiesId);

  const amenitiesSelect = document.createElement("select");
  amenitiesSelect.id = amenitiesId;
  amenitiesSelect.className = "hotel-amenities"; // Use class for selection
  amenitiesSelect.name = `hotel-amenities-room-${roomCounter}[]`;
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
    option.value = amenity.toLowerCase(); // Use lowercase values
    option.textContent = amenity;
    amenitiesSelect.appendChild(option);
  });

  // Image URLs
  const imagesLabel = document.createElement("label");
  imagesLabel.textContent = "Images:";
  const imagesInput = document.createElement("input");
  imagesInput.id = "roomImages";
  imagesInput.name = "room-image";
  imagesInput.type = "file";
  imagesInput.placeholder = "Images";
  imagesInput.required = true;
  imagesInput.accept = "image/*";
  imagesInput.multiple = true; // Allow multiple files

  // Thumbnail
  const thumbnailLabel = document.createElement("label");
  thumbnailLabel.textContent = "Thumbnail:";
  const thumbnailInput = document.createElement("input");
  thumbnailInput.type = "file";
  thumbnailInput.id = "roomThumbnail";
  thumbnailInput.name = "room-thumbnail";
  thumbnailInput.placeholder = "Thumbnail";
  thumbnailInput.required = true;
  thumbnailInput.accept = "image/*";

  // Number of rooms
  const numberOfRoomsInput = document.createElement("input");
  numberOfRoomsInput.type = "number";
  numberOfRoomsInput.placeholder = "Number Of Rooms";
  numberOfRoomsInput.required = true;
  numberOfRoomsInput.min = 1;
  numberOfRoomsInput.value = 1; // Default value

  // Remove Button
  const removeButton = document.createElement("button");
  removeButton.style.backgroundColor = "#d43f3f";
  removeButton.type = "button";
  removeButton.textContent = "Remove";
  removeButton.onclick = () => {
    container.removeChild(roomDiv);
    validateRoomSelection();
  };

  // Get add room button reference
  let addRoomBtn = document.getElementById("addRoomBtn");

  // Append all elements to the room div
  roomDiv.appendChild(roomTypeSelect);
  roomDiv.appendChild(priceInput);
  roomDiv.appendChild(guestsInput);
  roomDiv.appendChild(amenitiesLabel);
  roomDiv.appendChild(amenitiesSelect);
  roomDiv.appendChild(imagesLabel);
  roomDiv.appendChild(imagesInput);
  roomDiv.appendChild(thumbnailLabel);
  roomDiv.appendChild(thumbnailInput);
  roomDiv.appendChild(numberOfRoomsInput);
  roomDiv.appendChild(removeButton);

  // Add the room before the "Add Room" button
  container.insertBefore(roomDiv, addRoomBtn);

  validateRoomSelection();
}

// Add event listener for "Add Room" button
document.getElementById("addRoomBtn").addEventListener("click", addHotelRoom);

// Function to validate room type selections and prevent duplicates
function validateRoomSelection() {
  const selectedTypes = [
    ...document.querySelectorAll(".hotel-room select:first-child"),
  ].map((select) => select.value);

  document
    .querySelectorAll(".hotel-room select:first-child option")
    .forEach((option) => {
      if (option.value !== "" && option.value !== "Select...") {
        // Disable options that are already selected in other rooms
        const count = selectedTypes.filter(
          (type) => type === option.value
        ).length;
        option.disabled = count > 0 && !option.selected;
      }
    });
}

// Improved API fetch function with better error handling
async function fetchApi(url, formData) {
  console.log("Submitting to:", url);

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
      // Don't set Content-Type header - browser sets it automatically with boundary for FormData
    });

    if (response.ok) {
      try {
        const result = await response.json();
        console.log("Accommodation added successfully:", result);
        alert("Accommodation added successfully!");
        document.querySelector(".accommodation-form").reset(); // Clear the form

        // Also clear any dynamically added rooms
        const roomsContainer = document.getElementById("hotel-rooms-container");
        const roomDivs = roomsContainer.querySelectorAll(".hotel-room");
        roomDivs.forEach((div) => roomsContainer.removeChild(div));

        return result;
      } catch (jsonError) {
        console.error("Error parsing JSON response:", jsonError);
        alert("Server returned an invalid response format. Please try again.");
      }
    } else {
      // Handle HTTP error status
      const text = await response.text(); // Get response text for debugging
      console.error(`Server error (${response.status}):`, text);

      try {
        // Try to parse as JSON in case server returned JSON error
        const errorData = JSON.parse(text);
        throw new Error(
          errorData.message || `Server error: ${response.status}`
        );
      } catch (jsonParseError) {
        // If not JSON, use the text directly
        throw new Error(
          `Server error (${response.status}): ${text.substring(0, 200)}...`
        );
      }
    }
  } catch (error) {
    console.error("Error:", error);
    alert(`There was an error adding the accommodation: ${error.message}`);
  }
}

// Import logout function
import { setupLogout } from "./utils.js";

// Set up logout functionality
setupLogout();
