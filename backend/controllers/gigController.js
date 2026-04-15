import Gig from "../models/Gig.js";

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

    let query = {};

    // SEARCH (NEW)
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Price filter
    if (min || max) {
      query.price = {};
      if (min) query.price.$gte = Number(min);
      if (max) query.price.$lte = Number(max);
    }

    // Pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const gigs = await Gig.find(query)
      .populate("user", "name")
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json(gigs);

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