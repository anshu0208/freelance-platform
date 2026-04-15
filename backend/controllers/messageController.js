import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

const checkAccess = (conv, userId) =>
  conv.buyerId.equals(userId) || conv.sellerId.equals(userId);

// SEND MESSAGE
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const userId = req.user._id;

    if (!conversationId || !content?.trim()) {
      return res.status(400).json({ message: "Invalid data" });
    }

    const conv = await Conversation.findById(conversationId);
    if (!conv) return res.status(404).json({ message: "Not found" });

    if (!checkAccess(conv, userId)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const message = await Message.create({
      conversationId,
      senderId: userId,
      content: content.trim(),
      status: "sent",
    });

    conv.lastMessage = message.content;
    conv.lastMessageSenderId = userId;
    await conv.save();

    const io = req.app.get("io");

      io.to(conversationId.toString()).emit("receive_message", message);

      // 🔥 mark delivered
      await Message.findByIdAndUpdate(message._id, {
        status: "delivered",
      });

      io.to(conversationId.toString()).emit("message_delivered", {
        messageId: message._id,
      });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET MESSAGES + AUTO READ
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conv = await Conversation.findById(conversationId);
    if (!conv) return res.status(404).json({ message: "Not found" });

    if (!checkAccess(conv, userId)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    //  GET ALL MESSAGES
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .lean();

    //  FIND UNREAD MESSAGES (IMPORTANT)
    const unreadMessages = await Message.find({
      conversationId,
      senderId: { $ne: userId },
      status: { $ne: "read" },
    });

    if (unreadMessages.length > 0) {
      const ids = unreadMessages.map((m) => m._id);

      //  UPDATE TO READ
      await Message.updateMany(
        { _id: { $in: ids } },
        { $set: { status: "read" } }
      );

      //  EMIT EXACT IDS
      const io = req.app.get("io");

      io.to(conversationId.toString()).emit("messages_read", {
        messageIds: ids,
      });
    }

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};