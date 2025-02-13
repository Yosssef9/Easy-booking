const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const path = require("path");
const cors = require("cors");
const express = require("express");
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
