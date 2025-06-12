const Review = require("../models/reviewModel");

exports.createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const propertyId = req.params.propertyId;
    const userId = req.user.id;

    // Will throw if duplicate
    const review = await Review.create({
      property: propertyId,
      user: userId,
      rating,
      comment,
    });
    res.status(201).json({ message: "Review added", review });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "You already reviewed this property" });
    }
    console.error(err);
    res.status(500).json({ message: "Error creating review" });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;
    const userId = req.user.id;
    let reviews = await Review.find({ property: propertyId })
      .populate("user", "username")
      .sort("-createdAt");

    // Move current user’s review to front
    reviews = reviews.sort((a, b) => {
      if (a.user._id.equals(userId)) return -1;
      if (b.user._id.equals(userId)) return 1;
      return b.createdAt - a.createdAt;
    });

    res.json({ reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching reviews" });
  }
};
