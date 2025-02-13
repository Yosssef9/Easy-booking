const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotel",
    required: true,
  },
  type: {
    type: String, // Example: "Single", "Double", "Suite"
    required: true,
  },
  pricePerNight: {
    type: Number,
    required: true,
  },
  maxGuests: {
    type: Number,
    required: true,
  },
  amenities: {
    type: [String], // Example: ["TV", "Air Conditioning"]
    default: [],
  },
  images: {
    type: [String], // Array of image URLs
    default: [],
  },
  available: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Room", roomSchema);
