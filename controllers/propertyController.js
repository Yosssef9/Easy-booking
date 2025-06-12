const { Property } = require("../models/property");
const Review = require("../models/reviewModel");
const reservations = require("../models/reservations");
const User = require("../models/userModel");
const mongoose = require("mongoose");

exports.getAllProperties = async (req, res) => {
  console.log("getAllProperties hit ");
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
    const propertyId = req.params.id.trim(); // ✅ remove hidden \n

    console.log(`propertyId : ${propertyId}`);
    console.log(
      `request to getPropertyReservations hhhhhhhhhhhhhhhhhhhhhhhhhhhh`
    );
    // Validate the ID format
    // if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    //   return res.status(400).json({ message: "Invalid property ID" });
    // }

    // Fetch reservations for this property
    const propertyReservations = await reservations
      .find({ propertyId })
      .populate("tenant", "-password -__v")
      .populate("propertyId", "-__v"); // ✅ Add this line

    console.log(`propertyReservations : ${propertyReservations}`);

    // const match = allReservations.find(
    //   (r) => r.propertyId.toString() === propertyId
    // );

    // console.log("Manual match found:", match);

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
    console.error("Error retrieving reservations:", error); // log full error
    res.status(500).json({ message: "Error retrieving reservations", error });
  }
};

exports.searchProperties = async (req, res) => {
  try {
    const { city, propertyType, minPrice, maxPrice, name } = req.body;

    const query = {};

    if (city) {
      query["location.city"] = city;
    }

    if (propertyType && propertyType !== "Both") {
      query.propertyType = propertyType;
    }

    if (name) {
      query.name = { $regex: name, $options: "i" };
    }

    let properties = await Property.find(query);

    // Filter by price if needed
    properties = properties.filter((property) => {
      let price = 0;

      if (property.propertyType === "House") {
        price = property.pricePerNight;
      } else if (property.propertyType === "Hotel") {
        const prices = property.rooms.map((r) => r.pricePerNight);
        price = prices.length ? Math.min(...prices) : 0;
      }

      return (
        (!minPrice || price >= minPrice) && (!maxPrice || price <= maxPrice)
      );
    });

    // Add minRoomPrice to hotels
    properties = properties.map((propertyDoc) => {
      let minRoomPrice = null;

      if (propertyDoc.propertyType === "Hotel") {
        const prices = propertyDoc.rooms.map((room) => room.pricePerNight);
        minRoomPrice = prices.length ? Math.min(...prices) : null;
      }

      return {
        ...propertyDoc.toObject(),
        minRoomPrice,
      };
    });

    res.json({ data: properties });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Search failed", error: err.message });
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

    const agg = await Review.aggregate([
      {
        $match: {
          property: new mongoose.Types.ObjectId(req.params.propertyId),
        },
      },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } },
    ]);
    const usersRating =
      agg.length > 0 ? Number(agg[0].avgRating.toFixed(2)) : 0;

    console.log(`usersRating:${usersRating}`);
    res.json({
      name: PropertyDOC.name,
      location: PropertyDOC.location,
      rating: PropertyDOC.rating,
      usersRating,
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

exports.getBasicRecommendations = async (req, res) => {
  console.log(">>> getBasicRecommendations called, user id:", req.user.id);
  try {
    // 1) Load the logged-in user
    const user = await User.findById(req.user.id).lean();
    console.log("Loaded user from DB:", user);
    if (!user) {
      console.log("→ No user found, returning 404");
      return res.status(404).json({ message: "User not found" });
    }

    // 2) Check review count
    const reviewCount = await Review.countDocuments({ user: user._id });
    console.log("User has", reviewCount, "reviews");
    if (reviewCount > 0) {
      console.log(
        "→ User has reviews, returning personalized recommendedPlaces"
      );
      // fetch the full Property docs for those IDs
      const recs = await Property.find({
        _id: { $in: user.recommendedPlaces },
      }).lean();
      return res.json({ recommendations: recs });
    }

    // 3) Build aggregation inputs
    const favCity = user.favouriteCity;
    const targetPrice = user.avargePrice;
    console.log("Favourite city:", favCity, "Target price:", targetPrice);

    // Guard against missing data
    if (!favCity) console.warn("⚠️  favouriteCity is empty");
    if (targetPrice == null) console.warn("⚠️  avargePrice is empty");

    // 4) Run aggregation
    const recs = await Property.aggregate([
      { $match: { "location.city": favCity } },
      {
        $addFields: {
          priceDiff: { $abs: { $subtract: ["$pricePerNight", targetPrice] } },
        },
      },
      { $sort: { priceDiff: 1 } },
      { $limit: 5 },
      { $project: { priceDiff: 0 } },
    ]);
    console.log("Aggregation returned", recs.length, "recommendations");

    // 5) Return
    return res.json({ recommendations: recs });
  } catch (err) {
    console.error("❌ Error in getBasicRecommendations:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
