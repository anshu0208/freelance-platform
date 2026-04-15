import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// ✅ TOAST UTILS
import {
  showError,
  showLoading,
  updateToast,
} from "../utils/toast";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔥 VALIDATION
    if (!form.email || !form.password) {
      return showError("Email and password are required");
    }

    // const toastId = showLoading("Logging in...");
    // setLoading(true);

    try {
      const res = await login(form);

      // ✅ SAFE CHECK
      if (!res || !res.user) {
        throw new Error("Login failed");
      }

      // updateToast(toastId, "Welcome back 👋");

      // 🔥 ROLE BASED REDIRECT (CLEAN)
      const role = res.user.role;

      if (role === "seller") {
        navigate("/seller-dashboard");
      } else {
        navigate("/");
      }

    } catch (err) {
      // showError("Invalid credentials");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:grid md:grid-cols-2">

      {/* LEFT SIDE */}
      <div className="hidden md:flex items-center justify-center bg-black text-white px-8 lg:px-16">
        <div className="max-w-lg">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">
            Freelance<span className="text-green-500">X</span>
          </h1>
          <p className="text-gray-300 text-base lg:text-lg">
            Hire the best freelancers for your projects and grow faster.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="relative flex flex-1 items-center justify-center px-4 sm:px-6 py-10 bg-gradient-to-br from-blue-300 via-blue-50 to-red-300">

        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]"></div>

        <form
          onSubmit={handleSubmit}
          className="relative w-full max-w-md bg-white/90 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-200"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900 text-center sm:text-left">
            Welcome Back 👋
          </h2>

          <p className="text-gray-500 mb-6 text-center sm:text-left text-sm sm:text-base">
            Login to your account
          </p>

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full mb-6 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition"
          />

          <button
            disabled={loading}
            className="w-full bg-black text-white p-3 rounded-lg font-medium hover:bg-gray-800 transition active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-sm text-gray-500 mt-6 text-center">
            Don’t have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-black font-medium cursor-pointer hover:underline"
            >
              Register
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;