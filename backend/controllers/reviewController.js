import Gig from "../models/Gig.js";
import Order from "../models/Order.js";
import Review from "../models/Review.js";

// 🔧 helper
const isOwner = (id1, id2) => id1.toString() === id2.toString();
const validateRating = (rating) => rating >= 1 && rating <= 5;


// ================= CREATE REVIEW =================
export const createReview = async (req, res) => {
  try {
    const { user } = req;
    const { rating, comment = "" } = req.body;
    const { orderId } = req.params;

    const numericRating = Number(rating);

    if (!validateRating(numericRating)) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (user.role !== "buyer") {
      return res.status(403).json({
        success: false,
        message: "Only buyers can review",
      });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (!isOwner(order.buyerId, user._id)) {
      return res.status(403).json({ message: "Not your order" });
    }

    if (order.status !== "completed") {
      return res.status(400).json({
        message: "Complete order first",
      });
    }

    const review = await Review.create({
      gigId: order.gigId,
      sellerId: order.sellerId,
      buyerId: user._id,
      orderId: order._id,
      rating: numericRating,
      comment: comment?.trim(),
    });

    const gig = await Gig.findById(order.gigId);

    const totalReviews = (gig.totalReviews || 0) + 1;

    const avg =
      ((gig.averageRating || 0) * (gig.totalReviews || 0) +
        numericRating) /
      totalReviews;

    gig.totalReviews = totalReviews;
    gig.averageRating = Number(avg.toFixed(1)); // 🔥 FIX

    await gig.save();

    res.status(201).json({
      success: true,
      review,
    });

  } catch (err) {
    // 🔥 handle duplicate error safely
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Already reviewed",
      });
    }

    res.status(500).json({ message: err.message });
  }
};

// ================= GET REVIEWS =================
export const getReviews = async (req, res) => {
  try {
    const { gigId } = req.params;

    const reviews = await Review.find({ gigId })
      .populate("buyerId", "name")
      .sort({ createdAt: -1 })
      .lean(); // 🔥 FIX

    res.json({
      success: true,
      count: reviews.length,
      reviews,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= UPDATE REVIEW =================
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment = "" } = req.body;
    const { user } = req;

    const newRating = Number(rating);

    //  VALIDATION
    if (!validateRating(newRating)) {
      return res.status(400).json({ message: "Invalid rating" });
    }

    //  FIND REVIEW
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    //  AUTH CHECK
    if (!isOwner(review.buyerId, user._id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const oldRating = review.rating;

    //  UPDATE REVIEW
    review.rating = newRating;
    review.comment = comment.trim();


    review.isEdited = true; 

    await review.save();

    //  UPDATE GIG RATING SAFELY
    const gig = await Gig.findById(review.gigId);

    if (!gig) {
      return res.status(404).json({ message: "Gig not found" });
    }

    if (gig.totalReviews > 0) {
      const updatedAverage =
        (gig.averageRating * gig.totalReviews - oldRating + newRating) /
        gig.totalReviews;

      gig.averageRating = Number(updatedAverage.toFixed(1));
      await gig.save();
    }

    
    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review,
    });

  } catch (err) {
    console.error("UPDATE REVIEW ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};