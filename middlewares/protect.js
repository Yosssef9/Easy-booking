const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const protect = (req, res, next) => {
  const token = req.cookies.token; // Get token from cookies

  if (!token) {
    console.log("no token");
    return res.redirect("/login"); // Redirecting to login page
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Store user info in req.user
    console.log("Decoded User:", req.user); // Debugging line
    next(); // Proceed to the next middleware
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token." });
  }
};

// ✅ Export the function directly
module.exports = protect;
