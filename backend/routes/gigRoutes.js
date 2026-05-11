import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createGig, deleteGig, getCategories, getGigById, getGigs, getMyGigs, updateGig } from "../controllers/gigController.js";
import { upload } from "../middleware/multer.js";

const router =  express.Router();

router.post("/", protect,upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 }
  ]),
   createGig)
router.get("/", getGigs);
router.get("/categories", getCategories);
router.get("/my-gigs", protect, getMyGigs);
router.get("/:id", getGigById);
router.put("/:id", protect, upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },

    {
      name: "coverImage",
      maxCount: 1,
    },
  ]), updateGig);
router.delete("/:id", protect, deleteGig);


export default router;