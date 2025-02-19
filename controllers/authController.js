const User = require("../models/userModel");
const { Property } = require("../models/property");
const Reservation = require("../models/reservations");
const jwt = require("jsonwebtoken");
const path = require("path");
const cors = require("cors");
const express = require("express");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies

app.use(cors());

// Signup Controller
exports.signup = async (req, res) => {
  console.log("Signup request received"); // Log the incoming request
  const { username, email, password, yearBirth, phoneNumber } = req.body;
  console.log(req.body);

  try {
    // Check if the user is already taken
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Username already taken" });
    }
    // Check if the email is already taken
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Email already taken" });
    }

    // // Create a new user
    const newUser = new User({
      username,
      email,
      password,
      yearBirth,
      phoneNumber,
    });

    await newUser.save();

    // Respond with success message
    res.status(201).json({
      success: true,
      message: "Signup successful!",
    });
  } catch (error) {
    console.error("Error during login:", error);

    if (error.code === 11000) {
      // Duplicate key error
      const duplicateField = Object.keys(error.keyValue)[0]; // e.g., "username" or "email"
      return res.status(400).json({
        success: false,
        message: `${duplicateField} is already taken`,
      });
    }
  }
};

// Login Controller
exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log("email : ", email);
  console.log("password : ", password);
  {
    try {
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        console.log(`no user found :${user}`);

        return res
          .status(400)
          .json({ success: false, message: "Invalid email or password" });
      }

      // Compare password
      const isMatch = await user.comparePassword(password);
      console.log(`Password match: ${isMatch}`); // Add a debug log

      if (!isMatch) {
        console.log(`password not correct :${user}`);

        return res
          .status(400)
          .json({ success: false, message: "Invalid email or password" });
      }

      // Create a JWT token for the user
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "5h" }
      );

      // Respond with success and token
      res.cookie("token", token, {
        httpOnly: true, // Prevent client-side access to cookie
        secure: false, // Set to true in production (with HTTPS)
        sameSite: "Strict",
        maxAge: 5 * 60 * 60 * 1000, // 5 hours in milliseconds
      });

      res.status(200).json({
        success: true,
        message: "Login successful",
        role: user.role,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Server error. Please try again." });
    }
  }
};

exports.createPaymentIntent = async (req, res) => {
  const { amount } = req.body; // Amount to be paid (in cents, for example)

  try {
    // Create a PaymentIntent with the specified amount
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      payment_method_types: ["card"], // Accepts credit cards
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

exports.checkReservationAvailability = async (req, res) => {
  const { propertyId } = req.params;
  const { startDate, endDate } = req.query;
  const property = await Property.findById(propertyId).populate("reservations");
  console.log("property", property);
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (!property) {
    return res.status(404).json({ error: "Property not found" });
  }

  // ✅ Now we can safely use house-specific methods
  const available = await property.isReservationAvailable(start, end);

  res.json({ available });
};

exports.makeReservation = async (req, res) => {
  try {
    // Get user and property data
    let user = req.user; // Assuming user is authenticated via JWT middleware
    console.log("user", user);
    console.log("user.id", user.id);

    let property = await Property.findById(req.body.propertyId);
    console.log("property", property);

    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    // Check if the reservation dates are available
    const { reservationStartDate, reservationEndDate } = req.body;

    // Calculate the number of days for the reservation
    const numberOfReservationDays =
      (new Date(reservationEndDate) - new Date(reservationStartDate)) /
      (1000 * 3600 * 24);

    // Create a new reservation object
    const newReservation = new Reservation({
      propertyId: property._id,
      propertyType: property.propertyType, // Assuming you have a 'type' field in Property model
      reservationStartDate: reservationStartDate,
      reservationEndDate: reservationEndDate,
      numberOfReservationDays: numberOfReservationDays,
      tenant: user.id, // The user making the reservation
    });

    // Save the new reservation to the database
    await newReservation.save();

    // Add the reservation to the property
    property.reservations.push(newReservation._id);
    await property.save();

    // Respond with success message
    res.status(201).json({
      success: true,
      message: "Reservation successfully created",
      reservation: newReservation,
    });
  } catch (error) {
    console.error("Error creating reservation:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error. Please try again." });
  }
};
