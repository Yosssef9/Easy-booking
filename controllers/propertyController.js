const { Property } = require("../models/property");
const reservations = require("../models/reservations");
const mongoose = require("mongoose");

exports.getAllProperties = async (req, res) => {
  try {
    let properties = await Property.find();

    if (properties.length === 0) {
      return res.status(400).json({ message: "Data not found" });
    }

    // Process each property to find minimum room price if it's a hotel
    properties = properties.map((PropertyDOC) => {
      let minRoomPrice = null;
      if (PropertyDOC.propertyType === "Hotel") {
        // Assuming each room has a 'pricePerNight' field
        minRoomPrice = Math.min(
          ...PropertyDOC.rooms.map((room) => room.pricePerNight)
        );
        console.log("Minimum Room Price for Hotel:", minRoomPrice);
      }
      // Add minRoomPrice to the property object
      return {
        ...PropertyDOC.toObject(), // Make sure it's a plain object
        minRoomPrice, // Add minRoomPrice to the property
      };
    });

    res.status(201).json({
      message: "Data retrieved successfully!",
      data: properties,
      user: req.user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving properties", error });
  }
};

exports.getProperty = async (req, res) => {
  console.log("getProperty request");
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.propertyId)) {
      return res.status(400).json({ message: "Invalid movie ID format" });
    }

    const PropertyDOC = await Property.findById(req.params.propertyId);

    if (!PropertyDOC) {
      return res.status(404).json({ message: "Property not found" });
    }
    let minRoomPrice;
    if (PropertyDOC.propertyType === "Hotel") {
      minRoomPrice = Math.min(
        ...PropertyDOC.rooms.map((room) => room.pricePerNight)
      );
      console.log("Minimum Room Price:", minRoomPrice);
    }

    console.log("Property ID:", PropertyDOC._id); // Access the ObjectId here

    res.json({
      name: PropertyDOC.name,
      location: PropertyDOC.location,
      rating: PropertyDOC.rating,
      description: PropertyDOC.description,
      images: PropertyDOC.images,
      propertyType: PropertyDOC.propertyType,
      pricePerNight: PropertyDOC.pricePerNight,
      maxGuests: PropertyDOC.maxGuests,
      available: PropertyDOC.available,
      amenities: PropertyDOC.amenities,
      thumbnail: PropertyDOC.thumbnail,
      minRoomPrice: minRoomPrice,
    });
  } catch (error) {
    console.error("Error fetching property:", error.message);
    res.status(500).json({ error: error });
  }
};

exports.getAllReservations = async (req, res) => {
  console.log("get request to getAllReservations");

  let user = req.user; // Assuming you have a user object in the request (e.g., from authentication)

  try {
    // Fetch reservations where the tenant (user) matches the logged-in user's id
    const userReservations = await reservations
      .find({ tenant: user.id })
      .populate("propertyId") // Populate the whole Property document
      .populate("tenant", "name email");

    if (userReservations.length === 0) {
      return res
        .status(404)
        .json({ message: "No reservations found for this user" });
    }

    res.status(200).json({
      message: "Reservations retrieved successfully",
      data: userReservations,
    });
  } catch (error) {
    console.error("Error fetching reservations:", error.message);
    res.status(500).json({ message: "Error fetching reservations", error });
  }
};

exports.getAllUserProperties = async (req, res) => {
  console.log("get request to getAllUserProperties");

  let user = req.user; // Assuming you have a user object in the request (e.g., from authentication)

  try {
    const userProperties = await Property.find({ owner: user.id });

    if (userProperties.length === 0) {
      return res
        .status(404)
        .json({ message: "No reservations found for this user" });
    }

    res.status(200).json({
      message: "Properties retrieved successfully",
      data: userProperties,
    });
  } catch (error) {
    console.error("Error fetching Properties:", error.message);
    res.status(500).json({ message: "Error fetching Properties", error });
  }
};
