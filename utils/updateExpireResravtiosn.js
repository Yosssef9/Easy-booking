const Reservation = require("../models/reservations"); // Adjust the path as needed

exports.updateExpiredReservations = async () => {
  try {
    console.log("Reservation model:", Reservation);

    const today = new Date();
    const result = await Reservation.updateMany(
      { reservationEndDate: { $lt: today }, isTheReservationOver: false },
      { $set: { isTheReservationOver: true } }
    );
    console.log(
      `✅ Updated ${result.modifiedCount} expired reservations on startup.`
    );
  } catch (error) {
    console.error("❌ Error updating expired reservations on startup:", error);
  }
};
