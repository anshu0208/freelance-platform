import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import { createServer } from "http";
import { initSocket } from "./sockets/socket.js";

import gigRoutes from "./routes/gigRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js"
import paymentRoutes from "./routes/paymentRoute.js"

dotenv.config();

const app = express();

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(cors({
  origin: [process.env.CLIENT_URL, process.env.VERCEL_URL],
  credentials: true,
}));
// ================= DB =================
connectDB();

// ================= ROUTES =================
app.use("/api/auth", authRoutes);
app.use("/api/gigs", gigRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/payment", paymentRoutes);

// ================= TEST ROUTE =================
app.get("/", (req, res) => {
  res.send("API is running...");
});

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
});

// ================= SERVER + SOCKET =================
const PORT = process.env.PORT || 5000;

const server = createServer(app);

// initialize socket
const io = initSocket(server);

// make io accessible in controllers
app.set("io", io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});