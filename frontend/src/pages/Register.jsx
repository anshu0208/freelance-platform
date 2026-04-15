import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// ✅ TOAST UTILS
import {
  showError,
  showLoading,
  updateToast,
} from "../utils/toast";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
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
    if (!form.username || !form.email || !form.password) {
      return showError("All fields are required");
    }

    if (form.password.length < 6) {
      return showError("Password must be at least 6 characters");
    }

    const toastId = showLoading("Creating account...");

    setLoading(true);

    try {
      await register(form);

      updateToast(toastId, "Account created successfully 🎉");

      navigate("/");
    } catch (err) {
      updateToast(
        toastId,
        err.response?.data?.message || "Registration failed",
        "error"
      );
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
            Join thousands of freelancers and start earning today.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="relative flex flex-1 items-center justify-center px-4 sm:px-6 py-10 bg-gradient-to-br from-blue-300 via-blue-50 to-red-400">

        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]"></div>

        <form
          onSubmit={handleSubmit}
          className="relative w-full max-w-md bg-white/90 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-200"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900 text-center sm:text-left">
            Create Account 🚀
          </h2>

          <p className="text-gray-500 mb-6 text-center sm:text-left text-sm sm:text-base">
            Start your journey today
          </p>

          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition"
          />

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
            {loading ? "Creating..." : "Register"}
          </button>

          <p className="text-sm text-gray-500 mt-6 text-center">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-black font-medium cursor-pointer hover:underline"
            >
              Login
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;