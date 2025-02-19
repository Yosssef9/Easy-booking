const mongoose = require("mongoose");

const options = { discriminatorKey: "propertyType", timestamps: true };

const propertySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: {
      city: { type: String, required: true },
      zone: { type: String, required: true },
      street: { type: String, required: true },
    },
    review: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
    rating: { type: Number, default: 0 },
    description: { type: String, required: true },
    amenities: { type: [String], default: [] },
    images: { type: [String], required: true },
    thumbnail: { type: String, required: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  options
);

const Property = mongoose.model("Property", propertySchema);

// House Schema
const houseSchema = new mongoose.Schema({
  location: {
    houseNumber: { type: String, required: true },
  },
  pricePerNight: { type: Number, required: true },
  maxGuests: { type: Number, required: true },
  available: { type: Boolean, default: true }, // This field is now redundant but keeping it for reference
  reservations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reservation" }],
});

// ✅ Virtual field to check if the house is available in real-time
houseSchema.virtual("isAvailable").get(function () {
  return !this.reservations.some(
    (r) => r.reservationEndDate >= new Date() && !r.isTheReservationOver
  );
});

// ✅ Method to check if a new reservation overlaps with existing ones
houseSchema.methods.isReservationAvailable = async function (
  startDate,
  endDate
) {
  const overlappingReservations = this.reservations.some(
    (r) => r.reservationStartDate < endDate && r.reservationEndDate > startDate
  );
  return !overlappingReservations; // Returns true if no conflicts
};

const House = Property.discriminator("House", houseSchema);

// Hotel Schema
const hotelSchema = new mongoose.Schema({
  rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }],
});

const Hotel = Property.discriminator("Hotel", hotelSchema);

module.exports = { Property, House, Hotel };
