const mongoose = require("mongoose");
const User = require("./models/userModel"); // Adjust the path to your User model

// Function to delete all users with password "123456"
const deleteUsersByPassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(  process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Delete users with password "123456"
    const result = await User.deleteMany({
      password: "123456",
    });

    console.log(`Successfully deleted ${result.deletedCount} users`);
    return result.deletedCount;
  } catch (error) {
    console.error("Error in deleteUsersByPassword:", error);
    throw error;
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
};

// Export the function
module.exports = deleteUsersByPassword;