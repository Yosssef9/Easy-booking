const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  propertyType: {
    type: String,
    enum: ["House", "Room"], // Ensures only valid types are used
    required: true,
  },
  reservationStartDate: { type: Date, required: true, index: true },
  reservationEndDate: { type: Date, required: true },
  numberOfReservationDays: { type: Number, required: true },
  isTheReservationOver: { type: Boolean, default: false },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Reservation", reservationSchema);
