import { useEffect, useState, useRef } from "react";
import API from "../services/api";
import { socket } from "../context/SocketContext";
import MessageBubble from "./MessageBubble";

const ChatWindow = ({ selected, onlineUsers }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);

  const bottomRef = useRef(null);

  // 🔥 FORMAT LAST SEEN (SMART)
  const formatLastSeen = (date) => {
    if (!date) return "";

    const d = new Date(date);
    const now = new Date();

    const diff = Math.floor((now - d) / 1000);

    if (diff < 60) return "Last seen just now";
    if (diff < 3600) return `Last seen ${Math.floor(diff / 60)} min ago`;

    const isToday = d.toDateString() === now.toDateString();

    if (isToday) {
      return `Last seen today at ${d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    return `Last seen on ${d.toLocaleDateString()}`;
  };

  // 🔥 FETCH MESSAGES
  useEffect(() => {
    if (!selected) return;

    const fetch = async () => {
      const res = await API.get(`/messages/${selected._id}`);
      setMessages(res.data);
    };

    fetch();
    socket.emit("join_conversation", selected._id);
  }, [selected]);

  // 🔥 RECEIVE MESSAGE
  useEffect(() => {
    const handleReceive = (msg) => {
      if (msg.conversationId === selected?._id) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("receive_message", handleReceive);
    return () => socket.off("receive_message", handleReceive);
  }, [selected]);

  // 🔥 MESSAGE DELIVERED
  useEffect(() => {
    const handleDelivered = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? { ...msg, status: "delivered" }
            : msg
        )
      );
    };

    socket.on("message_delivered", handleDelivered);
    return () => socket.off("message_delivered", handleDelivered);
  }, []);

  // 🔥 MESSAGE READ
 useEffect(() => {
  const handleRead = ({ messageIds }) => {
    setMessages((prev) =>
      prev.map((msg) =>
        messageIds.some((id) => id.toString() === msg._id.toString())
          ? { ...msg, status: "read" }
          : msg
      )
    );
  };

  socket.on("messages_read", handleRead);

  return () => socket.off("messages_read", handleRead);
}, []);

  // 🔥 TYPING LISTENER (FIXED)
  useEffect(() => {
    const handleTyping = ({ conversationId }) => {
      if (conversationId === selected?._id) {
        setTyping(true);
      }
    };

    const handleStopTyping = ({ conversationId }) => {
      if (conversationId === selected?._id) {
        setTyping(false);
      }
    };

    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stop_typing", handleStopTyping);
    };
  }, [selected]);

  // 🔥 AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔥 SEND MESSAGE
  const handleSend = async () => {
    if (!text.trim()) return;

    const res = await API.post("/messages", {
      conversationId: selected._id,
      content: text,
    });

    setMessages((prev) => [
      ...prev,
      { ...res.data, status: "sent" },
    ]);

    setText("");

    socket.emit("stop_typing", {
      conversationId: selected._id,
    });
  };

  // 🔥 TYPING EMIT
  const handleTyping = (e) => {
    setText(e.target.value);

    socket.emit("typing", {
      conversationId: selected._id,
    });
  };

  if (!selected) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Select a chat
      </div>
    );
  }

  const isOnline = onlineUsers?.includes(
    selected.otherUser?._id
  );

  return (
    <div className="flex-1 flex flex-col bg-gray-50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">

      {/* HEADER */}
      <div className="p-4 border-b bg-white flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-semibold">
          {selected.otherUser?.name?.charAt(0)}
        </div>

        <div>
          <p className="font-medium">
            {selected.otherUser?.name}
          </p>

          <p className="text-xs text-green-500">
            {typing
              ? "Typing..."
              : isOnline
              ? "Online"
              : formatLastSeen(selected.otherUser?.lastSeen)}
          </p>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-6 space-y-2">
        {messages.map((msg, i) => (
          <MessageBubble
            key={msg._id}
            msg={msg}
            prevMsg={messages[i - 1]}
          />
        ))}
        <div ref={bottomRef}></div>
      </div>

      {/* INPUT */}
      <div className="p-4 border-t bg-white flex items-center gap-3">
        <input
          value={text}
          onChange={handleTyping}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          placeholder="Type a message..."
          className="flex-1 bg-gray-100 px-5 py-3 rounded-full outline-none focus:ring-2 focus:ring-green-500 transition"
        />

        <button
          onClick={handleSend}
          className="bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600 transition shadow"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;