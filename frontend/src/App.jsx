import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BookNowPage from "./components/BookNow";
import HomePage from "./components/HomePage";
import BecomeVenueOwnerPage from "./components/RegisterAsVenueOwner";
import VenueDetailsPage from "./components/VenueDeatils";
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="Venues" element={<VenuesPage />} />
          <Route path="How-it-works" element={<HowItWorksPage />} />
          <Route path="Contact" element={<ContactPage />} />
          <Route path="/Login" element={<LoginPage />} />
          <Route path="/SignUp" element={<SignUpPage />} />
        </Route>
        <Route path="/EmailVerification" element={<EmailVerificationPage />} />
        <Route path="/OTPVerification" element={<OTPVerificationPage />} />
        <Route path="/BookNow" element={<BookNowPage />} />
        <Route path="/VenueDetails/:id" element={<VenueDetailsPage />} />
        <Route path="/BecomeVenueOwner" element={<BecomeVenueOwnerPage />} />
        <Route path="/homepage" element={<HomePage />} />

        <Route path="Home" element={<VendorLayout />}>
          <Route index element={<VendorDashboard />} />
          <Route path="add-venue" element={<AddNewVenue />} />
          <Route path="bookings" element={<ManageBookings />} />
          <Route path="help&support" element={<VenueOwnerSupport />} />
          <Route path="settings" element={<SettingsPage/>}/>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
