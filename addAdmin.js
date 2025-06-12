const bcrypt = require("bcryptjs");
const User = require("./models/userModel");

async function createAdminUser() {
  try {
    const existingAdmin = await User.findOne({ username: "superadmin" });

    if (existingAdmin) {
      console.log("✅ superadmin already exists.");
      return;
    }

    const admin = new User({
      username: "superadmin",
      email: "admin@99.com",
      password: "admin123",
      yearBirth: 2003,
      phoneNumber: "0",
      role: "superadmin",
      favouriteCity: "Damanhur",
      avargePrice: 10000,
    });

    await admin.save();
    console.log("✅ superadmin created.");
  } catch (error) {
    console.error("❌ Error creating superadmin:", error);
  }
}

module.exports = createAdminUser;
