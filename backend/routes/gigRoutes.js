import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createGig, getCategories, getGigById, getGigs } from "../controllers/gigController.js";

const router =  express.Router();

router.post("/", protect, createGig)
router.get("/", getGigs);
router.get("/categories", getCategories);
router.get("/:id", getGigById);

export default router;