import express from "express";
import {
  createReview,
  getReviews,
  updateReview
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();


router.post("/orders/:orderId", protect, createReview);
router.get("/gigs/:gigId", getReviews);
router.put("/:reviewId", protect, updateReview);

export default router;