const User = require("../models/userModel");
const Report = require("../models/reportModel");

const { Property } = require("../models/property");
const Reservation = require("../models/reservations");
const jwt = require("jsonwebtoken");
const path = require("path");
const cors = require("cors");
const express = require("express");
require("dotenv").config();

const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies

app.use(cors());

exports.getAllUsers = async (req, res) => {
  try {
    let users = await User.find({ role: "user" });
    return res.status(200).json({ success: true, users: users });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: "erorr to get users" });
  }
};
exports.getAllAdmins = async (req, res) => {
  try {
    let admins = await User.find({ role: "admin" });
    return res.status(200).json({ success: true, admins: admins });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: "erorr to get admins" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    let userId = req.params.userId;
    let user = await User.findById(userId); // Ensure you await the result

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Now delete the user
    const deletedUser = await User.findByIdAndDelete(userId);

    if (deletedUser) {
      console.log("✅ User deleted successfully:", deletedUser);
      return res.status(200).json({ message: "User deleted successfully" });
    } else {
      console.log("❌ No user found with that ID.");
      return res.status(404).json({ message: "User not deleted" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
exports.addAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log("username", username);
    console.log("email", email);
    console.log("password", password);
    // Validate input
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Check for existing email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }
    // Check for existing username

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res
        .status(400)
        .json({ success: false, message: "username already exists" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: " Password should be at least 6 characters long",
      });
    }

    // Create new admin
    const user = new User({
      username,
      email,
      password,
      role: "admin",
      avargePrice: 10000,
      favouriteCity: "cairo",
    });
    await user.save();

    res
      .status(201)
      .json({ success: true, message: "Admin created successfully" });
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    let adminId = req.params.adminId;
    let admin = await User.findById(adminId); // Ensure you await the result

    if (!admin) {
      return res.status(404).json({ message: "admin not found" });
    }

    // Now delete the admin
    const deletedAdmin = await User.findByIdAndDelete(adminId);

    if (deletedAdmin) {
      console.log("✅ admin deleted successfully:", deletedAdmin);
      return res.status(200).json({ message: "admin deleted successfully" });
    } else {
      console.log("❌ No admin found with that ID.");
      return res.status(404).json({ message: "admin not deleted" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    // Fetch all reports from the database
    const reports = await Report.find().populate(
      "userWhoCreatedReport",
      "username email"
    );
    console.log(`reports:${reports}`);

    // Return the reports as a JSON response
    res.status(200).json({ message: "Reports fetched successfully", reports });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to fetch reports", error: error.message });
  }
};
