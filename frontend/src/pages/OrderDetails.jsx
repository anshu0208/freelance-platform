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

// 🎨 Status Badge
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
  const [error, setError] = useState("");

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
      } catch (err) {
        setError("Failed to load order");
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
      } catch (err) {
        console.log("Review fetch failed");
      }
    };

    fetchReview();
  }, [order]);

  // 🔥 SOCKET CONNECT
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
      try {
        const res = await API.post("/conversations", {
          orderId: id,
          buyerId: order.buyerId._id || order.buyerId,
          sellerId: order.sellerId._id || order.sellerId,
        });

        setConversationId(res.data._id);
      } catch (err) {
        console.error(err);
      }
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
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  // 🔥 ORDER ACTION
  const updateOrder = async (type) => {
    try {
      await API.put(`/orders/${id}/${type}`);
      const res = await API.get(`/orders/${id}`);
      setOrder(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const isMine = (msg) =>
    msg.senderId === user._id || msg.senderId?._id === user._id;

  // ⭐ SUBMIT REVIEW
  const handleReviewSubmit = async () => {
    try {
      if (!rating || !comment.trim()) {
      return showError("Fill all fields");
      }

          const toastId = showLoading("Submitting review...");
      setSubmittingReview(true);

      await API.post(`/reviews/orders/${order._id}`, {
        rating,
        comment,
      });
       updateToast(toastId, "Review submitted ✅");


      const res = await API.get(`/reviews/gigs/${order.gigId._id}`);

      const found = res.data.reviews.find(
        (r) => r.orderId?.toString() === order._id.toString()
      );
 
      setReview(found);
      setEditing(false);
    } catch (err) {
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
      setSubmittingReview(true);

      await API.put(`/reviews/${review._id}`, {
        rating,
        comment,
      });

       updateToast(toastId, "Review updated ✅");

      setReview((prev) => ({
        ...prev,
        rating,
        comment,
        isEdited: true,
      }));
      setEditing(false);

    } catch (err) {
      updateToast(toastId, "Update failed", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;
  if (!order) return <div className="p-10 text-center">Order not found</div>;

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4 md:px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">

        {/* LEFT */}
        <div className="md:col-span-2 space-y-6">

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h1 className="text-xl font-semibold">
              {order.gigId?.title}
            </h1>
            <p className="text-gray-500 text-sm">
              Order ID: {order._id}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm flex gap-3">
            <StatusBadge status={order.status} />
            <StatusBadge status={order.paymentStatus || "paid"} />
          </div>

          {/* CHAT */}
          <div className="bg-white rounded-2xl shadow-sm flex flex-col h-[500px]">

            <div className="p-4 border-b font-semibold">Chat</div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">

              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${isMine(msg) ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-2xl text-sm shadow
                      ${isMine(msg)
                        ? "bg-green-500 text-white rounded-br-none"
                        : "bg-gray-100 text-gray-800 rounded-bl-none"}`}
                  >
                    <p>{msg.content}</p>
                    <p className="text-[10px] opacity-70 mt-1 text-right">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}

              <div ref={bottomRef}></div>
            </div>

            <div className="p-3 border-t flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex-1 border rounded-full px-4 py-2"
              />
              <button onClick={handleSend} className="bg-green-500 text-white px-5 rounded-full">
                Send
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT */}
        <div className="space-y-6">

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-green-600">
              ₹{order.price}
            </h2>
          </div>

          {/* ⭐ REVIEW */}
          {user.role === "buyer" && order.status === "completed" && (
           <div className="bg-white p-6 rounded-2xl shadow-md space-y-5">

  <h3 className="text-lg font-semibold">Your Review</h3>

  {/* ⭐ STARS */}
  <div className="flex gap-2 text-2xl cursor-pointer">
    {[1,2,3,4,5].map((s) => (
      <span
        key={s}
        onClick={() => setRating(s)}
        className={`transition ${
          s <= rating ? "text-yellow-400 scale-110" : "text-gray-300"
        }`}
      >
        ★
      </span>
    ))}
  </div>

  {/* ✍️ TEXTAREA */}
  <textarea
    value={comment}
    onChange={(e) => setComment(e.target.value)}
    placeholder="Share your experience with this seller..."
    className="w-full h-32 border border-gray-300 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
  />

  {/* 🔘 BUTTON */}
  {!review && (
    <button
      onClick={handleReviewSubmit}
      className="w-full bg-green-500 hover:bg-green-600 transition text-white py-2.5 rounded-xl font-medium"
    >
      Submit Review
    </button>
  )}

  {/* ✏️ EDIT VIEW */}
  {review && !editing && (
    <div className="space-y-3">

      <div className="flex text-xl text-yellow-400">
        {[...Array(review.rating)].map((_, i) => (
          <span key={i}>★</span>
        ))}
      </div>

      <p className="text-gray-700 text-sm leading-relaxed">
        {review.comment}
        {review.isEdited && (
          <span className="text-xs text-gray-400 ml-2">(edited)</span>
        )}
      </p>

      <button
        onClick={() => setEditing(true)}
        className="text-blue-500 text-sm font-medium"
      >
        Edit Review
      </button>
    </div>
  )}

  {/* 🔄 EDIT MODE */}
  {editing && (
    <>
      <button
        onClick={handleReviewUpdate}
        className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl"
      >
        Update Review
      </button>

      <button
        onClick={() => setEditing(false)}
        className="w-full text-gray-500 text-sm"
      >
        Cancel
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