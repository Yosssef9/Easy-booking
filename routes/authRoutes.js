const express = require("express");
const {
  signup,
  login,
  createPaymentIntent,
  checkReservationAvailability,
  makeReservation,
  logout
} = require("../controllers/authController");
const protect = require("../middlewares/protect");

const router = express.Router();

// Route for user signup
router.post("/signup", signup);

// Route for user login
router.post("/login", login);


router.post("/logout", logout);

router.post("/create-payment-intent", protect, createPaymentIntent);

router.get(
  "/check-reservation-availability/:propertyId",
  protect,
  checkReservationAvailability
);

router.post("/makeReservation", protect, makeReservation);

module.exports = router;
