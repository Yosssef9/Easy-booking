const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const protect = require("./middlewares/protect");
const authRoutes = require("./routes/authRoutes");
const houseRoutes = require("./routes/houseRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
// const reportRoutes = require("./routes/reportRoutes");
const cookieParser = require("cookie-parser");
const path = require("path");
const PORT = process.env.PORT || 5000;
require("dotenv").config();
const app = express();

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(cookieParser()); // Cookie parsing middleware

// CORS Configuration
app.use(
  cors({
    origin: "*", // Update this to your frontend's URL
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

// Connect to the database
connectDB();

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} request to ${req.url}`);
  next();
});

// Test route
app.post("/test", (req, res) => {
  console.log(req.body);
  res.send("Test route is working!");
});

// Authentication Routes
app.use("/api/auth", authRoutes);
app.use("/api/house", houseRoutes);
app.use("/api/property", propertyRoutes);
// app.use("/api/report", reportRoutes);

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// HTML Routes for Signup and Login
app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});
app.get("/home", protect, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.get("/admin-dashboard", protect, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});
app.get("/Add-Accommodations", protect, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "addAccommodations.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
