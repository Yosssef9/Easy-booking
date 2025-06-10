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

exports.getPropertyReservations = async (req, res) => {
  try {
    const propertyId = req.params.id;
    console.log(`propertyId : ${propertyId}`);
    console.log(
      `request to getPropertyReservations hhhhhhhhhhhhhhhhhhhhhhhhhhhh`
    );
    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ message: "Invalid property ID" });
    }

    // Fetch reservations for this property
    const propertyReservations = await reservations.find({
      propertyId: new mongoose.Types.ObjectId(propertyId),
    });
    console.log(`propertyReservations : ${propertyReservations}`);
    const allReservations = await reservations.find({});

    const match = allReservations.find(
      (r) => r.property.toString() === propertyId
    );
    console.log("Manual match found:", match);

    if (propertyReservations.length === 0) {
      return res
        .status(404)
        .json({ message: "No reservations found for this property" });
    }

    res.status(200).json({
      message: "Reservations retrieved successfully",
      data: propertyReservations,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving reservations", error });
  }
};

exports.getProperty = async (req, res) => {
  console.log("getProperty request");
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.propertyId)) {
      return res.status(400).json({ message: "Invalid property ID format" });
    }

    const PropertyDOC = await Property.findById(req.params.propertyId);
    if (!PropertyDOC) {
      return res.status(404).json({ message: "Property not found" });
    }

    let minRoomPrice = null;
    let roomTypes = {
      single: null,
      double: null,
      suite: null,
    };

    if (PropertyDOC.propertyType === "Hotel") {
      // Calculate minRoomPrice from the rooms array
      minRoomPrice = Math.min(
        ...PropertyDOC.rooms.map((room) => room.pricePerNight)
      );
      console.log("Minimum Room Price:", minRoomPrice);

      // Extract room types from the rooms array of this specific property
      const singleRoom = PropertyDOC.rooms.find(
        (room) => room.type === "Single"
      );
      const doubleRoom = PropertyDOC.rooms.find(
        (room) => room.type === "Double"
      );
      const suiteRoom = PropertyDOC.rooms.find((room) => room.type === "Suite");

      // Populate roomTypes with available room data
      if (singleRoom) {
        roomTypes.single = { price: singleRoom.pricePerNight };
        console.log(`singleRoom: ${JSON.stringify(singleRoom)}`);
      }
      if (doubleRoom) {
        roomTypes.double = { price: doubleRoom.pricePerNight };
        console.log(`doubleRoom: ${JSON.stringify(doubleRoom)}`);
      }
      if (suiteRoom) {
        roomTypes.suite = { price: suiteRoom.pricePerNight };
        console.log(`suiteRoom: ${JSON.stringify(suiteRoom)}`);
      }
    }

    console.log("Property ID:", PropertyDOC._id);
    console.log("roomTypes", roomTypes);

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
      rooms: PropertyDOC.rooms,
      minRoomPrice: minRoomPrice,
      roomTypes: roomTypes, // Structured object with null for missing types
    });
  } catch (error) {
    console.error("Error fetching property:", error.message);
    res.status(500).json({ error: error.message });
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
