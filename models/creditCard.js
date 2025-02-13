const mongoose = require("mongoose");

const creditCardSchema = new mongoose.Schema({
  cardNumber: {
    type: String,
    required: true,
    unique: true, // Ensures that each card number is unique
  },
  expirationDate: {
    type: Date,
    required: true, // The expiration date of the card
  },
  cardHolderName: {
    type: String,
    required: true, // The name of the person holding the card
  },
  securityCode: {
    type: String,
    required: true, // The CVV/CVC of the card
    minlength: 3,
    maxlength: 4,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User who owns the card
    required: true, // A card must be associated with a user
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set the creation date when the card is added
  },
});

module.exports = mongoose.model("CreditCard", creditCardSchema);
