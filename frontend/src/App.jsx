import { Toaster } from "react-hot-toast";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import GigDetails from "./pages/GigDetails";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import CreateGig from "./pages/CreateGig";
import SellerDashboard from "./pages/SellerDashboard";
import Chat from "./pages/Chat";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./routes/ProtectedRoutes";
import PublicRoute from "./routes/PublicRoute";

// 🔥 Layout wrapper (VERY IMPORTANT)
const Layout = ({ children }) => (
  <>
    <Navbar />
    {children}
  </>
);

const App = () => {
  return (
    <>
   <Toaster
  position="top-right"
  toastOptions={{
    style: {
      borderRadius: "12px",
      padding: "12px 16px",
      fontSize: "14px",
    },
    success: {
      style: {
        background: "#22c55e",
        color: "#fff",
      },
    },
    error: {
      style: {
        background: "#ef4444",
        color: "#fff",
      },
    },
  }}
/>

    <Routes>

      {/* 🌍 PUBLIC ROUTES */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* 🌍 MAIN APP (WITH NAVBAR) */}
      <Route
        path="/"
        element={
          <Layout>
            <Home />
          </Layout>
        }
      />

      <Route
        path="/gig/:id"
        element={
          <Layout>
            <GigDetails />
          </Layout>
        }
      />

      {/* 🔐 PROTECTED ROUTES */}
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Layout>
              <Orders />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <OrderDetails />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Layout>
              <Chat />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/create-gig"
        element={
          <ProtectedRoute>
            <Layout>
              <CreateGig />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/seller-dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <SellerDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

    </Routes>
    </>
  );
};

export default App;