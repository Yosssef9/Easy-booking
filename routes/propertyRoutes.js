const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload"); // Import the upload middleware
const protect = require("../middlewares/protect");
const {
  getAllProperties,
  getProperty,
  getAllReservations,
  getAllUserProperties,
  getPropertyReservations,
} = require("../controllers/propertyController");

router.get("/getAllProperties", protect, getAllProperties);
router.get("/getProperty/:propertyId",  protect, getProperty);
router.get("/getAllReservations", protect, getAllReservations);
router.get("/getAllUserProperties", protect, getAllUserProperties);
router.get("/getProperty-Reservations/:id", protect, getPropertyReservations);

module.exports = router;
