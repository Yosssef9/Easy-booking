const mongoose = require("mongoose");

const houseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // The name of the house (e.g., "Beach House")
  },
  location: {
    city: {
      type: String,
      required: true, // The city where the house is located
    },
    zone: {
      type: String,
      required: true, // The zone or neighborhood within the city
    },
    street: {
      type: String,
      required: true, // The street where the house is located
    },
    houseNumber: {
      type: String,
      required: true, // The house number (e.g., "123A")
    },
  },
  description: {
    type: String,
    required: true, // Detailed description of the house
  },
  pricePerNight: {
    type: Number,
    required: true, // Price per night for booking the house
  },
  review: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review", // Reference to Review model
    },
  ],
  rating: {
    type: Number,
    default: 0, // Default to 0 if no rating is given
  },
  maxGuests: {
    type: Number,
    required: true, // Maximum number of guests allowed in the house
  },
  amenities: {
    type: [String], // Example: ["WiFi", "Pool", "Parking"]
    default: [], // Default to an empty array if no amenities are specified
  },
  images: {
    type: [String], // Array of image URLs
    validate: {
      validator: function (arr) {
        return arr.length > 0; // Ensure at least one image is present
      },
      message: "At least one image is required.",
    },
    required: true, // This makes the field required
  },
  thumbnail: {
    type: String,
    validate: {
      validator: function (arr) {
        return arr.length > 0; // Ensure at least one image is present
      },
      message: "thumbnail image is required.",
    },
    required: true, // This makes the field required
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User who listed the house
    required: true,
  },
  available: {
    type: Boolean,
    default: true, // Indicates if the house is available for booking
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set to the current date when the house is listed
  },
});

module.exports = mongoose.model("House", houseSchema);
