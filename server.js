const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const addAdmin = require("./addAdmin");

const protect = require("./middlewares/protect");
const authRoutes = require("./routes/authRoutes");
const houseRoutes = require("./routes/houseRoutes");
const hotelRoutes = require("./routes/hotelRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const adminRoutes = require("./routes/adminRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
// const reportRoutes = require("./routes/reportRoutes");
const cron = require("node-cron");
const mongoose = require("mongoose");
const Reservation = require("./models/reservations"); // Adjust the path as needed
const cookieParser = require("cookie-parser");
const path = require("path");
const PORT = process.env.PORT || 5000;
require("dotenv").config();
const app = express();
const {
  updateExpiredReservations,
} = require("./utils/updateExpireResravtiosn");
const morgan = require("morgan");
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
app.use("/api/hotel", hotelRoutes);
app.use("/api/property", propertyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/review", reviewRoutes);

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
app.get("/add-report", protect, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "addReport.html"));
});
app.get("/admin-dashboard", protect, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});
app.get("/Add-Accommodations", protect, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "addAccommodations.html"));
});
app.get("/My-Reservations", protect, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "MyReservations.html"));
});
app.get("/My-Properties", protect, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "MyProperties.html"));
});

app.use(morgan("tiny"));

// app.use("/js", express.static("js"));

// Start server
const startServer = async () => {
  try {
    await connectDB();
    await addAdmin();
    cron.schedule("0 0 * * *", async () => {
      try {
        const today = new Date();
        const result = await Reservation.updateMany(
          { reservationEndDate: { $lt: today }, isTheReservationOver: false },
          { $set: { isTheReservationOver: true } }
        );
        console.log(`Updated ${result.modifiedCount} expired reservations.`);
      } catch (error) {
        console.error("Error updating reservations:", error);
      }
    });
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Startup error:", err);
  }
};
// let deleteUsersByPassword = require("./deleteUsers");
// const addUsers = require("./addUsers");
// const { generateProperties } = require("./addProprites");
// const { addReservations } = require("./addReservations");

// addReservations()

// generateProperties();
startServer();
