import express from "express";
import {
  createOrder,
  getOrders,
  acceptOrder,
  completeOrder,
  cancelOrder,
  getSingleOrder,
  sellerDashboard,
} from "../controllers/orderController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/", protect, getOrders);
router.get("/seller-dashboard", protect, sellerDashboard);
router.get("/:id", protect, getSingleOrder);
router.put("/:id/accept", protect, acceptOrder);
router.put("/:id/complete", protect, completeOrder);
router.put("/:id/cancel", protect, cancelOrder);



export default router;

