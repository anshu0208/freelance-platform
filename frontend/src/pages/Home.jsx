import { useState, useEffect } from "react";
import API from "../services/api.js";
import { useNavigate } from "react-router-dom";

// ✅ TOAST
import {
  showError,
  showLoading,
  updateToast,
} from "../utils/toast";

// 🔥 Reusable Gig Card
const GigCard = ({ gig, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-4 cursor-pointer group"
  >
    <div className="h-40 bg-gray-200 rounded-lg mb-4 overflow-hidden">
      {gig.image ? (
        <img
          src={gig.image}
          alt={gig.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
      ) : (
        <div className="w-full h-full bg-gray-300" />
      )}
    </div>

    <h3 className="font-semibold mb-2 line-clamp-2 text-gray-800">
      {gig.title}
    </h3>

    <div className="flex justify-between items-center">
      <span className="text-gray-500 text-sm">Starting at</span>
      <span className="font-bold text-green-600">₹{gig.price}</span>
    </div>
  </div>
);

// 🔥 Skeleton
const SkeletonCard = () => (
  <div className="bg-white p-4 rounded-xl animate-pulse">
    <div className="h-40 bg-gray-200 rounded mb-4"></div>
    <div className="h-4 bg-gray-200 mb-2 rounded"></div>
    <div className="h-4 bg-gray-200 w-1/2 rounded"></div>
  </div>
);

const Home = () => {
  const [search, setSearch] = useState("");
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // 🔥 Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get("/gigs/categories");
        setCategories(res.data);
      } catch (err) {
        console.error(err);
        showError("Failed to load categories ❌"); // ✅ toast
      }
    };
    fetchCategories();
  }, []);

  // 🔥 Fetch Gigs
  const fetchGigs = async (query = "") => {

    try {
      setLoading(true);
      setError(null);

      const res = await API.get(`/gigs${query}`);
      setGigs(res.data.gigs || res.data);


    } catch (err) {
      console.error(err);
      setError("Failed to load gigs");

      updateToast(
        toastId,
        err.response?.data?.message || "Failed to load gigs",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ Initial load
  useEffect(() => {
    fetchGigs();
  }, []);

  // 🔥 Debounced Search
  useEffect(() => {
    const delay = setTimeout(() => {
      if (search.trim()) {
        fetchGigs(`?search=${search}`);
      } else {
        fetchGigs();
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [search]);

  // ❌ Clear search
  const clearSearch = () => {
    setSearch("");
    fetchGigs();
  };

  // ⌨️ ESC clear
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      clearSearch();
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* HERO */}
      <div className="bg-gradient-to-r from-black to-gray-800 text-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">

          <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Find the perfect freelance service
          </h1>

          <p className="text-gray-300 mb-8 text-lg">
            Work with top freelancers globally
          </p>

          {/* SEARCH */}
          <div className="relative w-full max-w-2xl mx-auto bg-white rounded-2xl overflow-hidden shadow-lg">

            <input
              type="text"
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-3 pr-24 text-black outline-none"
            />

            {search && (
              <button
                onClick={clearSearch}
                className="absolute right-20 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
              >
                ✕
              </button>
            )}

            <button
              onClick={() => fetchGigs(`?search=${search}`)}
              className="absolute right-0 top-0 h-full px-6 bg-green-500 text-white hover:bg-green-600"
            >
              Search
            </button>

          </div>

          {/* CATEGORIES */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {categories.map((cat, i) => (
              <button
                key={i}
                onClick={() => fetchGigs(`?category=${cat}`)}
                className="bg-white/10 px-4 py-2 rounded-full text-sm hover:bg-white/20 transition"
              >
                {cat}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* GIG SECTION */}
      <div className="max-w-6xl mx-auto px-6 py-12">

        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Popular Services
        </h2>

        {error ? (
          <div className="text-center text-red-500 py-10">{error}</div>
        ) : loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : gigs.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No gigs found 😕
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {gigs.map((gig) => (
              <GigCard
                key={gig._id}
                gig={gig}
                onClick={() => navigate(`/gig/${gig._id}`)}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Home;