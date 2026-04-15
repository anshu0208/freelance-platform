import { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

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
    paid: "bg-green-100 text-green-600",
    failed: "bg-red-100 text-red-600",
  };

  return (
    <span className={`px-3 py-1 text-xs rounded-full font-medium ${styles[status]}`}>
      {status}
    </span>
  );
};

// 🔥 SKELETON
const Skeleton = () => (
  <div className="bg-white p-6 rounded-xl animate-pulse space-y-3">
    <div className="h-4 bg-gray-200 w-1/2"></div>
    <div className="h-3 bg-gray-200 w-1/3"></div>
  </div>
);

// 🔥 PAGINATION COMPONENT
const Pagination = ({ page, pages, setPage }) => {
  if (pages <= 1) return null;

  return (
    <div className="flex justify-center gap-2 mt-10">

      <button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
      >
        Prev
      </button>

      {[...Array(pages).keys()].map((p) => (
        <button
          key={p}
          onClick={() => setPage(p + 1)}
          className={`px-3 py-1 rounded ${
            page === p + 1
              ? "bg-green-500 text-white"
              : "bg-gray-200"
          }`}
        >
          {p + 1}
        </button>
      ))}

      <button
        disabled={page === pages}
        onClick={() => setPage(page + 1)}
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
      >
        Next
      </button>

    </div>
  );
};

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  // 🔥 PAGINATION STATE
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // 🔥 FETCH ORDERS
  const fetchOrders = async () => {
    try {
      setError("");
      setLoading(true);

      const res = await API.get(`/orders?page=${page}&limit=6`);

      setOrders(res.data.orders);
      setPages(res.data.pages);

    } catch (err) {
      console.error(err);
      setError("Failed to load orders");
      showError("Failed to load orders ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page]);

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

      fetchOrders(); // reload same page

    } catch (err) {
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

        {/* ERROR */}
        {error && (
          <div className="mb-4 text-red-500 bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} />
            ))}
          </div>
        ) : orders.length === 0 ? (

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
          <>
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

                    <div className="flex gap-2 flex-wrap">

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

            {/* 🔥 PAGINATION */}
            <Pagination page={page} pages={pages} setPage={setPage} />

          </>
        )}

      </div>
    </div>
  );
};

export default Orders;