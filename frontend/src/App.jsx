import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BookNowPage from "./components/BookNow";
import BecomeVenueOwnerPage from "./components/RegisterAsVenueOwner";
import VenueDetailsPage from "./pages/common/VenueDeatils";
import ManageBookings from "./components/VenueOwner/ManageBooking";
import AddNewVenue from "./components/VenueOwner/NewVenue";
import LoginPage from "./pages/Auth/Login";
import SignUpPage from "./pages/Auth/SignUp";
import OTPVerificationPage from "./pages/Auth/Verification";
import ContactPage from "./pages/Home/Contact";
import HowItWorksPage from "./pages/Home/How_it_works";
import LandingPage from "./pages/Home/Landing_page";
import VenuesPage from "./pages/Home/Venues";
import Layout from "./components/Layout/Layout";
import EmailVerificationPage from "./pages/Auth/EmailVerify";
import VendorLayout from "./components/Layout/Vendor_Layout";
import VendorDashboard from "./components/VenueOwner/VendorDashboard";
import VenueOwnerSupport from "./components/VenueOwner/Help&Support";
import SettingsPage from "./components/VenueOwner/settings";
import User_Layout from "./components/Layout/User_Layout";
import MyBookingsPage from "./components/User/MyBookings";
import FavoritesPage from "./components/User/Favourites";
import UserSettingsPage from "./components/User/UserSettings";
import NotFound from "./pages/common/NotFound";
import  { ProtectedAdmin, ProtectedRoute } from "./middleware/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import PaymentFailed from "./components/PaymentFailed";
import PaymentSuccess from "./components/PaymentSuccess";
import MyVenues from "./components/VenueOwner/MyVenues";
import EditVenue from "./components/VenueOwner/EditVenue";
import VenueDetails from "./components/VenueOwner/VenueDetails";
import ResetPassword from "./pages/Auth/ResetPassword";
import VenueFinderWizard from "./components/VenueOwner/VenueFinderWizard";
import SuperAdminLayout from "./components/Layout/Admin_Layout";
import ReportsPage from "./components/admin/Reports";
import BookingReportDemo from "./pages/common/Demo";
import BookingReport from "./pages/common/Report";
import AdminRoleRequests from "./components/admin/RoleRequest";
import AdminUsers from "./components/admin/Users";
import AdminServices from "./components/admin/Services";
import AdminLogin from "./components/admin/Login";
import AddCategoriesPage from "./components/admin/Categories";
function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="Venues" element={<VenuesPage />} />
          <Route path="How-it-works" element={<HowItWorksPage />} />
          <Route path="Contact" element={<ContactPage />} />
          <Route path="Login" element={<LoginPage />} />
          <Route path="SignUp" element={<SignUpPage />} />
          <Route path="venuewizard" element={<VenueFinderWizard />} />
        </Route>

        <Route path="venue/:id" element={<VenueDetailsPage />} />

        {/* Email Verification Routes */}
        <Route path="/forgot-password" element={<EmailVerificationPage />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/OTPVerification" element={<OTPVerificationPage />} />
        <Route path="/booking-report/:id" element={<BookingReport />} />

        {/* Authenticated User Routes */}
        <Route
          path="/Home"
          element={
            <ProtectedRoute>
              <User_Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<VenuesPage />} />
          <Route path="my-bookings" element={<MyBookingsPage />} />
          <Route path="booking-report" element={<BookingReportDemo />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="settings" element={<UserSettingsPage />} />
          <Route path="venue/:venueId/book-now" element={<BookNowPage />} />
          <Route path="BecomeVenueOwner" element={<BecomeVenueOwnerPage />} />
          <Route path="venue/payment-success" element={<PaymentSuccess />} />
          <Route path="venue/payment-failure" element={<PaymentFailed />} />
        </Route>

        {/* Protected Vendor (VenueOwner) Routes */}
        <Route
          path="/Dashboard"
          element={
            <ProtectedRoute>
              <VendorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<VendorDashboard />} />

          <Route path="dashboard" element={<VendorDashboard />} />
          <Route path="add-venue" element={<AddNewVenue />} />
          <Route path="bookings" element={<ManageBookings />} />
          <Route path="help&support" element={<VenueOwnerSupport />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="my-venues" element={<MyVenues />} />
          <Route path="edit-venue/:id" element={<EditVenue />} />
          <Route path="my-venues/:id" element={<VenueDetails />} />
        </Route>
        {/* Admin Route */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/super-admin"
          element={
            <ProtectedAdmin>
              <SuperAdminLayout />
            </ProtectedAdmin>
          }
        >
          <Route index element={<ReportsPage />} />
          <Route path="update-role" element={<AdminRoleRequests />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="venues" element={<VenuesPage />} />
          <Route path="addServices" element={<AdminServices />} />
          <Route path="addCategories" element={<AddCategoriesPage />} />
        </Route>

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
