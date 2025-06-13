const mongoose = require("mongoose");
const fs = require("fs");
const { parse } = require("json2csv");
require("dotenv").config();

// الاتصال بقاعدة البيانات
mongoose.connect(process.env.MONGO_URI);

// استيراد الموديلات
const { Property } = require("./models/property");
const Reservation = require("./models/reservations");
const User = require("./models/userModel");

async function exportEachModelAsCSV() {
  try {
    const properties = await Property.find({}).lean();
    const reservations = await Reservation.find({}).lean();
    const users = await User.find({}).lean();

    // تحويل إلى CSV
    const usersCSV = parse(users);
    fs.writeFileSync("users.csv", usersCSV);

    const propertiesCSV = parse(properties);
    fs.writeFileSync("properties.csv", propertiesCSV);

    const reservationsCSV = parse(reservations);
    fs.writeFileSync("reservations.csv", reservationsCSV);

    console.log("✅ All data exported to CSV files.");
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    mongoose.disconnect();
  }
}

exportEachModelAsCSV();
