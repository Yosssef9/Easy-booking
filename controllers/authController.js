const User = require("../models/userModel");
const Report = require("../models/reportModel");
const { Property } = require("../models/property");
const Reservation = require("../models/reservations");
const jwt = require("jsonwebtoken");
const path = require("path");
const cors = require("cors");
const express = require("express");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const runModel = require("./modelRunner");

const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies

app.use(cors());

// Signup Controller
exports.signup = async (req, res) => {
  console.log("Signup request received"); // Log the incoming request
  const {
    username,
    email,
    password,
    yearBirth,
    phoneNumber,
    favouriteCity,
    avargePrice,
  } = req.body;
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
      favouriteCity,
      avargePrice,
    });

    await newUser.save();
    console.log(`newUser:${newUser}`);

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
      console.log("User found:", user);
      console.log("Stored password:", user.password);

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
  const { startDate, endDate, roomType } = req.query;
  const property = await Property.findById(propertyId).populate("reservations");
  console.log("property", property);
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (!property) {
    return res.status(404).json({ error: "Property not found" });
  }

  let available;
  if (property.propertyType === "House") {
    // Populate reservations for houses
    await property.populate("reservations");
    available = property.isReservationAvailable(start, end);
  } else if (property.propertyType === "Hotel") {
    if (!roomType) {
      return res
        .status(400)
        .json({ error: "Room type is required for hotels" });
    }
    // No need to populate reservations here; they’re embedded in rooms
    available = await property.getAvailableRoom(start, end, roomType);
    console.log("available", available);
  } else {
    return res.status(400).json({ error: "Invalid property type" });
  }

  console.log(
    `Availability for ${property.propertyType} (${
      roomType || "N/A"
    }): ${available}`
  );

  res.json({ available });
};

exports.makeReservation = async (req, res) => {
  try {
    let user = req.user;
    console.log("user", user);
    console.log("user.id", user.id);

    let property = await Property.findById(req.body.propertyId);
    console.log("property", property);

    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    const { reservationStartDate, reservationEndDate, roomType } = req.body;
    const start = new Date(reservationStartDate);
    const end = new Date(reservationEndDate);
    if (isNaN(start) || isNaN(end) || start >= end) {
      return res.status(400).json({ success: false, message: "Invalid dates" });
    }

    const numberOfReservationDays = Math.ceil(
      (end - start) / (1000 * 3600 * 24)
    );
    let newReservation;

    if (property.propertyType === "Hotel" && roomType) {
      // Check availability for the room type
      const availableRoom = await property.getAvailableRoom(
        start,
        end,
        roomType
      );
      if (!availableRoom) {
        return res.status(400).json({
          success: false,
          message: `No ${roomType} rooms available for these dates`,
        });
      }

      // Create and save reservation in the Reservation collection
      newReservation = new Reservation({
        propertyId: property._id,
        propertyType: property.propertyType,
        reservationStartDate: start,
        reservationEndDate: end,
        numberOfReservationDays: numberOfReservationDays,
        tenant: user.id,
        room: availableRoom._id,
      });

      await newReservation.save();
      console.log("newReservation:", newReservation);
      console.log("availableRoom:", availableRoom);
      // Save only the reservation ID in the room's reservations array
      availableRoom.reservations.push(newReservation._id);
      await property.save();

      await User.findByIdAndUpdate(
        user.id,
        { $addToSet: { reservedProperties: property._id } },
        { new: true }
      );
      console.log("User updated with new reservation property:", property._id);
    } else if (property.propertyType === "House") {
      // Check availability for house
      await property.populate("reservations");
      const isAvailable = await property.isReservationAvailable(start, end);
      if (!isAvailable) {
        return res.status(400).json({
          success: false,
          message: "House is not available for these dates",
        });
      }

      // Create a new reservation for house
      newReservation = new Reservation({
        propertyId: property._id,
        propertyType: property.propertyType,
        reservationStartDate: start,
        reservationEndDate: end,
        numberOfReservationDays: numberOfReservationDays,
        tenant: user.id,
      });

      await newReservation.save();
      property.reservations.push(newReservation._id);
      await property.save();

      await User.findByIdAndUpdate(
        user.id,
        { $addToSet: { reservedProperties: property._id } },
        { new: true }
      );
      console.log("User updated (House) reservedProperties:", property._id);
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid property type or missing roomType for hotel",
      });
    }

    res.status(201).json({
      success: true,
      message: "Reservation successfully created",
      reservation: newReservation,
    });
    await runModel();
  } catch (error) {
    console.error("Error creating reservation:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
      error: error.message,
    });
  }
};

exports.sendReport = async (req, res) => {
  try {
    const { title, description } = req.body;
    let user = req.user;
    // Validate input
    if (!title || !description || !user) {
      return res
        .status(400)
        .json({ message: "Please provide title, description, and user ID." });
    }
    console.log("user", user);
    // Create new report
    const newReport = new Report({
      title,
      description,
      userWhoCreatedReport: user.id,
    });

    await newReport.save(); // Save to the database
    res
      .status(201)
      .json({ message: "Report created successfully", report: newReport });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to create report", error: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error logging out", error: error.message });
  }
};
