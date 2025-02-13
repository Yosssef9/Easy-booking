const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/userModel"); // Adjust path as needed
const dotenv = require("dotenv");

dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    // const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = new User({
      username: "admin",
      email: "admin@99.com",
      password: "admin123",
      yearBirth: 2003,
      phoneNumber: "0",
      role: "admin",
    });

    await admin.save();
    console.log("Admin user created successfully!");
    mongoose.connection.close();
  })
  .catch((err) => console.error("DB connection failed:", err));
