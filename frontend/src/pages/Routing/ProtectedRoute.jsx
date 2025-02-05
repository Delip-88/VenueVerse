import { Navigate } from "react-router-dom";

const isVenueOwner = () => {
  // Example logic: Check role from state or localStorage
  return localStorage.getItem("role") === "venueOwner";
};

const ProtectedRoute = ({ children }) => {
  if (!isVenueOwner()) {
    return <Navigate to="/home" replace />; // Redirect non-owners to /home
  }
  return children;
};

export default ProtectedRoute



// Routing Setup
{/* <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
<Route path="/home" element={isVenueOwner() ? <Navigate to="/dashboard" replace /> : <UserHome />} /> */}
