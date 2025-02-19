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
  thumbnail: { type: String, required: true },

  available: {
    type: Boolean,
    default: true,
  },
  reservations: [
    {
      reservationStartDate: { type: Date, required: true, index: true }, // Index for fast queries
      reservationEndDate: { type: Date, required: true },
      numberOfReservationDays: { type: Number, required: true },
      isTheReservationOver: { type: Boolean, required: true, default: false },
      tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    },
  ],
});

// ✅ Virtual field to check if the room is available in real-time
roomSchema.virtual("isAvailable").get(function () {
  return !this.reservations.some(
    (r) => r.reservationEndDate >= new Date() && !r.isTheReservationOver
  );
});

// ✅ Method to check if a new reservation overlaps with existing ones
roomSchema.methods.isReservationAvailable = async function (
  startDate,
  endDate
) {
  const overlappingReservations = this.reservations.some(
    (r) => r.reservationStartDate < endDate && r.reservationEndDate > startDate
  );
  return !overlappingReservations; // Returns true if no conflicts
};

module.exports = mongoose.model("Room", roomSchema);
