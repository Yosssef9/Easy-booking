const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const bcrypt = require("bcrypt");
require("dotenv").config();

// Import models
const { Property, House, Hotel } = require("./models/property");
const User = require("./models/userModel");

// Sample data arrays for random generation
const cities = [
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
const zones = ["Downtown", "Suburbs", "Beachfront", "Midtown", "Uptown"];
const amenitiesList = [
  "WiFi",
  "Pool",
  "Gym",
  "Parking",
  "Air Conditioning",
  "Heating",
  "TV",
  "Kitchen",
];
const roomTypes = ["Single", "Double", "Suite"];

const egyptianHotelNames = [
  "Nile View",
  "Pyramid Palace",
  "Sphinx Inn",
  "Cairo Grand",
  "Pharaoh Suites",
  "Delta Retreat",
  "Luxor Oasis",
  "Sahara Breeze",
  "Memphis Hotel",
  "Alexandria Bay",
  "Sinai Sands",
  "Giza Gardens",
  "The Oasis",
  "The Red Sea",
  "The Golden Pyramid",
  "Coptic Comfort",
  "Sultan’s Residence",
  "Royal Palm",
  "Desert Rose",
  "Nile Pearl",
];

// Arabic names
const arabicFirstNames = [
  "Ahmed",
  "Mohamed",
  "Ali",
  "Hassan",
  "Ibrahim",
  "Khaled",
  "Mahmoud",
  "Mostafa",
  "Youssef",
  "Omar",
  "Tarek",
  "Amr",
  "Sayed",
  "Eslam",
  "Adel",
  "Fathy",
  "Ziad",
  "Aya",
  "Fatma",
  "Nour",
  "Sara",
  "Hana",
  "Reem",
  "Laila",
  "Mona",
  "Amira",
  "Yasmin",
  "Mariam",
  "Dina",
  "Hagar",
  "Shaimaa",
  "Heba",
  "Asmaa",
];
const arabicLastNames = [
  "Mohamed",
  "Ahmed",
  "Hassan",
  "Ibrahim",
  "Ali",
  "Mahmoud",
  "Mostafa",
  "Youssef",
  "Omar",
  "Khaled",
  "Sayed",
  "Eslam",
  "Abdelrahman",
  "Abdallah",
  "Salem",
  "Fathy",
  "Saad",
  "Nasser",
  "Gamal",
  "Eid",
  "Soliman",
  "El-Sayed",
  "El-Gamal",
  "El-Naggar",
  "El-Sharkawy",
  "El-Masry",
  "Hussein",
  "Ismail",
];

// Placeholder arrays for 200 Egypt-specific hotel and house images
const hotelImages = [
  "https://images.pexels.com/photos/31380559/pexels-photo-31380559.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/22643802/pexels-photo-22643802.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/15666718/pexels-photo-15666718.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/17477077/pexels-photo-17477077.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/18886767/pexels-photo-18886767.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/5561915/pexels-photo-5561915.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/1457848/pexels-photo-1457848.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/2611025/pexels-photo-2611025.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/3601425/pexels-photo-3601425.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/271639/pexels-photo-271639.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/2611024/pexels-photo-2611024.jpeg?auto=compress&cs=tinysrgb&w=1200",
];

const houseImages = [
  "https://images.pexels.com/photos/30709722/pexels-photo-30709722.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/18991514/pexels-photo-18991514.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/18991504/pexels-photo-18991504.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/18991588/pexels-photo-18991588.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/18991507/pexels-photo-18991507.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/1105766/pexels-photo-1105766.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/7031407/pexels-photo-7031407.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/534151/pexels-photo-534151.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/280229/pexels-photo-280229.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/206172/pexels-photo-206172.jpeg?auto=compress&cs=tinysrgb&w=1200",
];

// Shuffle helper
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Generate images helpers
const generateHotelImages = (count) =>
  shuffleArray(hotelImages).slice(0, count);
const generateHouseImages = (count) =>
  shuffleArray(houseImages).slice(0, count);

// Generate users (same as your original, only Arabic names)
const generateUsers = async (count = 500) => {
  try {
    await User.deleteMany({});
    const users = [];
    const usedUsernames = new Set();
    const usedNames = new Set();
    const maxAttempts = 10000;
    let attempts = 0;

    while (users.length < count && attempts < maxAttempts) {
      // Use only Arabic names
      const firstName =
        arabicFirstNames[Math.floor(Math.random() * arabicFirstNames.length)];
      const lastName =
        arabicLastNames[Math.floor(Math.random() * arabicLastNames.length)];

      const nameKey = `${firstName.toLowerCase()}-${lastName.toLowerCase()}`;
      if (usedNames.has(nameKey)) {
        attempts++;
        continue;
      }

      const usernameBase = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
      let username = usernameBase;
      let suffix = 1;
      while (usedUsernames.has(username)) {
        username = `${usernameBase}${suffix}`;
        suffix++;
      }

      usedUsernames.add(username);
      usedNames.add(nameKey);

      users.push({
        firstName,
        lastName,
        username,
        email: faker.internet.email({ firstName, lastName }),
        password: await bcrypt.hash("123456", 10),
        yearBirth: Math.floor(Math.random() * (2000 - 1950 + 1)) + 1950,
        phoneNumber: faker.phone.number(),
        role: "user",
      });

      attempts = 0;
    }

    if (users.length < count) {
      throw new Error(
        `Could not generate ${count} unique names after ${maxAttempts} attempts.`
      );
    }

    await User.insertMany(users);
    return { success: true, message: `Generated ${count} unique users` };
  } catch (error) {
    throw new Error(`Error generating users: ${error.message}`);
  }
};

// Generate a house, name matches owner's full name
const generateHouse = (user) => {
  // console.log("User inside generateHouse:", user);
  return {
    propertyType: "House",
    name: `${user.username}`,
    location: {
      city: cities[Math.floor(Math.random() * cities.length)],
      zone: zones[Math.floor(Math.random() * zones.length)],
      street: faker.location.street(),
      houseNumber: faker.location.buildingNumber(),
    },
    review: [],
    rating: parseFloat((Math.random() * 5).toFixed(1)),
    description: faker.lorem.paragraph(),
    amenities: shuffleArray(amenitiesList).slice(
      0,
      Math.floor(Math.random() * 5) + 1
    ),
    images: generateHouseImages(3),
    thumbnail: generateHouseImages(1)[0],
    owner: user._id,
    pricePerNight: parseFloat((Math.random() * (2000 - 300) + 300).toFixed(2)),
    maxGuests: Math.floor(Math.random() * 8) + 1,
    reservations: [],
  };
};

// Generate hotel with unique name and correct room pricing
const generateHotel = (user, usedHotelNames) => {
  // Pick unique hotel name
  let hotelName = "";
  let attempts = 0;
  while (attempts < 50) {
    const baseName =
      egyptianHotelNames[Math.floor(Math.random() * egyptianHotelNames.length)];
    if (!usedHotelNames.has(baseName)) {
      hotelName = baseName;
      usedHotelNames.add(baseName);
      break;
    } else {
      // Append random number to keep unique
      const randomNum = Math.floor(Math.random() * 1000);
      const newName = `${baseName} ${randomNum}`;
      if (!usedHotelNames.has(newName)) {
        hotelName = newName;
        usedHotelNames.add(newName);
        break;
      }
    }
    attempts++;
  }
  if (!hotelName) hotelName = `Hotel ${faker.random.alphaNumeric(5)}`;

  // Single room price between 1500 and 20000
  const singlePrice = parseFloat(
    (Math.random() * (20000 - 1500) + 1500).toFixed(2)
  );

  // Helper to get random multiplier between 20% and 30%
  const randomMultiplier = () => 1 + (Math.random() * (0.3 - 0.2) + 0.2);

  // حساب أسعار الغرف
  const doublePrice = parseFloat((singlePrice * randomMultiplier()).toFixed(2));
  const suitePrice = parseFloat((doublePrice * randomMultiplier()).toFixed(2));

  const rooms = [];

  roomTypes.forEach((type) => {
    let pricePerNight;
    if (type === "Single") {
      pricePerNight = singlePrice;
    } else if (type === "Double") {
      pricePerNight = doublePrice;
    } else if (type === "Suite") {
      pricePerNight = suitePrice;
    }

    rooms.push({
      type,
      pricePerNight,
      maxGuests:
        type === "Suite"
          ? Math.floor(Math.random() * 6) + 2
          : Math.floor(Math.random() * 4) + 1,
      amenities: shuffleArray(amenitiesList).slice(
        0,
        Math.floor(Math.random() * 4) + 1
      ),
      available: true,
      reservations: [],
    });
  });

  return {
    propertyType: "Hotel",
    name: hotelName,
    location: {
      city: cities[Math.floor(Math.random() * cities.length)],
      zone: zones[Math.floor(Math.random() * zones.length)],
      street: faker.location.street(),
      houseNumber: faker.location.buildingNumber(),
    },
    review: [],
    rating: parseFloat((Math.random() * 5).toFixed(1)),
    description: faker.lorem.paragraph(),
    amenities: shuffleArray(amenitiesList).slice(
      0,
      Math.floor(Math.random() * 5) + 1
    ),
    images: generateHotelImages(3),
    thumbnail: generateHotelImages(1)[0],
    owner: user._id,
    rooms,
  };
};

// Generate properties linked to users
const generateProperties = async (users) => {
  try {
    await Property.deleteMany({});
    const properties = [];
    const usedHotelNames = new Set();

    for (const user of users) {
      // Each user has 1-3 properties
      const propertyCount = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < propertyCount; i++) {
        const isHouse = Math.random() > 0.5;
        if (isHouse) {
          const house = generateHouse(user);
          properties.push(house);
        } else {
          const hotel = generateHotel(user, usedHotelNames);
          properties.push(hotel);
        }
      }
    }

    await Property.insertMany(properties);
    return {
      success: true,
      message: `Generated ${properties.length} properties`,
    };
  } catch (error) {
    throw new Error(`Error generating properties: ${error.message}`);
  }
};

// Main function to run seeding
const seedDatabase = async () => {
  try {
    // Connect mongoose here (add your connection string)
    await mongoose.connect(process.env.MONGO_URI);

    const usersResult = await generateUsers(500);
    console.log(usersResult.message);

    const users = await User.find({});
    const propertiesResult = await generateProperties(users);
    console.log(propertiesResult.message);

    // await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
};

seedDatabase();
