"use client";

  import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
  import { useUserSession } from "./context/UserSessionContext";
  import ProtectedRoute from "./components/auth/ProtectedRoute";

  import LoginPage from "./components/auth/login-page";
  import SignupPage from "./components/auth/signup-page";
  import PartnerSignupPage from "./components/auth/partner-signup-page";
  import ForgotPasswordPage from "./components/auth/forgot-password-page";
  import ResetPasswordPage from "./components/auth/reset-password-page";
  import HomePage from "./components/users/HomePage";
  import AdminPanel from "./components/admin/Adminpanel";
  import Dashboard from "./components/admin/Dashboard";
  import VenueManagement from "./components/admin/VenueManagement";
  import VenuePage from "./components/users/VenuePage";
  import VenueBooking from "./components/users/VenueBooking";
  import VenueAddTest from "./components/admin/VenueAddTest";
  import Header from "./components/users/Header";
  import Footer from "./components/users/Footer";
  import NotificationsPage from "./components/users/notification-page";
  import UserManagement from "./components/admin/UserManagement";
  import AddUsers from "./components/admin/AddUsers";
  import PartnerManagement from "./components/admin/PartnerManagement";
  import ProfilePage from "./components/users/ProfilePage";
  import ContactPage from "./components/users/ContactPage";
  import AboutUs from "./components/users/about-us";
  import Booking from "./components/admin/Booking";
  import Review from "./components/users/review";
  import Notification from "./components/admin/Notification";
  import Profile from "./components/admin/Profile";
  import PartnerAddTest from "./components/admin/PartnerAddTest";
  import EditPartner from "./components/admin/EditPartner";
  import EditVenue from "./components/admin/EditVenue";
  import VenuePopular from "./components/users/VenuePopular";
  import AddCart from "./components/users/AddCart";
  import Donation from "./components/users/Donation";


