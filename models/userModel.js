const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // Ensures the username is unique
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensures the email is unique
    match: [/.+@.+\..+/, "Please fill a valid email address"], // Basic email validation
  },
  password: {
    type: String,
    required: true,
    minlength: 6, // Password should be at least 6 characters long
  },
  yearBirth: {
    type: Number,
  },
  phoneNumber: {
    type: String,
  },
  // favouriteCity: {
  //   type: String,
  //   required: true,
  // },
  // priceRange: {
  //   type: Number,
  //   required: true,
  // },
  role: {
    type: String,
    enum: ["user",'admin', 'superadmin' ], 
    default: "user",
  },
  dateJoined: {
    type: Date,
    default: Date.now, // Automatically sets the current date when the user joins
  },
  houses: [{ type: mongoose.Schema.Types.ObjectId, ref: "House" }], // Array of houses listed by the user
  hotels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Hotel" }], // Array of hotels listed by the user
  report: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Report", // Reference to the Report model
  },
  creditCards: [
    { type: mongoose.Schema.Types.ObjectId, ref: "CreditCard" }, // Optional reference to CreditCard model
  ],
});

// Middleware to hash the password before saving the user
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Only hash if password is modified or new
  this.password = await bcrypt.hash(this.password, 10); // Hash the password with a salt rounds of 10
  next();
});

// Method to compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password); // Compare the entered password with the hashed password
};

module.exports = mongoose.model("User", userSchema);
