const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    required: true,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Ensure one review per user per property
ReviewSchema.index({ property: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Review", ReviewSchema);
