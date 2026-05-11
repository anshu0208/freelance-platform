import Gig from "../models/Gig.js";
import Order from "../models/Order.js";

import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../config/cloudinary.js";

// ======================================================
// CREATE GIG
// ======================================================

export const createGig = async (req, res) => {
  try {

    const {
      title,
      description,
      price,
      deliveryTime,
      category,
    } = req.body;

    // ROLE CHECK
    if (req.user.role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Only sellers can create gigs",
      });
    }

    // FILE PATHS
    const avatarLocalPath =
      req.files?.avatar?.[0]?.path;

    const coverLocalPath =
      req.files?.coverImage?.[0]?.path;

    // AVATAR REQUIRED
    if (!avatarLocalPath) {
      return res.status(400).json({
        success: false,
        message: "Thumbnail image is required",
      });
    }

    // UPLOAD AVATAR
    const avatar =
      await uploadOnCloudinary(
        avatarLocalPath,
        "freelancex/gigs"
      );

    if (!avatar) {
      return res.status(400).json({
        success: false,
        message: "Avatar upload failed",
      });
    }

    // OPTIONAL COVER
    let coverImage = null;

    if (coverLocalPath) {

      coverImage =
        await uploadOnCloudinary(
          coverLocalPath,
          "freelancex/gigs"
        );
    }

    // CREATE GIG
    const gig = await Gig.create({
      title,
      description,
      price,
      deliveryTime,
      category,

      user: req.user._id,

      avatar: {
        url: avatar.secure_url,
        public_id: avatar.public_id,
      },

      coverImage: coverImage
        ? {
            url: coverImage.secure_url,
            public_id: coverImage.public_id,
          }
        : {},
    });

    return res.status(201).json({
      success: true,
      gig,
    });

  } catch (error) {

    console.log(
      "Create Gig Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// UPDATE GIG
// ======================================================

export const updateGig = async (req, res) => {

  try {

    const { id } = req.params;
    const { user } = req;

    const gig = await Gig.findById(id);

    // GIG CHECK
    if (!gig) {
      return res.status(404).json({
        success: false,
        message: "Gig not found",
      });
    }

    // OWNER CHECK
    if (
      gig.user.toString() !==
      user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Not authorized to edit this gig",
      });
    }

    // =====================================
    // FILE PATHS
    // =====================================

    const avatarLocalPath =
      req.files?.avatar?.[0]?.path;

    const coverLocalPath =
      req.files?.coverImage?.[0]?.path;

    // =====================================
    // REPLACE AVATAR
    // =====================================

    if (avatarLocalPath) {

      // delete old image
      if (gig.avatar?.public_id) {

        await deleteFromCloudinary(
          gig.avatar.public_id
        );
      }

      // upload new image
      const uploadedAvatar =
        await uploadOnCloudinary(
          avatarLocalPath,
          "freelancex/gigs"
        );

      if (uploadedAvatar) {

        gig.avatar = {
          url:
            uploadedAvatar.secure_url,

          public_id:
            uploadedAvatar.public_id,
        };
      }
    }

    // =====================================
    // REPLACE COVER IMAGE
    // =====================================

    if (coverLocalPath) {

      if (
        gig.coverImage?.public_id
      ) {

        await deleteFromCloudinary(
          gig.coverImage.public_id
        );
      }

      const uploadedCover =
        await uploadOnCloudinary(
          coverLocalPath,
          "freelancex/gigs"
        );

      if (uploadedCover) {

        gig.coverImage = {
          url:
            uploadedCover.secure_url,

          public_id:
            uploadedCover.public_id,
        };
      }
    }

    // =====================================
    // TEXT FIELD UPDATES
    // =====================================

    if (req.body.title !== undefined) {
      gig.title = req.body.title;
    }

    if (
      req.body.description !== undefined
    ) {
      gig.description =
        req.body.description;
    }

    if (req.body.price !== undefined) {
      gig.price = req.body.price;
    }

    if (
      req.body.deliveryTime !==
      undefined
    ) {
      gig.deliveryTime =
        req.body.deliveryTime;
    }

    if (
      req.body.category !== undefined
    ) {
      gig.category =
        req.body.category;
    }

    // SAVE
    await gig.save();

    return res.status(200).json({
      success: true,
      message:
        "Gig updated successfully",
      gig,
    });

  } catch (error) {

    console.log(
      "Update Gig Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// DELETE GIG
// ======================================================

export const deleteGig = async (req, res) => {

  try {

    const { id } = req.params;
    const { user } = req;

    const gig = await Gig.findById(id);

    // GIG CHECK
    if (!gig) {
      return res.status(404).json({
        success: false,
        message: "Gig not found",
      });
    }

    // OWNER CHECK
    if (
      gig.user.toString() !==
      user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Not authorized to delete this gig",
      });
    }

    // ACTIVE ORDER CHECK
    const activeOrders =
      await Order.findOne({
        gigId: id,

        status: {
          $in: [
            "pending",
            "accepted",
          ],
        },
      });

    if (activeOrders) {

      return res.status(400).json({
        success: false,

        message:
          "Cannot delete gig with active orders",
      });
    }

    // DELETE CLOUDINARY IMAGES

    if (gig.avatar?.public_id) {

      await deleteFromCloudinary(
        gig.avatar.public_id
      );
    }

    if (
      gig.coverImage?.public_id
    ) {

      await deleteFromCloudinary(
        gig.coverImage.public_id
      );
    }

    // DELETE GIG
    await gig.deleteOne();

    return res.status(200).json({
      success: true,
      message:
        "Gig deleted successfully",
    });

  } catch (error) {

    console.log(
      "Delete Gig Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// GET ALL GIGS
// ======================================================

export const getGigs = async (req, res) => {

  try {

    const {
      category,
      min,
      max,
      search,
      page = 1,
      limit = 6,
      sort = "-createdAt",
    } = req.query;

    const userId =
      req.user?._id;

    let query = {};

    // EXCLUDE OWN GIGS
    if (userId) {

      query.user = {
        $ne: userId,
      };
    }

    // SEARCH
    if (search) {

      query.title = {
        $regex: search,
        $options: "i",
      };
    }

    // CATEGORY
    if (category) {
      query.category = category;
    }

    // PRICE FILTER
    if (min || max) {

      query.price = {};

      if (min) {
        query.price.$gte =
          Number(min);
      }

      if (max) {
        query.price.$lte =
          Number(max);
      }
    }

    // PAGINATION
    const pageNum =
      Number(page);

    const limitNum =
      Number(limit);

    const skip =
      (pageNum - 1) *
      limitNum;

    const total =
      await Gig.countDocuments(
        query
      );

    const gigs =
      await Gig.find(query)
        .populate("user", "name")
        .sort(sort)
        .skip(skip)
        .limit(limitNum);

    return res.status(200).json({
      success: true,

      gigs,

      total,

      page: pageNum,

      pages: Math.ceil(
        total / limitNum
      ),
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// GET CATEGORIES
// ======================================================

export const getCategories = async (
  req,
  res
) => {

  try {

    const categories =
      await Gig.distinct(
        "category"
      );

    return res
      .status(200)
      .json(categories);

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// GET SINGLE GIG
// ======================================================

export const getGigById = async (
  req,
  res
) => {

  try {

    const gig =
      await Gig.findById(
        req.params.id
      ).populate("user", "name");

    if (!gig) {

      return res.status(404).json({
        success: false,
        message: "Gig not found",
      });
    }

    return res.status(200).json({
      success: true,
      gig,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// GET MY GIGS
// ======================================================

export const getMyGigs = async (
  req,
  res
) => {

  try {

    const gigs =
      await Gig.find({
        user: req.user._id,
      });

    return res.status(200).json({
      success: true,
      gigs,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message:
        "Error fetching gigs",
    });
  }
};