const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // The name of the hotel (e.g., "Luxury Hotel")
  },
  location: {
    city: {
      type: String,
      required: true, // The city where the hotel is located
    },
    zone: {
      type: String,
      required: true, // The neighborhood or zone within the city
    },
    street: {
      type: String,
      required: true, // The street where the hotel is located
    },
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
  amenities: {
    type: [String], // Example: ["Pool", "Gym", "Free WiFi"]
    default: [], // Default to an empty array if no amenities are specified
  },
  images: {
    type: [String], // Array of image URLs for the hotel
    default: [], // Default to an empty array if no images are provided
  },
  rooms: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room", // Reference to Room model for the hotel's rooms
    },
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User who owns the hotel
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set to the current date when the hotel is listed
  },
});

module.exports = mongoose.model("Hotel", hotelSchema);
