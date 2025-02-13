const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload"); // Import the upload middleware
const protect = require("../middlewares/protect");
const { addHouse, getHouses } = require("../controllers/houseControllers");

router.post("/add-house", protect, upload, addHouse);
router.get("/get-houses", protect, getHouses);

module.exports = router;
