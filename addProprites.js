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
  "Palm Valley",
  "Horizon Luxor",
  "Blue Lotus",
  "White Nile Hotel",
  "Temple View Inn",
  "Aswan Haven",
  "Mediterranean Breeze",
  "Grand Karnak",
  "Al-Masri Tower",
  "Golden Falcon",
  "El Nile Resort",
  "The Pyramids Crown",
  "Cleopatra’s Court",
  "Arabesque Palace",
  "Sunset Sharm",
  "Thebes Royal",
  "Atlantis Alexandria",
  "Seaside El Gouna",
  "Red Dunes Hotel",
  "Papyrus Plaza",
  "Bastet Boutique",
  "Golden Ankh",
  "Moonlight Desert",
  "Al Qahira Royal",
  "Horus Heights",
  "Shams El Nil",
  "Ra's Retreat",
  "Sunbird Suites",
  "Giza Mirage",
  "El Luxor Garden",
  "Desert Mirage",
  "Sphinx Serenity",
  "The Grand Pharaoh",
  "Temple Tree",
  "Ancient Sands",
  "Blue Sphinx",
  "Oasis Dream",
  "Royal Nile Horizon",
  "Palm Pyramid Inn",
  "Pharaoh's Nest",
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
  "Rania",
  "Bassant",
  "Layla",
  "Hind",
  "Menna",
  "Ghada",
  "Esraa",
  "Malak",
  "Farida",
  "Nadeen",
  "Riham",
  "Habiba",
  "Salma",
  "Marwa",
  "Sherif",
  "Ola",
  "Hadeer",
  "Jana",
  "Yassin",
  "Tamer",
  "Kareem",
  "Ramy",
  "Walid",
  "Alyaa",
  "Ibtissam",
  "Souad",
  "Kholoud",
  "Shimaa",
  "Marian",
  "Nashwa",
  "Hatem",
  "Lina",
  "Rana",
  "Tia",
  "Joud",
  "Noor",
  "Tamara",
  "Hadeel",
  "Maged",
  "Amina",
  "Basma",
  "Sherine",
  "Thanaa",
  "Nehal",
  "Abeer",
  "Lamees",
  "Halim",
  "Amani",
  "Basmah",
  "Dalal",
  "Rahma",
  "Iman",
  "Samar",
  "Nermine",
  "Nahla",
  "Rowan",
  "Zina",
  "Rasha",
  "May",
  "Nada",
  "Rawan",
  "Nahla",
  "Naglaa",
  "Mirna",
  "Habib",
  "Mohannad",
  "Safaa",
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
  "Zaki",
  "Amin",
  "Tawfik",
  "Nasr",
  "Younis",
  "Kassem",
  "Awad",
  "Hamdy",
  "Zahran",
  "Farag",
  "Sabry",
  "Shaker",
  "Badr",
  "Al-Shamy",
  "Al-Tahan",
  "El-Kholy",
  "El-Ashry",
  "Helmy",
  "El-Nahas",
  "Magdy",
  "Shalaby",
  "Refaat",
  "Darwish",
  "Ragab",
  "Haggag",
  "Bayoumi",
  "El-Sombaty",
  "Abaza",
  "Mansour",
  "Shenouda",
  "Halawa",
  "Ashraf",
  "Halim",
  "Labib",
  "Lotfy",
  "Taha",
  "Fouad",
  "Nafea",
  "Saifan",
  "Ghattas",
  "Shokry",
  "Sarhan",
  "Mahdy",
  "Mekky",
  "Khalifa",
  "Bishoy",
  "Zein",
  "Kamel",
  "Makram",
  "Wahba",
  "Barsoum",
  "Shalash",
  "El-Gendy",
  "Abdelaziz",
  "El-Nabawy",
  "Awadallah",
  "Arafa",
  "Roshdy",
  "Ghandour",
  "Naguib",
];

// Placeholder arrays for 200 Egypt-specific hotel and house images
// At the top of your seed file
const fs = require("fs");
const path = require("path");

// Folder paths
const hotelsDir = path.join(__dirname, "public/images/hotels");
const housesDir = path.join(__dirname, "public/images/houses");

// Read all filenames and turn them into web-accessible URLs
const hotelImages = fs
  .readdirSync(hotelsDir)
  .map((fname) => `/images/hotels/${fname}`);

const houseImages = fs
  .readdirSync(housesDir)
  .map((fname) => `/images/houses/${fname}`);

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
        favouriteCity: cities[Math.floor(Math.random() * cities.length)],
        avargePrice: parseFloat(
          (Math.random() * (25000 - 1000) + 1000).toFixed(2)
        ),
        reservedProperties: [],
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

const getAmenitiesByScore = (price, rating, priceMin, priceMax) => {
  const normalizedPrice = (price - priceMin) / (priceMax - priceMin); // Scale 0-1
  const normalizedRating = rating / 5; // Rating already 0–5
  const score = (normalizedPrice + normalizedRating) / 2; // Combine both
  const maxAmenities = amenitiesList.length;
  const count = Math.floor(score * (maxAmenities - 2)) + 2; // Minimum 2 amenities
  return shuffleArray(amenitiesList).slice(0, count);
};

// Generate a house, name matches owner's full name
const generateHouse = (user) => {
  const price = parseFloat((Math.random() * (8000 - 500) + 500).toFixed(2)); // New range: 500–8000
  const normalizedPrice = (price - 500) / (8000 - 500); // Scale to 0–1 based on new range
  const rating = parseFloat(
    (3.0 + normalizedPrice * 2 + Math.random() * 0.2).toFixed(1)
  );

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
    rating: Math.min(rating, 5.0),
    description: faker.lorem.paragraph(),
    amenities: getAmenitiesByScore(price, rating, 500, 8000),

    images: generateHouseImages(3),
    thumbnail: generateHouseImages(1)[0],
    owner: user._id,
    pricePerNight: price,
    maxGuests: Math.floor(Math.random() * 8) + 1,
    reservations: [],
  };
};

// Generate hotel with unique name and correct room pricing
const generateHotel = (user, usedHotelNames) => {
  // ✅ Pick a unique hotel name
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

  // ✅ Price logic for hotel rooms
  const singlePrice = parseFloat(
    (Math.random() * (10000 - 1000) + 1000).toFixed(2)
  );

  const randomMultiplier = () => 1 + (Math.random() * (0.3 - 0.2) + 0.2); // Between 1.2 and 1.3
  const doublePrice = parseFloat((singlePrice * randomMultiplier()).toFixed(2));
  const suitePrice = parseFloat((doublePrice * randomMultiplier()).toFixed(2));

  // ✅ Rating based on average price
  const avgPrice = (singlePrice + doublePrice + suitePrice) / 3;
  const normalizedPrice = (avgPrice - 1000) / (10000 - 1000); // Scale: 0 to 1
  const rating = parseFloat(
    (3.0 + normalizedPrice * 2 + Math.random() * 0.2).toFixed(1)
  );

  // ✅ Room generation
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
      amenities: getAmenitiesByScore(pricePerNight, rating, 1000, 10000),

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
    rating: Math.min(rating, 5.0),
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
