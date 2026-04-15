import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createGig, deleteGig, getCategories, getGigById, getGigs, getMyGigs, updateGig } from "../controllers/gigController.js";

const router =  express.Router();

router.post("/", protect, createGig)
router.get("/", getGigs);
router.get("/categories", getCategories);
router.get("/my-gigs", protect, getMyGigs);
router.get("/:id", getGigById);
router.put("/:id", protect, updateGig);
router.delete("/:id", protect, deleteGig);


export default router;