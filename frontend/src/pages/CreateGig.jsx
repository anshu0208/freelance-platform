import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

// ✅ TOAST
import {
  showError,
  showLoading,
  updateToast,
} from "../utils/toast";

const CreateGig = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    deliveryTime: "",
    category: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categories = ["Design", "Development", "Writing", "Marketing"];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.title.trim()) return "Title is required";
    if (!form.description.trim()) return "Description is required";
    if (!form.price || form.price <= 0) return "Enter valid price";
    if (!form.deliveryTime || form.deliveryTime <= 0)
      return "Enter valid delivery time";
    if (!form.category) return "Select a category";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return showError(validationError);
    }

    const toastId = showLoading("Creating gig...");

    try {
      setLoading(true);
      setError("");

      await API.post("/gigs", form);

      updateToast(toastId, "Gig created successfully 🎉");

      navigate("/");

    } catch (err) {
      console.error(err);

      const message =
        err.response?.data?.message || "Failed to create gig";

      setError(message);

      updateToast(toastId, message, "error");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">

      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border">

        <h1 className="text-3xl font-bold mb-2">
          Create a New Gig
        </h1>
        <p className="text-gray-500 mb-6">
          Fill in the details to offer your service
        </p>

        {/* ERROR (still kept 👍) */}
        {error && (
          <div className="mb-4 text-red-500 text-sm bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* TITLE */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Gig Title
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="I will design a modern website..."
              className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe your service..."
              className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          {/* GRID */}
          <div className="grid md:grid-cols-2 gap-4">

            {/* PRICE */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Price (₹)
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                min="1"
                className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            {/* DELIVERY */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Delivery Time (days)
              </label>
              <input
                type="number"
                name="deliveryTime"
                value={form.deliveryTime}
                onChange={handleChange}
                min="1"
                className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

          </div>

          {/* CATEGORY */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Category
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* SUBMIT */}
          <button
            disabled={loading}
            className="w-full bg-green-500 text-white py-3 rounded-xl hover:bg-green-600 transition disabled:opacity-50 active:scale-95"
          >
            {loading ? "Creating..." : "Create Gig"}
          </button>

        </form>

      </div>
    </div>
  );
};

export default CreateGig;