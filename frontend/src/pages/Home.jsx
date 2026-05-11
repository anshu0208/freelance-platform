import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import API from "../services/api.js";
import { useNavigate } from "react-router-dom";

import {
  showError,
  showLoading,
  updateToast,
} from "../utils/toast";

// 🔥 Pagination Component
const Pagination = ({ page, pages, onPageChange }) => {
  if (pages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-10">

      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
      >
        Prev
      </button>

      {[...Array(pages).keys()].map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p + 1)}
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
        onClick={() => onPageChange(page + 1)}
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
      >
        Next
      </button>

    </div>
  );
};

// 🔥 Gig Card
const GigCard = ({ gig, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition p-4 cursor-pointer group"
  >
    <div className="h-40 bg-gray-200 rounded-lg mb-4 overflow-hidden">
      {gig.avatar?.url || gig.avatar ? (
  <img
    src={gig.avatar?.url || gig.avatar}
          alt={gig.title}
          className="w-full h-full object-cover group-hover:scale-105 transition"
        />
      ) : (
        <div className="w-full h-full bg-gray-300" />
      )}
    </div>

    <h3 className="font-semibold mb-2 line-clamp-2">
      {gig.title}
    </h3>

    <div className="flex justify-between">
      <span className="text-sm text-gray-500">Starting at</span>
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
  const { user } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [gigs, setGigs] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // 🔥 Redirect seller
  useEffect(() => {
    if (user?.role === "seller") {
      navigate("/seller-dashboard");
    }
  }, [user]);

  // 🔥 Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get("/gigs/categories");
        setCategories(res.data);
      } catch {
        showError("Failed to load categories ❌");
      }
    };
    fetchCategories();
  }, []);

  // 🔥 Fetch gigs (MAIN)
  const fetchGigs = async () => {

    try {
      setLoading(true);
      setError(null);

      const query = `?page=${page}&limit=6${
        search ? `&search=${search}` : ""
      }`;

      const res = await API.get(`/gigs${query}`);

      setGigs(res.data.gigs);
      setPages(res.data.pages);


    } catch (err) {
      setError("Failed to load gigs");
      showError(err.response?.data?.message || "Error");
     
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Trigger fetch
  useEffect(() => {
    fetchGigs();
  }, [page, search]);

  // 🔥 Clear search
  const clearSearch = () => {
    setSearch("");
    setPage(1);
  };

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* HERO */}
      <div className="bg-gradient-to-r from-black to-gray-800 text-white py-20 px-6 text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-6">
          Find the perfect freelance service
        </h1>

        <div className="relative max-w-xl mx-auto bg-white rounded-xl overflow-hidden">
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-3 text-black"
          />

          {search && (
            <button
              onClick={clearSearch}
              className="absolute right-14 top-1/2 -translate-y-1/2"
            >
              ✕
            </button>
          )}

          <button
            onClick={fetchGigs}
            className="absolute right-0 top-0 h-full px-6 bg-green-500 text-white"
          >
            Search
          </button>
        </div>

        {/* CATEGORIES */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          {categories.map((cat, i) => (
            <button
              key={i}
              onClick={() => {
                setSearch(cat);
                setPage(1);
              }}
              className="bg-white/10 px-4 py-2 rounded-full text-sm"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* GIGS */}
      <div className="max-w-7xl mx-auto px-6 py-12">

        <h2 className="text-2xl font-bold mb-6">
          Popular Services
        </h2>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : gigs.length === 0 ? (
          <div className="text-center text-gray-500">
            No gigs found 😕
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
              {gigs.map((gig) => (
                <GigCard
                  key={gig._id}
                  gig={gig}
                  onClick={() => navigate(`/gig/${gig._id}`)}
                />
              ))}
            </div>

            {/* 🔥 PAGINATION */}
            <Pagination
              page={page}
              pages={pages}
              onPageChange={setPage}
            />
          </>
        )}

      </div>
    </div>
  );
};

export default Home;