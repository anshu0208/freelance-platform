import Razorpay from "razorpay";
import dotenv from "dotenv";
import crypto from "crypto";
import Order from "../models/Order.js";
import Gig from "../models/Gig.js";

dotenv.config();

//  CREATE PAYMENT
export const createPayment = async (req, res) => {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ message: "Amount is required" });
    }

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json(order);

  } catch (err) {
    console.error("PAYMENT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

//  VERIFY PAYMENT
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      gigId,
    } = req.body;

    //  VERIFY SIGNATURE
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    //  GET GIG (to get seller + price)
    const gig = await Gig.findById(gigId);

    if (!gig) {
      return res.status(404).json({ message: "Gig not found" });
    }

    //  CREATE ORDER (FIXED)
   const newOrder = await Order.create({
  gigId: gig._id,
  buyerId: req.user._id,
  sellerId: gig.user,
  price: gig.price,

  status: "pending",          // work not started
  paymentStatus: "paid",      //  money received

  paymentId: razorpay_payment_id,
  razorpayOrderId: razorpay_order_id,
});

    res.status(200).json({
      message: "Payment verified",
      order: newOrder,
    });

  } catch (err) {
    console.error("VERIFY ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};