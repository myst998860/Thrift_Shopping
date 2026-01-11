import React, { useState, useEffect } from "react";
import { MapPin, Calendar, Eye, Download, X, LogIn } from "lucide-react";
import { bookingService } from "../../services/api";
import Header from "./Header";
import "../../styles/UserViewBooking.css";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useUserSession } from "../../context/UserSessionContext";
function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export default function UserViewBookings() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isUserLoggedIn } = useUserSession();
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // ✅ Get userId from JWT
  const token = sessionStorage.getItem("jwtToken");
  const decoded = token ? parseJwt(token) : null;
  const userId = decoded?.userId;

  
  useEffect(() => {
    // Check if user is logged in first
    if (!isUserLoggedIn) {
      setLoading(false);
      return; // Don't try to fetch bookings if not logged in
    }
    
    if (!userId) {
      setError("User ID not found in token");
      setLoading(false);
      return;
    }

    console.log("userId from JWT:", userId);

    const fetchBookings = async () => {
      try {
        const response = await bookingService.getUserBookings(userId);
        // response could be undefined/null if 204 No Content
        if (Array.isArray(response)) {
          setBookings(response);
        } else {
          setBookings([]);  // no bookings case
        }
      } catch (err) {
        setError("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };


    fetchBookings();
  }, [userId, isUserLoggedIn]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "confirmed":
        return "status-badge confirmed";
      case "pending":
        return "status-badge pending";
      case "cancelled":
        return "status-badge cancelled";
      default:
        return "status-badge";
    }
  };

  const formatDate = (dateStr) => {
  if (!dateStr) return "Invalid date";

  const isoDateStr = dateStr.replace(" ", "T");
  const date = new Date(isoDateStr);

  if (isNaN(date)) return "Invalid date";

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatTime = (dateStr) => {
  if (!dateStr) return "Invalid time";

  const isoStr = dateStr.replace(" ", "T");
  const time = new Date(isoStr);

  if (isNaN(time)) return "Invalid time";

  return time.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};
 const handleDelete = async (id) => {
  console.log("Deleting booking id:", id);
  try {
    const response = await bookingService.deleteBooking(id);
    console.log("Delete response:", response);
    setBookings(prev => prev.filter(v => v.bookingId !== id));
    alert("Booking Cancelled Successfully!");
  } catch (err) {
    console.error("Failed to delete:", err);
    alert("Failed to delete booking. Please try again.");
  }
}

  const filteredBookings = Array.isArray(bookings)
  ? bookings.filter((booking) => {
      const bookingDate = new Date(booking.date);
      const now = new Date();

      if (statusFilter && booking.status !== statusFilter) return false;

      if (dateFilter === "upcoming" && bookingDate <= now) return false;
      if (dateFilter === "past" && bookingDate > now) return false;
      if (dateFilter === "this-month") {
        if (
          bookingDate.getMonth() !== now.getMonth() ||
          bookingDate.getFullYear() !== now.getFullYear()
        ) {
          return false;
        }
      }

      return true;
    })
  : [];


  // If user is not logged in, show login button within the bookings page
  const renderLoginButton = () => {
    return (
      <div className="auth-required-container">
        <div className="auth-required-message">
          <LogIn size={48} />
          <h2>Login Required</h2>
          <p>Please log in to view your bookings</p>
          <button 
            className="auth-button primary-button"
            onClick={() => navigate('/login', { state: { from: location.pathname, message: 'Please log in to view your bookings' } })}>
            Login Now
          </button>
        </div>
      </div>
    );
  };
  
  // Show error message if there's an error
  if (error) {
    return (
      <div className="page-container">
        <Header />
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

   const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    console.log("log:",booking);
    setShowBookingDetails(true);
  };

  return (
    <div className="page-container">
      <Header />

      <h1>My Bookings</h1>
      <p>Track and manage your venue reservations</p>

      {!isUserLoggedIn ? (
        // Show login button if user is not logged in
        renderLoginButton()
      ) : (
        // Show bookings content if user is logged in
        <>
          <div className="filter-bar">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
              <option value="">All Dates</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
              <option value="this-month">This Month</option>
            </select>
          </div>

          {loading ? (
            <p>Loading bookings...</p>
          ) : filteredBookings.length === 0 ? (
            <div className="empty-state">
              <Calendar size={48} />
              <h3>No bookings found</h3>
              <p>Try adjusting filters or book a new venue</p>
              <button onClick={() => {
                setStatusFilter("");
                setDateFilter("");
              }}>
                Clear Filters
              </button>
            </div>
          ) : (
    <div className="bookings-grid">
      {filteredBookings.map((booking) => (
        <div className="booking-card custom-booking-card" key={booking.id}>
          <div className="custom-booking-card-content">
            <div className="custom-booking-card-details">
              <div className="custom-booking-card-title">{booking.venueName}</div>
              <div className="custom-booking-card-subtitle">Booking #{booking.bookingId}</div>
              <div className="custom-booking-card-line">{formatDate(booking.bookedTime)} at {formatTime(booking.bookedTime)}</div>
              <div className="custom-booking-card-line">Duration: {booking.duration} hrs</div>
                   <div className="custom-booking-card-line">Location: {booking.venueLocation}</div>
              <div className="custom-booking-card-line">
                Guests: {booking.guests|| "N/A"}
              </div>
              <div className="custom-booking-card-line custom-booking-card-total">
                Total: NPR {booking.amount?.toLocaleString() || "-"}
              </div>
            </div>
            <div className="custom-booking-card-status">
              {booking.status === "confirmed" && (
                <span className="custom-status-pill confirmed">Confirmed</span>
              )}
              {booking.status === "pending" && (
                <span className="custom-status-pill pending">Pending</span>
              )}
              {booking.status === "cancelled" && (
                <span className="custom-status-pill cancelled">Cancelled</span>
              )}
            </div>
          </div>
          <div className="custom-booking-card-actions">
            <button
  className="custom-btn-outline"
 onClick={() => handleDelete(booking.bookingId)}  
>
  Cancel
</button>
            <button
              className="profile-booking-btn"
              onClick={() => {
                handleViewDetails(booking)
                setSelectedBooking(booking)
                setShowBookingDetails(true)
              }}
            >
              View Details
            </button>
          </div>
        </div>
      ))}
    </div>
  )}

  {showBookingDetails && selectedBooking && (
    <div className="venue-modal-overlay" onClick={() => setShowBookingDetails(false)}>
      <div className="venue-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="venue-modal-header">
          <h3>{selectedBooking.eventName}</h3>
          <button className="venue-modal-close" onClick={() => setShowBookingDetails(false)}>
          </button>
        </div>
        <div className="venue-modal-body">
          <div className="profile-booking-details-modal">
            <div className="profile-modal-detail-item">
              <span>Venue:</span>
              <span>{selectedBooking.venueName}</span>
            </div>
            <div className="profile-modal-detail-item">
              <span>Date and Time:</span>
              <span>{formatDate(selectedBooking.bookedTime)}</span>
            </div>
            <div className="profile-modal-detail-item">
              <span>Duration:</span>
              <span>{selectedBooking.duration} hours</span>
            </div>
            <div className="profile-modal-detail-item">
              <span>Guests:</span>
              <span>{selectedBooking.guests}</span>
            </div>
            <div className="profile-modal-detail-item">
              <span>Location:</span>
              <span>{selectedBooking.venueLocation}</span>
            </div>
            <div className="profile-modal-detail-item profile-modal-total">
              <span>Total Amount:</span>
              <span>NPR {selectedBooking.amount?.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="venue-modal-actions">
          <button className="venue-modal-btn-primary" onClick={() => setShowBookingDetails(false)}>
            Close
          </button>
        </div>
      </div>
    </div>
  )}
  </>
  )}
</div>
  );
}
