import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ FIX
import API from "../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// ✅ TOAST UTILS
import {
  showError,
  showLoading,
  updateToast,
} from "../utils/toast";

const SellerDashboard = () => {
  const [data, setData] = useState(null);
  const [range, setRange] = useState("7d");
  const [error, setError] = useState(null);

  const navigate = useNavigate(); // ✅ FIX

  useEffect(() => {
    const fetchDashboard = async () => {

      try {
        setError(null);

        const res = await API.get(
          `/orders/seller-dashboard?range=${range}`
        );

        setData(res.data);


      } catch (err) {
        setError("Failed to load dashboard");
      showError(err.response?.data?.message || "Failed to load dashboard");  
      }
    };

    fetchDashboard();
  }, [range]);

  // 🔥 LOADING UI
  if (!data && !error) {
    return (
      <div className="min-h-screen bg-gray-50 p-10">
        <div className="max-w-6xl mx-auto animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-300 rounded"></div>
          <div className="grid md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ❌ ERROR UI
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Seller Dashboard</h1>
            <p className="text-gray-500">Track your growth 🚀</p>
          </div>

          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="border px-4 py-2 rounded-lg bg-white shadow-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card title="Orders" value={data.totalOrders} />
          <Card title="Completed" value={data.completedOrders} />
          <Card title="Active" value={data.activeOrders} />
          <Card
            title="Earnings"
            value={`₹${data.totalEarnings}`}
            highlight
          />
        </div>

        {/* CHART */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="font-semibold mb-4">
            Earnings Overview
          </h2>

          {data.chartData.length === 0 ? (
            <p className="text-gray-400 text-center py-10">
              No earnings data available
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="earnings"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* RECENT ORDERS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">

          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">
              Recent Orders (Last 5)
            </h2>

            <button
              onClick={() => navigate("/orders")}
              className="text-green-600 text-sm hover:underline"
            >
              View All
            </button>
          </div>

          {data.recentOrders.length === 0 ? (
            <p className="text-gray-400">No recent orders</p>
          ) : (
            <div className="space-y-4">
              {data.recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex justify-between items-center border-b pb-3 hover:bg-gray-50 px-2 rounded-lg transition"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      {order.title}
                    </p>

                    <p className="text-xs text-gray-400">
                      Order ID: {order._id.slice(-6)}
                    </p>

                    <p
                      className={`text-xs mt-1 ${
                        order.status === "completed"
                          ? "text-green-500"
                          : order.status === "pending"
                          ? "text-yellow-500"
                          : "text-blue-500"
                      }`}
                    >
                      {order.status}
                    </p>
                  </div>

                  <p className="font-semibold text-green-600">
                    ₹{order.price}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

// 🔥 CARD
const Card = ({ title, value, highlight }) => (
  <div
    className={`p-6 rounded-2xl shadow-sm transition hover:shadow-md ${
      highlight ? "bg-green-500 text-white" : "bg-white"
    }`}
  >
    <p
      className={`text-sm ${
        highlight ? "opacity-80" : "text-gray-500"
      }`}
    >
      {title}
    </p>

    <p className="text-2xl font-bold mt-2">{value}</p>
  </div>
);

export default SellerDashboard;