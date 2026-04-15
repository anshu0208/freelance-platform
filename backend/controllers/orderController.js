import Gig from "../models/Gig.js";
import Order from "../models/Order.js";
import mongoose from "mongoose";

//  Helper: check ownership
const isOwner = (id1, id2) => id1.toString() === id2.toString();


// ================= CREATE ORDER =================
export const createOrder = async (req, res) => {
  try {
    const { gigId } = req.body;
    const { user } = req;

    // 🔒 1. Only buyers allowed
    if (user.role !== "buyer") {
      return res.status(403).json({
        success: false,
        message: "Only buyers can place orders",
      });
    }

    // 🔍 2. Find gig
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({
        success: false,
        message: "Gig not found",
      });
    }

    // 🚫 3. Prevent buying own gig (VERY IMPORTANT)
    if (gig.user.toString() === user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot buy your own gig",
      });
    }

    // 🚫 4. Prevent duplicate orders (PRO FEATURE)
    const existingOrder = await Order.findOne({
      gigId,
      buyerId: user._id,
      status: { $in: ["pending", "accepted"] },
    });

    if (existingOrder) {
      return res.status(400).json({
        success: false,
        message: "You already have an active order for this gig",
      });
    }

    // ✅ 5. Create order
    const order = await Order.create({
      gigId,
      buyerId: user._id,
      sellerId: gig.user,
      price: gig.price,
    });

    return res.status(201).json({
      success: true,
      order,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ================= GET ORDERS =================
export const getOrders = async (req, res) => {
  try {
    const { user } = req;
    const { status, page = 1, limit = 5 } = req.query;

    let filter = {};

    // Role-based filter
    if (user.role === "buyer") {
      filter.buyerId = user._id;
    } else if (user.role === "seller") {
      filter.sellerId = user._id;
    } else {
      return res.status(403).json({
        success: false,
        message: "Invalid role",
      });
    }

    // Status filter
    if (status) {
      filter.status = status;
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Parallel queries (optimized)
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("gigId", "title price")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),
      Order.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      orders,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
 

//====================GET SINGLE ORDER=======================

export const getSingleOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate("gigId")
      .populate("buyerId", "name")
      .populate("sellerId", "name");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// ================= ACCEPT ORDER =================
export const acceptOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!isOwner(order.sellerId, user._id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (order.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Order already processed",
      });
    }

    order.status = "accepted";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order accepted",
      order,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ================= COMPLETE ORDER =================
export const completeOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!isOwner(order.buyerId, user._id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (order.status !== "accepted") {
      return res.status(400).json({
        success: false,
        message: "Order cannot be completed",
      });
    }

    order.status = "completed";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order completed",
      order,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ================= CANCEL ORDER =================
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const isBuyer = isOwner(order.buyerId, user._id);
    const isSeller = isOwner(order.sellerId, user._id);

    if (!isBuyer && !isSeller) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (order.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled",
      });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Order already cancelled",
      });
    }

    order.status = "cancelled";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled",
      order,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ================= SELLER DASHBOARD =================


export const sellerDashboard = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    if (user.role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Only sellers allowed",
      });
    }

    const sellerId = new mongoose.Types.ObjectId(user._id);

    const range = req.query.range || "7d";
    const days = range === "30d" ? 30 : 7;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    //  PARALLEL QUERIES
    const [
      totalOrders,
      completedOrders,
      activeOrders,
      earningsData,
      chartData,
      recentOrders,
    ] = await Promise.all([

      // TOTAL
      Order.countDocuments({ sellerId }),

      // COMPLETED
      Order.countDocuments({ sellerId, status: "completed" }),

      // ACTIVE
      Order.countDocuments({
        sellerId,
        status: { $in: ["pending", "accepted"] },
      }),

      // TOTAL EARNINGS
      Order.aggregate([
        {
          $match: {
            sellerId,
            status: "completed",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$price" },
          },
        },
      ]),

      // CHART DATA (LAST 7/30 DAYS)
      Order.aggregate([
        {
          $match: {
            sellerId,
            status: "completed",
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            earnings: { $sum: "$price" },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      //  RECENT ORDERS
      Order.find({ sellerId })
  .sort({ createdAt: -1 })
  .limit(5)
  .populate("gigId", "title") // 🔥 IMPORTANT
  .lean()
    ]);

    const totalEarnings = earningsData[0]?.total || 0;

    //  FORMAT CHART DATA
    const formattedChart = chartData.map((item) => ({
      date: item._id,
      earnings: item.earnings,
    }));

      //  FORMAT RECENT ORDERS
      const formattedOrders = recentOrders.map((order) => ({
      _id: order._id,
      title: order.gigId?.title || "Untitled Gig", // 🔥 FIX
      price: order.price,
      status: order.status,
    }));

    return res.status(200).json({
      success: true,
      totalOrders,
      completedOrders,
      activeOrders,
      totalEarnings,
      chartData: formattedChart,
      recentOrders: formattedOrders,
    });

  } catch (error) {
    console.error("SELLER DASHBOARD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};