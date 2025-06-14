import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import Loader from "../pages/common/Loader";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user , loading} = useContext(AuthContext);

  if(loading) return <Loader/>

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (user === null) {
    return <div>Loading...</div>; // Prevent redirect before user loads
  }

  return children;
};


const ProtectedAdmin = ({ children }) => {
  const { isAuthenticated, user, loading } = useContext(AuthContext);

  if (loading) return <Loader />;

  // Not authenticated: redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/admin" />;
  }

  // User loaded, but not admin: redirect to home
  if (user && user.role !== "Admin") {
    return <Navigate to="/" />;
  }

  // If user is still null after loading and authenticated, show loading (prevents redirect loop)
  if (user === null) {
    return <Loader />;
  }

  return children;
};

export { ProtectedRoute ,ProtectedAdmin };