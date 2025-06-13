const { Property, House } = require("../models/property");
const { validationResult } = require("express-validator");
const runModel = require("./modelRunner");

exports.addHouse = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("hhhhhhhhhhhhh");
    console.log(" req.user : ", req.user);
    console.log("body :", req.body);
    // Validate request data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if files are provided
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one image is required" });
    }

    // Get uploaded image URLs (Cloudinary stores them in file.path)
    const imageUrls = req.files["house-image"]
      ? req.files["house-image"].map((file) => file.path)
      : [];

    const thumbnail = req.files["house-thumbnail"]
      ? req.files["house-thumbnail"][0].path
      : null;

    // Ensure required fields are present
    const requiredFields = [
      "name",
      "city",
      "zone",
      "street",
      "pricePerNight",
      "maxGuests",
      "houseNumber",
    ];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res
          .status(400)
          .json({ message: `Missing required field: ${field}` });
      }
    }

    // Create new house entry
    const newHouse = new House({
      name: req.body.name,
      location: {
        city: req.body.city,
        zone: req.body.zone,
        street: req.body.street,
        houseNumber: req.body.houseNumber,
      },
      description: req.body.description,
      pricePerNight: Number(req.body.pricePerNight),
      maxGuests: Number(req.body.maxGuests),
      amenities: req.body.amenities ? JSON.parse(req.body.amenities) : [],
      thumbnail: thumbnail,
      images: imageUrls, // Cloudinary image URLs
      owner: userId,
      propertyType: "House", // Explicitly set discriminator type
      reservations: [], // Initialize reservations array
    });

    await newHouse.save();

    res.status(201).json({
      message: "House added successfully!",
      house: newHouse,
    });
    await runModel();
  } catch (error) {
    console.error("Error adding house:");
    console.error("Message:", error.message);
    console.error("Name:", error.name);
    console.error("Stack:", error.stack);

    // For detailed inspection of the error object
    console.dir(error, { depth: null });

    // If the error has specific properties like errors collection (common in validation errors)
    if (error.errors) {
      console.error("Validation errors:");
      Object.keys(error.errors).forEach((key) => {
        console.error(`- ${key}: ${error.errors[key].message}`);
      });
    }

    res
      .status(500)
      .json({ message: "Error adding house", error: error.message });
  }
};