import UserViewBookings from "./components/users/UserViewBooking";

  import PaymentPage from "./components/users/PaymentPage";


  import "./styles/auth.css";
  import "./App.css";

  import EditUsers from "./components/admin/EditUsers";
  import ViewUser from "./components/admin/ViewUsers";
  import ViewPartner from "./components/admin/ViewPartners";
  import ViewVenue from "./components/admin/ViewVenue";
  import AddBook from "./components/admin/AddBooking";

  import PartnerPanel from "./components/partner/PartnerPanel";
  import PartnerDashboard from "./components/partner/Dashboard";
  import PartnerBooking from "./components/partner/Booking";
  import PartnerAddBooking from "./components/partner/AddBooking";
  import PartnerVenueManagement from "./components/partner/VenueManagement";
  import PartnerVenueAdd from "./components/partner/VenueAdd";
  import PartnerEditVenue from "./components/partner/EditVenue";
  import PartnerViewVenue from "./components/partner/ViewVenue";
  import PartnerNotification from "./components/partner/Notification";
  import PartnerProfile from "./components/partner/Profile";

  import ViewBooking from "./components/admin/ViewBookings";
  import EditBooking from "./components/admin/EditBooking";
  import UserViewVenue from "./components/users/UserViewVenue";



  function App() {
    const { user, isUserLoggedIn, login, logout } = useUserSession();

    return (
      //  <UserSessionProvider>
      <BrowserRouter>
        <div className="app">
          <Routes>
            {/* Admin Panel Routes (Unchanged) */}
            <Route
              path="/Adminpanel"
              element={
                <div className="auth-container">
                  <AdminPanel />
                </div>
              }
            />
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/admin/*" element={<AdminPanel />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="venues" element={<VenueManagement />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="users/new" element={<AddUsers />} />
              <Route path="partners" element={<PartnerManagement />} />
              <Route path="bookings" element={<Booking />} />
              <Route path="notifications" element={<Notification />} />

            <Route path="profile" element={<Profile />} />
            </Route>

            <Route path="/partner/*" element={<PartnerPanel />}>
              <Route path="dashboard" element={<PartnerDashboard />} />
              <Route path="bookings" element={<PartnerBooking />} />
              <Route path="bookings/new" element={<PartnerAddBooking />} />
              <Route path="venues" element={<PartnerVenueManagement />} />
              <Route path="venues/new" element={<PartnerVenueAdd />} />
              <Route path="venues/edit/:id" element={<PartnerEditVenue />} />
              <Route path="venues/:id" element={<PartnerViewVenue />} />
              <Route path="notifications" element={<PartnerNotification />} />
              <Route path="profile" element={<PartnerProfile />} />
            
            </Route>

            {/* User Routes with Session Header/Footer */}
            <Route
              path="/home"
              element={
                <>
                  <Header isLoggedIn={isUserLoggedIn} user={user} onLogout={logout} hasNotifications={true} />
                  <div className="page-content">
                    <HomePage />
                  </div>
                </>
              }
            />

            <Route
              path="/venues"
              element={
                <>
                  <Header isLoggedIn={isUserLoggedIn} user={user} onLogout={logout} hasNotifications={true} />
                  <div className="page-content">
                    <VenuePage />
                  </div>
                </>
              }
            />
            <Route
              path="/popular-venues"
              element={
                <>
                  <Header isLoggedIn={isUserLoggedIn} user={user} onLogout={logout} hasNotifications={true} />
                  <div className="page-content">
                    <VenuePopular />
                  </div>
                </>
              }
            />

            <Route
              path="/review"
              element={
                <>
                  <Header isLoggedIn={isUserLoggedIn} user={user} onLogout={logout} hasNotifications={true} />
                  <div className="page-content">
                    <Review />
                  </div>
                </>
              }
            />

            <Route
              path="/venue-booking"
              element={
                <ProtectedRoute>
                  <>
                    <Header isLoggedIn={isUserLoggedIn} user={user} onLogout={logout} hasNotifications={true} />
                    <div className="page-content">
                      <VenueBooking />
                    </div>
                  </>
                </ProtectedRoute>
              }
            />

            <Route
              path="/venues/:id"
              element={
                <>
                  <Header isLoggedIn={isUserLoggedIn} user={user} onLogout={logout} hasNotifications={true} />
                  <div className="page-content">
                    <UserViewVenue />
                  </div>
                  <Footer />
                </>
              }
            />
            <Route
              path="/bookings/user/:userId"
              element={
                <>
                  <Header isLoggedIn={isUserLoggedIn} user={user} onLogout={logout} hasNotifications={true} />
                  <div className="page-content">
                    <UserViewBookings />
                  </div>
                  <Footer />
                </>
              }
            />

            <Route
              path="/profile/user"
              element={
                <>
                  <Header isLoggedIn={isUserLoggedIn} user={user} onLogout={logout} hasNotifications={true} />
                  <div className="page-content">
                    <ProfilePage />
                  </div>
                </>
              }
            />

            <Route
              path="/contact"
              element={
                <>
                  <Header isLoggedIn={isUserLoggedIn} user={user} onLogout={logout} hasNotifications={true} />
                  <div className="page-content">
                    <ContactPage />
                  </div>
                </>
              }
            />

            <Route
              path="/about"
              element={
                <>
                  <Header isLoggedIn={isUserLoggedIn} user={user} onLogout={logout} hasNotifications={true} />
                  <div className="page-content">
                    <AboutUs />
                  </div>
                </>
              }
            />

            <Route
              path="/notifications"
              element={
                <>
                  <Header isLoggedIn={isUserLoggedIn} user={user} onLogout={logout} hasNotifications={true} />
                  <div className="page-content notifications-page-wrapper">
                    <NotificationsPage />
                  </div>
                  <Footer />
                </>
              }
            />

            <Route
              path="/donate"
              element={
                <>
                  <Header isLoggedIn={isUserLoggedIn} user={user} onLogout={logout} hasNotifications={true} />
                  <div className="page-content">
                    <Donation />
                  </div>
                  <Footer />
                </>
              }
            />

            <Route
              path="/cart"
              element={
                <>
                  <Header isLoggedIn={isUserLoggedIn} user={user} onLogout={logout} hasNotifications={true} />
                  <div className="page-content">
                    <AddCart />
                  </div>
                  <Footer />
                </>
              }
            />

            {/* Admin Management Pages (Unchanged) */}
            <Route path="/admin/venues/add" element={<VenueAddTest />} />
            <Route path="/admin/partners/new" element={<PartnerAddTest />} />
            <Route path="/admin/users/edit/:userId" element={<EditUsers />} />
            <Route path="/admin/partners/edit/:partnerId" element={<EditPartner />} />
            <Route path="/admin/venues/edit/:id" element={<EditVenue />} />
            <Route path="/admin/users/:userId" element={<ViewUser />} />
            <Route path="/admin/partners/:partnerId" element={<ViewPartner />} />
            <Route path="/admin/venues/:id" element={<ViewVenue />} />
            <Route path="/admin/bookings/new" element={<AddBook />} />
          <Route path="/bookings/:bookingId" element={<ViewBooking />} />  
          <Route path="/bookings/edit/:bookingId" element={<EditBooking />} />

            {/* Redundant user route if needed */}
            <Route path="/user/home" element={<HomePage />} />
            

          < Route
              path="/venues/:id"
              element={
                <>
                  <Header isLoggedIn={isUserLoggedIn} user={user} onLogout={logout} hasNotifications={true} />
                  <div className="page-content">
                    <UserViewVenue />
                  </div>
                  <Footer />
                </>
              }
            />


            {/* Authentication Routes */}
            <Route
              path="/login"
              element={
                <div className="auth-container">
                  <LoginPage onLogin={login} />
                </div>
              }
            />

            <Route
              path="/signup"
              element={
                <div className="auth-container">
                  <SignupPage />
                </div>
              }
            />

            <Route
              path="/partner-signup"
              element={
                <div className="auth-container">
                  <PartnerSignupPage />
                </div>
              }
            />

            <Route
              path="/forgot-password"
              element={
                <div className="auth-container">
                  <ForgotPasswordPage />
                </div>
              }
            />

            <Route
              path="/reset-password"
              element={
                <div className="auth-container">
                  <ResetPasswordPage />
                </div>
              }
            />
            <Route path="payment" 
            element={<ProtectedRoute><PaymentPageWrapper /></ProtectedRoute>} />
  
    
          </Routes>
                  
        </div>
      </BrowserRouter>
      // </UserSessionProvider>
    );
  }

  // PaymentPage wrapper to extract bookingData from location state
  function PaymentPageWrapper() {
    const location = useLocation();
    const bookingData = location.state?.bookingData || {};
    const onBack = location.state?.onBack;
    return <PaymentPage bookingData={bookingData} onBack={onBack} />;
  }

  export default App;
