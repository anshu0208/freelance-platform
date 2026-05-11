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
  const [avatar, setAvatar] = useState(null);
const [coverImage, setCoverImage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categories = [
  "Web Development",
  "Mobile App Development",
  "UI/UX Design",
  "Design",
  "Video Editing",
  "Content Writing",
  "Digital Marketing",
  "SEO",
  "Accounts",
  "Manga",
  "AI Services",
  "Data Entry",
];

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

     const formData = new FormData();

formData.append("title", form.title);
formData.append("description", form.description);
formData.append("price", form.price);
formData.append("deliveryTime", form.deliveryTime);
formData.append("category", form.category);

formData.append("avatar", avatar);

if (coverImage) {
  formData.append("coverImage", coverImage);
}

await API.post("/gigs", formData, {
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

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
  <div className="min-h-screen bg-[#f6f7fb] py-12 px-4 sm:px-6 lg:px-8">

    <div className="max-w-5xl mx-auto">

      {/* HEADER */}
      <div className="mb-10">

        <p className="text-sm font-semibold tracking-[0.2em] uppercase text-green-600">
          Seller Workspace
        </p>

        <h1 className="mt-3 text-5xl font-bold tracking-tight text-gray-900">
          Create New Gig
        </h1>

        <p className="mt-4 text-gray-500 text-lg leading-relaxed max-w-2xl">
          Build a professional service listing to attract
          more clients and showcase your expertise.
        </p>

      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-600 font-medium">
          {error}
        </div>
      )}

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="space-y-8"
      >

        {/* MAIN CARD */}
        <div className="bg-white border border-gray-200 rounded-[32px] shadow-sm p-8 lg:p-10">

          {/* SECTION */}
          <div className="mb-10">

            <h2 className="text-2xl font-bold text-gray-900">
              Gig Information
            </h2>

            <p className="mt-2 text-gray-500">
              Add the core details about your service.
            </p>

          </div>

          <div className="space-y-7">

            {/* TITLE */}
            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Gig Title
              </label>

              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="I will design a modern website UI..."
                className="w-full h-14 px-5 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition"
              />

            </div>

            {/* DESCRIPTION */}
            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={6}
                placeholder="Describe your service, workflow, deliverables, and why clients should choose you..."
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition resize-none"
              />

            </div>

            {/* GRID */}
            <div className="grid md:grid-cols-2 gap-6">

              {/* PRICE */}
              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Starting Price (₹)
                </label>

                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  min="1"
                  placeholder="500"
                  className="w-full h-14 px-5 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition"
                />

              </div>

              {/* DELIVERY */}
              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Delivery Time (Days)
                </label>

                <input
                  type="number"
                  name="deliveryTime"
                  value={form.deliveryTime}
                  onChange={handleChange}
                  min="1"
                  placeholder="3"
                  className="w-full h-14 px-5 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition"
                />

              </div>

            </div>

            {/* CATEGORY */}
            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full h-14 px-5 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition"
              >
                <option value="">
                  Select category
                </option>

                {categories.map((cat) => (
                  <option
                    key={cat}
                  >
                    {cat}
                  </option>
                ))}

              </select>

            </div>

          </div>

        </div>

        {/* MEDIA CARD */}
        <div className="bg-white border border-gray-200 rounded-[32px] shadow-sm p-8 lg:p-10">

          <div className="mb-10">

            <h2 className="text-2xl font-bold text-gray-900">
              Gig Media
            </h2>

            <p className="mt-2 text-gray-500">
              Upload high-quality visuals for better conversions.
            </p>

          </div>

          <div className="grid md:grid-cols-2 gap-8">

            {/* THUMBNAIL */}
            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Thumbnail Image
              </label>

              <div className="border-2 border-dashed border-gray-200 rounded-3xl p-6 bg-gray-50 hover:border-green-400 transition">

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setAvatar(
                      e.target.files[0]
                    )
                  }

                  className="w-full"
                />

                <p className="text-xs text-gray-400 mt-3">
                  Recommended:
                  1280 × 720
                </p>

              </div>

            </div>

            {/* COVER */}
            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Cover Image
              </label>

              <div className="border-2 border-dashed border-gray-200 rounded-3xl p-6 bg-gray-50 hover:border-green-400 transition">

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setCoverImage(
                      e.target.files[0]
                    )
                  }

                  className="w-full"
                />

                <p className="text-xs text-gray-400 mt-3">
                  Optional additional image
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* SUBMIT */}
        <div className="flex justify-end">

          <button
            disabled={loading}

            className="h-14 px-10 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-semibold text-lg shadow-sm hover:shadow-xl transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            {
              loading
                ? "Creating..."
                : "Create Gig"
            }
          </button>

        </div>

      </form>

    </div>
  </div>
);
}

export default CreateGig;