const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const User = require("./models/userModel"); // Adjust the path to your User model

// Function to generate a random year of birth between 1950 and 2005
const generateYearBirth = () => {
  return Math.floor(Math.random() * (2005 - 1950 + 1)) + 1950;
};

// Function to generate a random price range between 100 and 10000
const generatePriceRange = () => {
  return Math.floor(Math.random() * (10000 - 100 + 1)) + 100;
};

// Main function to generate and insert 500 users
const addUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const egyptianCities = [
      "Alexandria",
      "Aswan",
      "Assiut",
      "Damanhur",
      "Beni Suef",
      "Cairo",
      "Mansoura",
      "Damietta",
      "Faiyum",
      "Tanta",
      "Giza",
      "Ismailia",
      "Kafr El Sheikh",
      "Luxor",
      "Marsa Matruh",
      "Minya",
      "Shibin El Kom",
      "Kharga",
      "Arish",
      "Port Said",
      "Banha",
      "Qena",
      "Hurghada",
      "Zagazig",
      "Sohag",
      "El Tor",
      "Suez",
    ];

    // Generate and save 500 users individually
    for (let i = 0; i < 500; i++) {
      const username = `${faker.internet.userName()}_${i}`; // Ensure unique username
      const email = `${
        faker.internet.email().split("@")[0]
      }_${i}@${faker.internet.domainName()}`; // Ensure unique email

      const user = new User({
        username,
        email,
        password: "123456", // Will be hashed by pre("save") middleware
        yearBirth: generateYearBirth(),
        phoneNumber: faker.phone.number(),
        favouriteCity:
          egyptianCities[Math.floor(Math.random() * egyptianCities.length)],
        priceRange: generatePriceRange(),
        role: "user",
        dateJoined: new Date(),
        houses: [],
        hotels: [],
        creditCards: [],
      });

      await user.save(); // Triggers pre("save") middleware for password hashing
      console.log(`Saved user ${i + 1}/500`);
    }

    console.log("Successfully inserted 500 users");
  } catch (error) {
    console.error("Error in addUsers:", error);
    throw error;
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
};

// Export the function
module.exports = addUsers;
