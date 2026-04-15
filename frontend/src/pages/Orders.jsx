import { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// ✅ TOAST
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
    paid: "bg-green-100 text-green-600",
    failed: "bg-red-100 text-red-600",
  };

  return (
    <span className={`px-3 py-1 text-xs rounded-full font-medium ${styles[status]}`}>
      {status}
    </span>
  );
};

// 🔥 Skeleton
const Skeleton = () => (
  <div className="bg-white p-6 rounded-xl animate-pulse space-y-3">
    <div className="h-4 bg-gray-200 w-1/2"></div>
    <div className="h-3 bg-gray-200 w-1/3"></div>
  </div>
);

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  // 🔥 FETCH ORDERS
  const fetchOrders = async () => {
    try {
      setError("");

      const res = await API.get("/orders");
      setOrders(res.data.orders);

    } catch (err) {
      console.error(err);
      setError("Failed to load orders");

      showError("Failed to load orders ❌"); // ✅ toast
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 🎯 ACTION HANDLER
  const handleAction = async (id, type) => {
    const toastId = showLoading("Processing...");

    try {
      setActionLoading(id);

      await API.put(`/orders/${id}/${type}`);

      updateToast(
        toastId,
        `Order ${type} successfully ✅`
      );

      fetchOrders();

    } catch (err) {
      console.error(err);

      updateToast(
        toastId,
        err.response?.data?.message || "Action failed",
        "error"
      );

    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen px-4 md:px-6 py-10">

      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold mb-8">
          Your Orders
        </h1>

        {/* ❌ ERROR */}
        {error && (
          <div className="mb-4 text-red-500 bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* 🔄 LOADING */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} />
            ))}
          </div>
        ) : orders.length === 0 ? (

          /* EMPTY STATE */
          <div className="text-center py-20">
            <p className="text-gray-500 mb-3">No orders yet</p>
            <button
              onClick={() => navigate("/")}
              className="bg-green-500 text-white px-5 py-2 rounded-lg"
            >
              Browse Gigs
            </button>
          </div>

        ) : (
          <div className="space-y-5">

            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl shadow-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 hover:shadow-md transition"
              >

                {/* LEFT */}
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => navigate(`/orders/${order._id}`)}
                >
                  <h2 className="font-semibold text-lg mb-2">
                    {order.gigId?.title}
                  </h2>

                  <p className="text-sm text-gray-500">
                    Order ID: {order._id}
                  </p>

                  <div className="flex flex-wrap gap-3 mt-3">
                    <StatusBadge status={order.status} />
                    <StatusBadge status={order.paymentStatus || "paid"} />
                  </div>
                </div>

                {/* RIGHT */}
                <div className="flex flex-col items-start md:items-end gap-3">

                  <p className="text-xl font-bold text-green-600">
                    ₹{order.price}
                  </p>

                  {/* ACTIONS */}
                  <div className="flex gap-2">

                    {/* SELLER */}
                    {user.role === "seller" && order.status === "pending" && (
                      <button
                        onClick={() => handleAction(order._id, "accept")}
                        disabled={actionLoading === order._id}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50"
                      >
                        Accept
                      </button>
                    )}

                    {/* BUYER */}
                    {user.role === "buyer" && order.status === "accepted" && (
                      <button
                        onClick={() => handleAction(order._id, "complete")}
                        disabled={actionLoading === order._id}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 disabled:opacity-50"
                      >
                        Complete
                      </button>
                    )}

                    {/* CANCEL */}
                    {order.status !== "completed" &&
                      order.status !== "cancelled" && (
                        <button
                          onClick={() => handleAction(order._id, "cancel")}
                          disabled={actionLoading === order._id}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      )}

                  </div>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
};

export default Orders;