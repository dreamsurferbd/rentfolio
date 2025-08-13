// src/App.jsx
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AuthProvider from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

// Toast bridge
import { useToast } from "./components/Toaster";
import { setToast } from "./api/http";

// Public pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Admin pages
import AdminDashboard from "./pages/Admin/Dashboard";
import Properties from "./pages/Admin/Properties";
import Units from "./pages/Admin/Units";
import Agreements from "./pages/Admin/Agreements";
import Invoices from "./pages/Admin/Invoices";
import Notices from "./pages/Admin/Notices";
import TenantRequests from "./pages/Admin/TenantRequests";

// Tenant pages
import TenantDashboard from "./pages/TenantDashboard";

function AppRoutes() {
  const { notify } = useToast();
  useEffect(() => {
    setToast(notify);
  }, [notify]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Shared layout */}
        <Route element={<Layout />}>
          {/* Public */}
          <Route
            path="/"
            element={
              <div>
                <h2>Welcome</h2>
                <p>Use the sidebar to navigate.</p>
              </div>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allow={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/properties"
            element={
              <ProtectedRoute allow={["ADMIN"]}>
                <Properties />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/units"
            element={
              <ProtectedRoute allow={["ADMIN"]}>
                <Units />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/agreements"
            element={
              <ProtectedRoute allow={["ADMIN"]}>
                <Agreements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/invoices"
            element={
              <ProtectedRoute allow={["ADMIN"]}>
                <Invoices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/notices"
            element={
              <ProtectedRoute allow={["ADMIN"]}>
                <Notices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tenant-requests"
            element={
              <ProtectedRoute allow={["ADMIN"]}>
                <TenantRequests />
              </ProtectedRoute>
            }
          />

          {/* Tenant */}
          <Route
            path="/tenant"
            element={
              <ProtectedRoute allow={["TENANT"]}>
                <TenantDashboard />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route
            path="*"
            element={
              <div>
                <h2>Page not found</h2>
                <p>The page you’re looking for doesn’t exist.</p>
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
