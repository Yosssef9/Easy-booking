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
    usersRating: { type: Number, default: 0 },
    description: { type: String, required: true },
    amenities: { type: [String], default: [] },
    images: { type: [String], required: true },
    thumbnail: { type: String, required: true },
    // reviews: {
    //   description: {
    //     type: String,
    //     required: true, // Description of the review (what the user liked, disliked, etc.)
    //   },
    //   rating: {
    //     type: Number,
    //     required: true,
    //     min: 1, // Rating cannot be lower than 1
    //     max: 5, // Rating cannot be higher than 5
    //   },
    //   user: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "User", // Reference to the User who wrote the review
    //     required: true, // Every review must be associated with a user
    //   },
    //   createdAt: {
    //     type: Date,
    //     default: Date.now, // Automatically set to the current date when the review is created
    //   },
    // },
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
  rooms: [
    {
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
      available: {
        type: Boolean,
        default: true,
      },
      reservations: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Reservation" },
      ],
    },
  ],
});

hotelSchema.methods.getAvailableRoom = async function (
  startDate,
  endDate,
  roomType
) {
  if (!roomType) {
    throw new Error("Room type is required for hotel availability check");
  }

  // Ensure startDate and endDate are Date objects
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start) || isNaN(end)) {
    throw new Error("Invalid date format for startDate or endDate");
  }

  // Populate rooms' reservations at the document level
  await this.populate("rooms.reservations");

  // Handle "all" room types
  if (roomType.toLowerCase() === "all") {
    const availableRooms = this.rooms.filter((room) =>
      room.reservations.every(
        (r) =>
          new Date(r.reservationEndDate) <= start ||
          new Date(r.reservationStartDate) >= end
      )
    );
    return availableRooms.length > 0 ? availableRooms : [];
  }

  // Handle specific room type
  const matchingRooms = this.rooms.filter(
    (room) => room.type.toLowerCase() === roomType.toLowerCase()
  );
  if (matchingRooms.length === 0) {
    return null; // No rooms of this type exist
  }

  // Check availability for specific room type
  for (let room of matchingRooms) {
    const isAvailable = room.reservations.every(
      (r) =>
        new Date(r.reservationEndDate) <= start ||
        new Date(r.reservationStartDate) >= end
    );

    if (isAvailable) return room; // Return the first available room
  }

  return null; // No rooms available
};

const Hotel = Property.discriminator("Hotel", hotelSchema);

module.exports = { Property, House, Hotel };
