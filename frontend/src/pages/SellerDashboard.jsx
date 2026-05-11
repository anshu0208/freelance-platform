import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // 
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

// TOAST UTILS
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
  <div className="min-h-screen bg-[#f6f7fb] py-12 px-4 sm:px-6 lg:px-8">

    <div className="max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">

        <div>

          <p className="text-sm font-semibold tracking-[0.2em] uppercase text-green-600">
            Seller Analytics
          </p>

          <h1 className="mt-3 text-5xl font-bold tracking-tight text-gray-900">
            Dashboard
          </h1>

          <p className="mt-4 text-gray-500 text-lg max-w-2xl leading-relaxed">
            Track earnings, monitor orders,
            and analyze your freelance business growth.
          </p>

        </div>

        {/* RANGE */}
        <div className="flex items-center gap-3">

          <div className="bg-white border border-gray-200 rounded-2xl p-1 shadow-sm">

            <select
              value={range}
              onChange={(e) =>
                setRange(e.target.value)
              }

              className="bg-transparent px-5 py-3 rounded-xl outline-none text-sm font-medium"
            >
              <option value="7d">
                Last 7 Days
              </option>

              <option value="30d">
                Last 30 Days
              </option>

            </select>

          </div>

        </div>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

        <StatCard
          title="Total Orders"
          value={data.totalOrders}
          subtitle="All orders received"
        />

        <StatCard
          title="Completed"
          value={data.completedOrders}
          subtitle="Successfully delivered"
        />

        <StatCard
          title="Active Orders"
          value={data.activeOrders}
          subtitle="Currently in progress"
        />

        <StatCard
          title="Total Earnings"
          value={`₹${Number(
            data.totalEarnings
          ).toLocaleString("en-IN")}`}

          subtitle="Revenue generated"

          highlight
        />

      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* CHART */}
        <div className="xl:col-span-2 bg-white rounded-[32px] border border-gray-200 shadow-sm p-8">

          <div className="flex items-center justify-between mb-8">

            <div>

              <p className="text-sm font-medium text-green-600">
                Performance
              </p>

              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                Earnings Overview
              </h2>

            </div>

            <div className="text-right">

              <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                Revenue
              </p>

              <h3 className="mt-1 text-3xl font-bold text-green-600">
                ₹{Number(
                  data.totalEarnings
                ).toLocaleString("en-IN")}
              </h3>

            </div>

          </div>

          {data.chartData.length === 0 ? (

            <div className="h-[320px] flex items-center justify-center text-gray-400">
              No earnings data available
            </div>

          ) : (

            <ResponsiveContainer
              width="100%"
              height={340}
            >

              <LineChart
                data={data.chartData}
              >

                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="#e5e7eb"
                />

                <XAxis
                  dataKey="date"
                  stroke="#9ca3af"
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  stroke="#9ca3af"
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: "18px",
                    border:
                      "1px solid #e5e7eb",
                    boxShadow:
                      "0 10px 30px rgba(0,0,0,.08)",
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="earnings"
                  stroke="#22c55e"
                  strokeWidth={4}
                  dot={{
                    r: 5,
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 7,
                  }}
                />

              </LineChart>

            </ResponsiveContainer>
          )}

        </div>

        {/* RECENT ORDERS */}
        <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-8 flex flex-col">

          <div className="flex items-start justify-between mb-8">

            <div>

              <p className="text-sm font-medium text-green-600">
                Orders
              </p>

              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                Recent Orders
              </h2>

            </div>

            <button
              onClick={() =>
                navigate("/orders")
              }

              className="text-sm font-semibold text-green-600 hover:text-green-700 transition"
            >
              View All
            </button>

          </div>

          {data.recentOrders.length === 0 ? (

            <div className="flex-1 flex items-center justify-center text-gray-400">
              No recent orders
            </div>

          ) : (

            <div className="space-y-4">

              {data.recentOrders.map(
                (order) => (

                  <div
                    key={order._id}

                    className="border border-gray-100 rounded-2xl p-5 hover:border-green-200 hover:shadow-md transition-all"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <h3 className="font-semibold text-gray-900">
                          {order.title}
                        </h3>

                        <p className="text-xs text-gray-400 mt-1">
                          Order ID:
                          {" "}
                          {order._id.slice(-6)}
                        </p>

                      </div>

                      <p className="font-bold text-green-600 text-lg whitespace-nowrap">
                        ₹{order.price}
                      </p>

                    </div>

                    <div className="mt-4 flex items-center justify-between">

                      <div
                        className={`
                          text-xs px-3 py-1 rounded-full font-medium capitalize
                          ${
                            order.status ===
                            "completed"
                              ? "bg-green-100 text-green-700"
                              : order.status ===
                                "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-blue-100 text-blue-700"
                          }
                        `}
                      >
                        {order.status}
                      </div>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  </div>
);
};

//  CARD
const StatCard = ({
  title,
  value,
  subtitle,
  highlight,
}) => (
  <div
    className={`
      rounded-[28px]
      p-7
      border
      transition-all
      duration-300
      hover:-translate-y-1
      hover:shadow-xl
      ${
        highlight
          ? "bg-green-500 border-green-500 text-white shadow-green-100"
          : "bg-white border-gray-200 shadow-sm"
      }
    `}
  >

    <p
      className={`
        text-sm
        font-medium
        ${
          highlight
            ? "text-white/80"
            : "text-gray-500"
        }
      `}
    >
      {title}
    </p>

    <h3 className="mt-4 text-4xl font-bold tracking-tight">
      {value}
    </h3>

    <p
      className={`
        mt-3
        text-sm
        ${
          highlight
            ? "text-white/75"
            : "text-gray-400"
        }
      `}
    >
      {subtitle}
    </p>

  </div>
);

export default SellerDashboard;