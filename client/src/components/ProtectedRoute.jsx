import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const homeFor = (role) => (role === "ADMIN" ? "/admin" : "/tenant");

export default function ProtectedRoute({ children, allow = [] }) {
  const { user, loading } = useAuth();

  if (loading) return null; // or spinner
  if (!user) return <Navigate to="/login" replace />;

  // If route requires certain roles and the user doesn't match, redirect to their home
  if (allow.length > 0 && !allow.includes(user.role)) {
    return <Navigate to={homeFor(user.role)} replace />;
  }

  return children;
}
