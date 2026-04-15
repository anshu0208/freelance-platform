import Gig from "../models/Gig.js";
import Order from "../models/Order.js";

export const createGig = async (req, res) => {
    try {
        const {title, description, price, deliveryTime, category} = req.body;
    
       //role check
        if(req.user.role !== "seller"){
            return res.status(403).json("Only seller can create gigs")
        }
         
        const gig = await Gig.create({
            title,
            description,
            price,
            deliveryTime,
            category,
            user: req.user._id,
        })

        res.status(201).json(gig);
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

export const updateGig = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;

    const gig = await Gig.findById(id);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: "Gig not found",
      });
    }

    // 🔥 OWNER CHECK
    if (gig.user.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to edit this gig",
      });
    }

    const updatedGig = await Gig.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      gig: updatedGig,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteGig = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;

    const gig = await Gig.findById(id);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: "Gig not found",
      });
    }

    // 🔥 OWNER CHECK
    if (gig.user.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this gig",
      });
    }

        const activeOrders = await Order.findOne({
      gigId: id,
      status: { $in: ["pending", "accepted"] },
    });

    if (activeOrders) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete gig with active orders",
      });
    }

    await gig.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Gig deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



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

    const userId = req.user?._id; //  get current user

    let query = {};

    //  EXCLUDE OWN GIGS 
    if (userId) {
      query.user = { $ne: userId };
    }

    //  SEARCH
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    //  CATEGORY
    if (category) {
      query.category = category;
    }

    //  PRICE FILTER
    if (min || max) {
      query.price = {};
      if (min) query.price.$gte = Number(min);
      if (max) query.price.$lte = Number(max);
    }

    //  PAGINATION
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // TOTAL COUNT (for frontend pagination later)
    const total = await Gig.countDocuments(query);

    const gigs = await Gig.find(query)
      .populate("user", "name")
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      gigs,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Gig.distinct("category");
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getGigById = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id).populate("user", "name");

    if (!gig) {
      return res.status(404).json({ message: "Gig not found" });
    }

    res.status(200).json(gig);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyGigs = async (req, res) => {
  try {
    const gigs = await Gig.find({ user: req.user._id });
    res.status(200).json(gigs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching gigs" });
  }
};