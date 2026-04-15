import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  showError,
  showLoading,
  updateToast,
} from "../utils/toast";

const MyGigs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchGigs = async () => {
  try {
    setLoading(true);
    setError("");

    const res = await API.get("/gigs/my-gigs");

    console.log("FULL RESPONSE:", res.data);

    // 🔥 HANDLE BOTH CASES
    const gigsData = res.data.gigs || res.data;

    setGigs(Array.isArray(gigsData) ? gigsData : []);

  } catch (err) {
    console.error(err);
    setError("Failed to load gigs");
    showError("Failed to load gigs");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (!user) return;

    if (user.role !== "seller") {
      navigate("/");
      return;
    }

    fetchGigs();
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this gig?")) return;

    const toastId = showLoading("Deleting...");

    try {
      await API.delete(`/gigs/${id}`);
      setGigs((prev) => prev.filter((g) => g._id !== id));
      updateToast(toastId, "Deleted");
    } catch (err) {
      updateToast(toastId, "Delete failed", "error");
    }
  };

  // 🔥 LOADING
  if (loading) {
    return (
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-40 bg-gray-200 rounded-xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">My Gigs</h1>
          <p className="text-gray-500 text-sm sm:text-base">
            Manage your services 🚀
          </p>
        </div>

        <button
          onClick={() => navigate("/create-gig")}
          className="bg-green-500 w-full sm:w-auto text-white px-5 py-2 rounded-lg"
        >
          + Create Gig
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="text-center py-10">
          <p className="text-red-500">{error}</p>
          <button
            onClick={fetchGigs}
            className="mt-3 bg-black text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      )}

      {/* EMPTY */}
      {!error && gigs.length === 0 && (
        <div className="text-center py-16">
          <h2 className="text-lg font-semibold">No gigs yet 😔</h2>
          <p className="text-gray-500 mb-4">
            Start by creating your first gig
          </p>
          <button
            onClick={() => navigate("/create-gig")}
            className="bg-black text-white px-5 py-2 rounded-lg"
          >
            Create Gig
          </button>
        </div>
      )}

      {/* GRID */}
      {!error && gigs.length > 0 && (
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

  {gigs.map((gig) => (
    <div
      key={gig._id}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden"
    >

      {/* IMAGE PLACEHOLDER */}
      <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400 text-sm">
        No Preview
      </div>

      {/* CONTENT */}
      <div className="p-5">

        {/* TITLE */}
        <h2 className="font-semibold text-lg leading-snug line-clamp-2 group-hover:text-green-600 transition">
          {gig.title}
        </h2>

        {/* DESC */}
        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
          {gig.description}
        </p>

        {/* PRICE + CATEGORY */}
        <div className="mt-4 flex justify-between items-center">
          <span className="text-xl font-bold text-green-600">
            ₹{gig.price}
          </span>

          <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">
            {gig.category}
          </span>
        </div>

      </div>

      {/* ACTION BAR */}
      <div className="px-5 py-3 border-t bg-gray-50 flex justify-between items-center">

        <button
          onClick={() => navigate(`/gig/${gig._id}`)}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          View
        </button>

        <div className="flex gap-2">

          <button
            onClick={() => navigate(`/edit-gig/${gig._id}`)}
            className="px-3 py-1.5 text-sm rounded-lg bg-gray-200 hover:bg-gray-300 transition"
          >
            Edit
          </button>

          <button
            onClick={() => handleDelete(gig._id)}
            className="px-3 py-1.5 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
          >
            Delete
          </button>

        </div>

      </div>
    </div>
  ))}

</div>
      )}
    </div>
  );
};

export default MyGigs;