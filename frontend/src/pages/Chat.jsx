import { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { socket } from "../context/SocketContext";

import ConversationList from "../components/ConversationList";
import ChatWindow from "../components/ChatWindow";

// ✅ TOAST
import {
  showError,
  showLoading,
  updateToast,
} from "../utils/toast";

const Chat = () => {
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const [onlineUsers, setOnlineUsers] = useState([]);

  // 🔥 SOCKET CONNECT (SAFE)
  useEffect(() => {
    if (!user) return;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("user_online", user._id);

    return () => {
      socket.disconnect();
    };
  }, [user]);

  // 🔥 ONLINE USERS LISTENER
  useEffect(() => {
    const handleOnline = (userId) => {
      setOnlineUsers((prev) => [...new Set([...prev, userId])]);
    };

    const handleOffline = (userId) => {
      setOnlineUsers((prev) =>
        prev.filter((id) => id !== userId)
      );
    };

    socket.on("user_online", handleOnline);
    socket.on("user_offline", handleOffline);

    return () => {
      socket.off("user_online", handleOnline);
      socket.off("user_offline", handleOffline);
    };
  }, []);

  // 🔥 FETCH CONVERSATIONS
  useEffect(() => {
    const fetch = async () => {
      const toastId = showLoading("Loading chats...");

      try {
        const res = await API.get("/conversations");

        setConversations(res.data);

        // ✅ INITIAL ONLINE USERS
        const onlineInitial = res.data
          .filter((c) => c.otherUser?.isOnline)
          .map((c) => c.otherUser._id);

        setOnlineUsers(onlineInitial);

        if (res.data.length > 0) {
          setSelected(res.data[0]);
        }

        updateToast(toastId, "Chats loaded ✅");

      } catch (err) {
        console.error(err);

        showError(
          err.response?.data?.message || "Failed to load chats ❌"
        );
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  // 🔥 EMPTY STATE
  if (!loading && conversations.length === 0) {
    return (
      <div className="h-[calc(100vh-80px)] flex items-center justify-center text-gray-400">
        No conversations yet 💬
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] flex max-w-7xl mx-auto mt-6 rounded-2xl overflow-hidden shadow-lg border bg-white">

      <ConversationList
        conversations={conversations}
        selected={selected}
        setSelected={setSelected}
        loading={loading}
      />

      <ChatWindow
        selected={selected}
        onlineUsers={onlineUsers}
      />

    </div>
  );
};

export default Chat;