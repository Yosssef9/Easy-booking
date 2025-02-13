const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "accommodations", // Folder name in Cloudinary
    allowed_formats: ["jpg", "png", "jpeg", "webp"], // Allowed formats
  },
});

// Create multer instance with Cloudinary storage
const upload = multer({ storage });

// Export a function with fields for multiple images and a thumbnail image
module.exports = upload.fields([
  { name: "house-image", maxCount: 10 }, // Max count for house images
  { name: "hotel-image", maxCount: 10 }, // Max count for hotel images
  { name: "house-thumbnail", maxCount: 1 }, // Handle thumbnail
]);
