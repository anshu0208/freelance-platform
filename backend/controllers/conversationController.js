import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

export const createConversation = async (req, res) => {
  try {
    const { buyerId, sellerId, orderId } = req.body;

    let conversation = await Conversation.findOne({ orderId });

    if (conversation) {
      return res.status(200).json(conversation); // ✅ RETURN EXISTING
    }

    conversation = await Conversation.create({
      buyerId,
      sellerId,
      orderId,
    });

    res.status(201).json(conversation);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      $or: [{ buyerId: userId }, { sellerId: userId }],
    }).sort({ updatedAt: -1 });

    const result = await Promise.all(
      conversations.map(async (conv) => {
        const otherUserId = conv.buyerId.equals(userId)
          ? conv.sellerId
          : conv.buyerId;

        const otherUser = await User.findById(otherUserId).select(
          "name isOnline lastSeen"
        );

        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          senderId: { $ne: userId },
          status: { $ne: "read" },
        });

        return {
          ...conv.toObject(),
          otherUser,
          unreadCount,
        };
      })
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};