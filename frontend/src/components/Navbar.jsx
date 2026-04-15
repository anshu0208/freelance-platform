import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useState } from "react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // ❌ Hide on auth pages
  if (["/login", "/register"].includes(location.pathname)) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname === path
      ? "text-green-600 font-semibold"
      : "text-gray-700 hover:text-black";

  return (
    <div className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* 🔥 LOGO */}
        <h1
          onClick={() => navigate("/")}
          className="text-2xl font-bold text-gray-900 cursor-pointer"
        >
          Freelance<span className="text-green-500">X</span>
        </h1>

        {/* 🔥 RIGHT SIDE */}
        <div className="flex items-center gap-6">

          {!user ? (
            <>
              <button
                onClick={() => navigate("/login")}
                className="text-gray-700 hover:text-black font-medium transition"
              >
                Login
              </button>

              <button
                onClick={() => navigate("/register")}
                className="bg-black text-white px-5 py-2 rounded-full hover:bg-gray-800 transition"
              >
                Join
              </button>
            </>
          ) : (
            <>
              {/* 🔥 BUYER HOME (NEW) */}
              {user.role === "buyer" && (
                <Link to="/" className={`text-sm ${isActive("/")}`}>
                  Home
                </Link>
              )}

              {/* 🔥 COMMON LINKS */}
              <Link to="/orders" className={`text-sm ${isActive("/orders")}`}>
                {user.role === "buyer" ? "My Orders" : "Orders"}
              </Link>

              <Link to="/chat" className={`text-sm ${isActive("/chat")}`}>
                Messages
              </Link>

              {/* 🔥 SELLER LINKS */}
              {user.role === "seller" && (
                <>
                  <Link
                    to="/seller-dashboard"
                    className={`text-sm ${isActive("/seller-dashboard")}`}
                  >
                    Dashboard
                  </Link>

                  <Link
                    to="/my-gigs"
                    className={`text-sm ${isActive("/my-gigs")}`}
                  >
                    My Gigs
                  </Link>

                  <Link
                    to="/create-gig"
                    className={`text-sm ${isActive("/create-gig")}`}
                  >
                    Create Gig
                  </Link>
                </>
              )}

              {/* 🔥 USER DROPDOWN */}
              <div className="relative">

                <div
                  onClick={() => setOpen(!open)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-semibold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>

                  <span className="font-medium text-gray-800 hidden sm:block">
                    {user.name}
                  </span>
                </div>

                {/* DROPDOWN */}
                {open && (
                  <div className="absolute right-0 mt-3 w-48 bg-white shadow-lg rounded-xl border overflow-hidden">

                    <Link
                      to="/profile"
                      className="block px-4 py-2 hover:bg-gray-100 text-sm"
                      onClick={() => setOpen(false)}
                    >
                      Profile
                    </Link>

                    <Link
                      to="/orders"
                      className="block px-4 py-2 hover:bg-gray-100 text-sm"
                      onClick={() => setOpen(false)}
                    >
                      {user.role === "buyer"
                        ? "My Orders"
                        : "Orders Received"}
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-500"
                    >
                      Logout
                    </button>

                  </div>
                )}

              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default Navbar;