const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload"); // Import the upload middleware
const protect = require("../middlewares/protect");
const { addHotel } = require("../controllers/hotelController");

router.post("/add-hotel", protect, upload, addHotel);

module.exports = router;
