const { Property, Hotel } = require("../models/property");
const Room = require("../models/roomModel");
const { validationResult } = require("express-validator");
const runModel = require("./modelRunner");

exports.addHotel = async (req, res) => {
  try {
    // Ensure `rooms` is parsed correctly
    let rooms = req.body.rooms;
    if (typeof rooms === "string") {
      try {
        rooms = JSON.parse(rooms);
      } catch (error) {
        return res.status(400).json({ message: "Invalid rooms format" });
      }
    }
    console.log("rooms:", rooms);

    // Validate that `rooms` is an array
    if (!Array.isArray(rooms)) {
      return res.status(400).json({ message: "Rooms should be an array" });
    }

    console.log("req.body:", req.body);
    const hotelThumbnail = req.files["hotel-thumbnail"]
      ? req.files["hotel-thumbnail"][0].path // Single thumbnail for hotel
      : null;

    // Create the hotel document
    const newHotel = new Hotel({
      name: req.body.name,
      location: {
        city: req.body.city,
        zone: req.body.zone,
        street: req.body.street,
      },
      description: req.body.description,
      amenities: req.body.amenities ? JSON.parse(req.body.amenities) : [],
      thumbnail: hotelThumbnail,
      owner: req.user.id,
      propertyType: "Hotel", // Explicitly set discriminator type
    });

    // Save the hotel and get its ObjectId
    const savedHotel = await newHotel.save();

    // Prepare to create rooms
    let roomsToCreate = [];
    console.log("Uploaded files:", req.files);

    // Loop through each room type and create rooms based on quantity
    rooms.forEach((room) => {
      // Room image and thumbnail for the specific type (same for all rooms of that type)
      const roomImage = req.files[`room-image-${room.roomType}`]
        ? req.files[`room-image-${room.roomType}`][0].path
        : null;

      const roomThumbnail = req.files[`room-thumbnail-${room.roomType}`]
        ? req.files[`room-thumbnail-${room.roomType}`][0].path
        : null;

      // Create rooms based on quantity
      for (let i = 0; i < Number(room.NumberOfRooms); i++) {
        roomsToCreate.push({
          hotel: savedHotel._id, // Set the hotel ID in each room
          type: room.roomType,
          pricePerNight: Number(room.pricePerNight),
          maxGuests: Number(room.maxGuests),
          amenities: room.amenities,
          reservations: [],
          thumbnail: roomThumbnail || roomImage, // If room-thumbnail is not uploaded, use room-image
          images: [roomImage || roomThumbnail], // If room-thumbnail is not uploaded, use room-image
        });
      }
    });

    // Create rooms and associate them with the hotel
    console.log("Rooms to be created:", roomsToCreate);
    const createdRooms = await Room.insertMany(roomsToCreate);
    console.log("Created rooms:", createdRooms);
    // After the rooms are created, update the hotel's rooms field with room IDs
    savedHotel.rooms = createdRooms.map((room) => room);
    await savedHotel.save();

    res.status(201).json({
      message: "Hotel added successfully!",
      hotel: newHotel,
    });
    await runModel();
  } catch (error) {
    console.error("error : ", error);
    res.status(500).json({ message: "Error adding hotel", error });
  }
};
