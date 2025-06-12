const express = require("express");
const { createReview, getReviews } = require("../controllers/reviewController");
const protect = require("../middlewares/protect");
const router = express.Router();

router.post("/createReview/:propertyId", protect, createReview);
router.get("/getReviews/:propertyId", protect, getReviews);

module.exports = router;
