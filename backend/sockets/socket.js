import { Server } from "socket.io";
import User from "../models/User.js";

let onlineUsers = new Map();

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [
        process.env.CLIENT_URL,
        process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : undefined,
      ].filter(Boolean),
      credentials: true,
    },
  });

  io.on("connection", (socket) => {

    socket.on("user_online", async (userId) => {
      if (!userId) return;

      onlineUsers.set(userId, socket.id);

      await User.findByIdAndUpdate(userId, {
        isOnline: true,
      });

      io.emit("user_online", userId);
    });

    socket.on("join_conversation", (conversationId) => {
      socket.join(conversationId);
    });

    socket.on("typing", ({ conversationId, userId }) => {
      socket.to(conversationId).emit("typing", userId);
    });

    socket.on("stop_typing", ({ conversationId, userId }) => {
      socket.to(conversationId).emit("stop_typing", userId);
    });

    socket.on("disconnect", async () => {
      const userId = [...onlineUsers.entries()]
        .find(([_, sockId]) => sockId === socket.id)?.[0];

      if (!userId) return;

      onlineUsers.delete(userId);

      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date(),
      });

      io.emit("user_offline", userId);
    });
  });

  return io;
};