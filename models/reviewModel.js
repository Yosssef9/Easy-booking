const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true, // Description of the review (what the user liked, disliked, etc.)
  },
  rating: {
    type: Number,
    required: true,
    min: 1, // Rating cannot be lower than 1
    max: 5, // Rating cannot be higher than 5
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User who wrote the review
    required: true, // Every review must be associated with a user
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set to the current date when the review is created
  },
});

module.exports = mongoose.model("Review", reviewSchema);
