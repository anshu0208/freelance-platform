import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

// ✅ TOAST
import {
  showError,
  showLoading,
  updateToast,
  showSuccess,
} from "../utils/toast";

const Skeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-72 bg-gray-200 rounded-xl"></div>
    <div className="h-6 bg-gray-200 w-1/2 rounded"></div>
    <div className="h-4 bg-gray-200 w-3/4 rounded"></div>
  </div>
);

const GigDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [gig, setGig] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState(null);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const toastId = showLoading("Loading gig...");

      try {
        setError(null);

        const [gigRes, reviewRes, orderRes] = await Promise.all([
          API.get(`/gigs/${id}`),
          API.get(`/reviews/gigs/${id}`),
          API.get(`/orders`),
        ]);

        setGig(gigRes.data);

        const reviewList = reviewRes.data.reviews || [];
        setReviews(reviewList);

        const orders = orderRes.data.orders || orderRes.data;

        const myOrder = orders.find(
          (o) =>
            (o.gigId?._id?.toString() || o.gigId?.toString()) === id &&
            o.status === "completed"
        );

        if (myOrder) {
          setOrderId(myOrder._id);

          const already = reviewList.find(
            (r) => r.orderId?.toString() === myOrder._id.toString()
          );

          if (already) setAlreadyReviewed(true);
        }

        updateToast(toastId, "Gig loaded ✅");

      } catch (err) {
        console.error(err);
        setError("Failed to load gig");

        updateToast(toastId, "Failed to load gig ❌", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, r) => acc + r.rating, 0) /
          reviews.length
        ).toFixed(1)
      : "0";

  // 💳 PAYMENT
  const handlePayment = async () => {
    const toastId = showLoading("Processing payment...");

    try {
      setPaying(true);

      const { data } = await API.post("/payment/create", {
        amount: gig.price,
      });

      const rzp = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: data.amount,
        currency: "INR",
        name: "FreelanceX",
        description: gig.title,
        order_id: data.id,
        handler: async (response) => {
          const res = await API.post("/payment/verify", {
            ...response,
            gigId: gig._id,
          });

          updateToast(toastId, "Payment successful 🎉");

          navigate(`/orders/${res.data.order._id}`);
        },
        modal: {
          ondismiss: () => {
            setPaying(false);
            updateToast(toastId, "Payment cancelled", "error");
          },
        },
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      setPaying(false);
      updateToast(toastId, "Payment failed ❌", "error");
    }
  };

  // ⭐ SUBMIT REVIEW
  const handleSubmit = async () => {
    if (!orderId) return showError("Complete order first");
    if (alreadyReviewed) return showError("Already reviewed");
    if (!rating || !comment.trim()) return showError("Fill all fields");

    const toastId = showLoading("Submitting review...");

    try {
      setSubmitting(true);

      await API.post(`/reviews/orders/${orderId}`, {
        rating,
        comment,
      });

      const res = await API.get(`/reviews/gigs/${id}`);
      setReviews(res.data.reviews);

      setAlreadyReviewed(true);
      setRating(0);
      setComment("");

      updateToast(toastId, "Review submitted ✅");

    } catch (err) {
      updateToast(
        toastId,
        err.response?.data?.message || "Error",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ✏️ START EDIT
  const startEdit = (review) => {
    setEditingId(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  // ✏️ UPDATE REVIEW (🔥 FIXED BUG HERE)
  const handleUpdate = async () => {
    const toastId = showLoading("Updating review...");

    try {
      await API.put(`/reviews/${editingId}`, {
        rating: editRating,
        comment: editComment,
      });

      // ✅ FIXED ENDPOINT (VERY IMPORTANT)
      const res = await API.get(`/reviews/gigs/${id}`);
      setReviews(res.data.reviews);

      setEditingId(null);

      updateToast(toastId, "Review updated ✏️");

    } catch (err) {
      updateToast(toastId, "Update failed", "error");
    }
  };

  if (loading) return <Skeleton />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!gig) return <div>Gig not found</div>;

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-10">

        <div className="lg:col-span-2 space-y-8">

          <img src={gig.image} className="w-full h-[400px] object-cover rounded-2xl" />

          <h1 className="text-3xl font-bold">{gig.title}</h1>

          <div className="bg-white p-4 rounded-xl shadow">
            <p className="font-semibold">{gig.user?.name}</p>
            <p className="text-sm text-gray-500">
              ⭐ {avgRating} · {reviews.length} reviews
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            {gig.description}
          </div>

          {/* REVIEWS */}
          <div className="bg-white p-6 rounded-xl shadow space-y-6">

            <h2 className="font-semibold">Reviews ({reviews.length})</h2>

            {reviews.map((review) => (
              <div key={review._id} className="border-b pb-4">

                <div className="flex justify-between">
                  <p>{review.buyerId?.name}</p>
                  <span className="text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {editingId === review._id ? (
                  <>
                    <div className="flex gap-2 text-xl">
                      {[1,2,3,4,5].map((s) => (
                        <span key={s} onClick={() => setEditRating(s)}>
                          {s <= editRating ? "⭐" : "☆"}
                        </span>
                      ))}
                    </div>

                    <textarea
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      className="w-full border p-2 mt-2 rounded-lg"
                    />

                    <button onClick={handleUpdate} className="text-green-600 text-sm">
                      Save
                    </button>

                    <button onClick={() => setEditingId(null)} className="ml-2 text-gray-500 text-sm">
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <div>
                      {[1,2,3,4,5].map((s) => (
                        <span key={s}>
                          {s <= review.rating ? "⭐" : "☆"}
                        </span>
                      ))}
                    </div>

                    <p>
                      {review.comment}
                      {review.isEdited && (
                        <span className="text-xs text-gray-400 ml-2">(edited)</span>
                      )}
                    </p>

                    <button
                      onClick={() => startEdit(review)}
                      className="text-blue-500 text-xs mt-1"
                    >
                      Edit
                    </button>
                  </>
                )}

              </div>
            ))}

            {/* ADD REVIEW */}
            <div className="pt-4 border-t">

              {!orderId && (
                <p className="text-gray-400 text-sm">
                  Purchase this gig to leave a review
                </p>
              )}

              {alreadyReviewed && (
                <p className="text-green-500 text-sm">
                  ✅ You already reviewed this gig
                </p>
              )}

              {orderId && !alreadyReviewed && (
                <>
                  <h3 className="font-semibold">Add Review</h3>

                  <div className="flex gap-2 text-xl">
                    {[1,2,3,4,5].map((s) => (
                      <span key={s} onClick={() => setRating(s)}>
                        {s <= rating ? "⭐" : "☆"}
                      </span>
                    ))}
                  </div>

                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full border p-2 mt-2 rounded-lg"
                  />

                  <button
                    disabled={submitting}
                    onClick={handleSubmit}
                    className="bg-green-500 text-white px-4 py-2 mt-2 rounded-lg"
                  >
                    {submitting ? "Submitting..." : "Submit"}
                  </button>
                </>
              )}

            </div>

          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-white p-6 rounded-xl shadow h-fit">
          <h2 className="text-2xl font-bold text-green-600">
            ₹{gig.price}
          </h2>

          <button
            onClick={handlePayment}
            className="w-full bg-green-500 text-white py-3 mt-4 rounded-lg hover:bg-green-600 transition"
          >
            Continue
          </button>
        </div>

      </div>
    </div>
  );
};

export default GigDetails;