import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { socket } from "../context/SocketContext";
import {
  showError,
  showLoading,
  updateToast,
} from "../utils/toast";

// 🎨 STATUS BADGE
const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-600",
    accepted: "bg-blue-100 text-blue-600",
    completed: "bg-green-100 text-green-600",
    cancelled: "bg-red-100 text-red-600",
  };

  return (
    <span className={`px-3 py-1 text-sm rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
};

const OrderDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const bottomRef = useRef(null);

  // ⭐ REVIEW STATES
  const [review, setReview] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editing, setEditing] = useState(false);

  // 🔥 FETCH ORDER
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await API.get(`/orders/${id}`);
        setOrder(res.data);
      } catch {
        showError("Failed to load order");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  // 🔥 FETCH REVIEW
  useEffect(() => {
    if (!order) return;

    const fetchReview = async () => {
      try {
        const res = await API.get(`/reviews/gigs/${order.gigId._id}`);

        const found = res.data.reviews.find(
          (r) => r.orderId?.toString() === order._id.toString()
        );

        if (found) {
          setReview(found);
          setRating(found.rating);
          setComment(found.comment);
        }
      } catch {}
    };

    fetchReview();
  }, [order]);

  // 🔥 SOCKET
  useEffect(() => {
    if (!user) return;
    socket.connect();
    socket.emit("user_online", user._id);
    return () => socket.disconnect();
  }, [user]);

  // 🔥 INIT CONVERSATION
  useEffect(() => {
    if (!order) return;

    const init = async () => {
      const res = await API.post("/conversations", {
        orderId: id,
        buyerId: order.buyerId._id || order.buyerId,
        sellerId: order.sellerId._id || order.sellerId,
      });
      setConversationId(res.data._id);
    };

    init();
  }, [order]);

  // 🔥 FETCH MESSAGES
  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      const res = await API.get(`/messages/${conversationId}`);
      setMessages(res.data);
    };

    fetchMessages();
  }, [conversationId]);

  // 🔥 SOCKET LISTENER
  useEffect(() => {
    if (!conversationId) return;

    socket.emit("join_conversation", conversationId);

    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off("receive_message");
  }, [conversationId]);

  // 🔥 AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔥 SEND MESSAGE
  const handleSend = async () => {
    if (!text.trim()) return;

    try {
      setSending(true);

      const res = await API.post("/messages", {
        conversationId,
        content: text,
      });

      setMessages((prev) => [...prev, res.data]);
      setText("");
    } catch {
      showError("Message failed");
    } finally {
      setSending(false);
    }
  };

  const isMine = (msg) =>
    msg.senderId === user._id || msg.senderId?._id === user._id;

  // ⭐ SUBMIT REVIEW
  const handleReviewSubmit = async () => {
    if (!rating || !comment.trim()) {
      return showError("Fill all fields");
    }

    const toastId = showLoading("Submitting review...");
    setSubmittingReview(true);

    try {
      await API.post(`/reviews/orders/${order._id}`, {
        rating,
        comment,
      });

      updateToast(toastId, "Review submitted ✅");

      setReview({ rating, comment });
    } catch {
      updateToast(toastId, "Error", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  // ⭐ UPDATE REVIEW
  const handleReviewUpdate = async () => {
    const toastId = showLoading("Updating review...");
    setSubmittingReview(true);

    try {
      await API.put(`/reviews/${review._id}`, {
        rating,
        comment,
      });

      updateToast(toastId, "Updated ✅");

      setReview({ ...review, rating, comment, isEdited: true });
      setEditing(false);
    } catch {
      updateToast(toastId, "Failed", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!order) return <div className="p-10 text-center">Order not found</div>;

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">

        {/* LEFT */}
        <div className="md:col-span-2 space-y-6">

          {/* ORDER INFO */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h1 className="text-xl font-semibold">
              {order.gigId?.title}
            </h1>
            <p className="text-gray-500 text-sm">
              Order ID: {order._id}
            </p>
          </div>

          {/* STATUS */}
          <div className="bg-white p-6 rounded-xl shadow flex gap-3">
            <StatusBadge status={order.status} />
            <StatusBadge status={order.paymentStatus || "paid"} />
          </div>

          {/* CHAT */}
          <div className="bg-white rounded-2xl shadow flex flex-col h-[520px]">

            <div className="p-4 border-b font-semibold">
              Chat 💬
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">

              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${
                    isMine(msg) ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 text-sm rounded-2xl shadow
                      ${
                        isMine(msg)
                          ? "bg-green-500 text-white rounded-br-none"
                          : "bg-gray-100 rounded-bl-none"
                      }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              <div ref={bottomRef}></div>
            </div>

            <div className="p-3 border-t flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border rounded-full px-4 py-2 focus:ring-2 focus:ring-green-400 outline-none"
              />
              <button
                disabled={sending}
                onClick={handleSend}
                className="bg-green-500 text-white px-5 rounded-full hover:bg-green-600 disabled:opacity-50"
              >
                {sending ? "..." : "Send"}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">

          <div className="bg-white p-6 rounded-xl shadow text-center">
            <h2 className="text-3xl font-bold text-green-600">
              ₹{order.price}
            </h2>
          </div>

          {/* ⭐ REVIEW */}
          {user.role === "buyer" && order.status === "completed" && (
            <div className="bg-white p-6 rounded-2xl shadow space-y-4">

              <h3 className="font-semibold">Your Review</h3>

              <div className="flex gap-2 text-2xl cursor-pointer">
                {[1,2,3,4,5].map((s) => (
                  <span
                    key={s}
                    onClick={() => setRating(s)}
                    className={s <= rating ? "text-yellow-400" : "text-gray-300"}
                  >
                    ★
                  </span>
                ))}
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border rounded-xl p-3"
              />

              {!review ? (
                <button
                  onClick={handleReviewSubmit}
                  className="w-full bg-green-500 text-white py-2 rounded-xl"
                >
                  Submit Review
                </button>
              ) : !editing ? (
                <>
                  <p>{review.comment}</p>
                  <button
                    onClick={() => setEditing(true)}
                    className="text-blue-500"
                  >
                    Edit
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleReviewUpdate}
                    className="w-full bg-green-500 text-white py-2 rounded-xl"
                  >
                    Update Review
                  </button>
                </>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default OrderDetails;