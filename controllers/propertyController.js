const { Property } = require("../models/property");
const mongoose = require("mongoose");

exports.getAllProperties = async (req, res) => {
  try {
    let properties = await Property.find();
    if (properties.length == 0) {
      return res.status(400).json({ message: "data not found" });
    }
    res.status(201).json({
      message: "data get successfully!",
      data: properties,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error get properties ", error });
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
    });
  } catch (error) {
    console.error("Error fetching movie:", error.message);
    res.status(500).json({ error: error });
  }
};
