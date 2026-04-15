import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createPayment, verifyPayment } from "../controllers/paymentControlle.js";

const router = express.Router();

router.post("/create", protect, createPayment);
router.post("/verify", protect, verifyPayment); 

export default router;