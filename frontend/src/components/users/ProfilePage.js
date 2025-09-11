"use client"

import { useState, useEffect } from "react"
import { userService, bookingService, profileService } from "../../services/api"
import "../../styles/venue-booking.css"
import "../../styles/profile-page.css"
import "../../styles/modern-components.css"

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);

  useEffect(() => {
  const fetchUserData = async () => {
    try {
      setLoading(true);

      // Fetch user profile using JWT token
      const userDetails = await profileService.getProfile();
      console.log("User details fetched via token:", userDetails);

      setUserData({
        name: userDetails.fullname || userDetails.name || "John Doe",
        email: userDetails.email || "john.doe@example.com",
        location: userDetails.location || "Kathmandu, Nepal",
        phone: userDetails.phoneNumber || userDetails.phone || "+977 98-12345678",
        profileImage: userDetails.profileImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        joinDate: userDetails.joinDate || "January 2023",
        // Add other userDetails fields as needed
      });

      // Fetch user bookings
      try {
  const userId = userDetails.id || userDetails.user_id; // Adjust based on your backend response
  const bookings = await bookingService.getUserBookings(userId);
  console.log("User bookings fetched:", bookings);

  if (Array.isArray(bookings) && bookings.length > 0) {
    console.log("Raw bookings data from API:", bookings);
  const formattedBookings = bookings.map(b => ({
    id: b.bookingId,
    venue: b.venueName || "Unknown Venue",
    date: b.bookedTime ? b.bookedTime.split("T")[0] : "N/A",
    time: b.bookedTime ? b.bookedTime.split("T")[1]?.substring(0, 5) : "N/A",
    location: b.venueLocation || "N/A",
    status: b.status,
    amount: b.amount || 0,  // If you want amount, add it to DTO and backend
    guests: b.guests,
    duration: b.duration,
    
  }));
console.log("Formatted bookings:", formattedBookings);
console.log('Final bookings for UI:', formattedBookings);
formattedBookings.forEach(b => console.log('Venue:', b.venue));
    setUserBookings(formattedBookings);
  } else {
    console.log("No bookings found for this user.");
    setUserBookings([]); // No bookings
  }

} catch (bookingError) {
  console.error("Could not fetch user bookings:", bookingError);

  // Use fallback/mock data if API fails
  setUserBookings([
    {
      id: 1,
      eventName: "Wedding Reception",
      venue: "Grand Ballroom",
      date: "2024-02-15",
      time: "18:00",
      location: "Kathmandu, Nepal",
      status: "confirmed",
      amount: 75000,
      guests: 150,
      duration: 6,
    },
    {
      id: 2,
      eventName: "Corporate Meeting",
      venue: "Conference Hall A",
      date: "2024-01-28",
      time: "14:00",
      location: "Lalitpur, Nepal",
      status: "confirmed",
      amount: 25000,
      guests: 50,
      duration: 4,
    },
  ]);
}

      setError(null);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Failed to load profile data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  fetchUserData();
}, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const hour = Number.parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isEventPast = (dateString) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate < today;
  };

  const getEventStatus = (booking) => {
    if (booking.status === "completed") return "completed";
    if (isEventPast(booking.date)) return "past";
    return "upcoming";
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("Image selected:", file.name);
      setShowImageUpload(false);
      // TODO: Implement image upload to server
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowBookingDetails(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      upcoming: { text: "Upcoming", class: "profile-status-upcoming" },
      past: { text: "Past Event", class: "profile-status-past" },
      completed: { text: "Completed", class: "profile-status-completed" },
    };

    const config = statusConfig[status] || statusConfig.upcoming;
    return <span className={`profile-status-badge ${config.class}`}>{config.text}</span>;
  };

  // Calculate user stats
  const userStats = {
    totalBookings: userBookings.length,
    upcomingEvents: userBookings.filter(booking => getEventStatus(booking) === "upcoming").length,
    totalSpent: userBookings.reduce((total, booking) => total + (booking.amount || 0), 0),
  };

  // Icons
  const CameraIcon = () => (
    <svg className="profile-camera-icon" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
        clipRule="evenodd"
      />
    </svg>
  );

  const CalendarIcon = () => (
    <svg className="profile-icon" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
        clipRule="evenodd"
      />
    </svg>
  );

  const LocationIcon = () => (
    <svg className="profile-icon" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
        clipRule="evenodd"
      />
    </svg>
  );

  const ClockIcon = () => (
    <svg className="profile-icon" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
        clipRule="evenodd"
      />
    </svg>
  );

  const UsersIcon = () => (
    <svg className="profile-icon" viewBox="0 0 20 20" fill="currentColor">
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
    </svg>
  );

  if (loading) {
    return (
      <div className="profile-page">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          fontSize: '18px',
          color: '#666'
        }}>
          Loading your profile...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          fontSize: '18px',
          color: '#e74c3c',
          textAlign: 'center',
          padding: '20px'
        }}>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#1f2937',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="profile-page">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          fontSize: '18px',
          color: '#666'
        }}>
          No profile data available.
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Header Section */}
      <section className="profile-header">
        <div className="profile-header-content">
          <div className="profile-image-container">
            <img
              src={userData.profileImage || "/placeholder.svg"}
              alt={userData.name}
              className="profile-image"
              onClick={() => setShowImageUpload(true)}
            />
            <button className="profile-image-overlay" onClick={() => setShowImageUpload(true)}>
              <CameraIcon />
            </button>
          </div>

          <div className="profile-info">
            <h1 className="profile-welcome">Welcome, {userData.name}!</h1>
            <div className="profile-details">
              <div className="profile-detail-item">
                <span className="profile-detail-label">Email:</span>
                <span className="profile-detail-value">{userData.email}</span>
              </div>
              <div className="profile-detail-item">
                <span className="profile-detail-label">Location:</span>
                <span className="profile-detail-value">{userData.location}</span>
              </div>
              <div className="profile-detail-item">
                <span className="profile-detail-label">Phone:</span>
                <span className="profile-detail-value">{userData.phone}</span>
              </div>
              <div className="profile-detail-item">
                <span className="profile-detail-label">Member since:</span>
                <span className="profile-detail-value">{userData.joinDate}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="profile-main">
        {/* Stats Section */}
        <section className="profile-stats-section">
          <h2 className="profile-section-title">Your Stats</h2>
          <div className="profile-stats-grid">
            <div className="profile-stat-card">
              <div className="profile-stat-number">{userStats.totalBookings}</div>
              <div className="profile-stat-label">Total Bookings</div>
            </div>
            {/* <div className="profile-stat-card">
              <div className="profile-stat-number">{userStats.upcomingEvents}</div>
              <div className="profile-stat-label">Upcoming Events</div>
            </div> */}
            <div className="profile-stat-card">
              <div className="profile-stat-number">NPR {userStats.totalSpent.toLocaleString()}</div>
              <div className="profile-stat-label">Total Spent</div>
            </div>
          </div>
        </section>

        {/* Bookings Section */}
        <section className="profile-bookings-section">
          <h2 className="profile-section-title">Your Bookings</h2>
          {userBookings.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '50px', 
              color: '#666',
              fontSize: '18px'
            }}>
              No bookings found. <a href="/venues" style={{ color: '#1f2937' }}>Book your first venue!</a>
            </div>
          ) : (
            <div className="profile-bookings-grid">
              {userBookings.map((booking) => {
                const status = getEventStatus(booking);
                const isPast = status === "past" || status === "completed";

                return (
                  <div key={booking.id} className={`profile-booking-card ${isPast ? "profile-booking-past" : ""}`}>
                    <div className="profile-booking-header">
                      <h3 className="profile-booking-title">{booking.venue}</h3>
                      {getStatusBadge(status)}
                    </div>

                    <div className="profile-booking-details">
                      <div className="profile-booking-detail">
                        <CalendarIcon />
                        <span>{formatDate(booking.date)}</span>
                      </div>
                      <div className="profile-booking-detail">
                        <ClockIcon />
                        <span>{formatTime(booking.time)}</span>
                      </div>
                      <div className="profile-booking-detail">
                        <LocationIcon />
                        <span>{booking.location}</span>
                      </div>
                      <div className="profile-booking-detail">
                        <UsersIcon />
                        <span>{booking.guests} guests</span>
                      </div>
                    </div>

                    <div className="profile-booking-footer">
                      <div className="profile-booking-amount">NPR {booking.amount.toLocaleString()}</div>
                      <button className="profile-booking-btn" onClick={() => handleViewDetails(booking)}>
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Image Upload Modal */}
      {showImageUpload && (
        <div className="venue-modal-overlay" onClick={() => setShowImageUpload(false)}>
          <div className="venue-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="venue-modal-header">
              <h3>Update Profile Picture</h3>
              <button className="venue-modal-close" onClick={() => setShowImageUpload(false)}>
                ×
              </button>
            </div>
            <div className="venue-modal-body">
              <p>Choose a new profile picture</p>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="profile-file-input" />
            </div>
            <div className="venue-modal-actions">
              <button className="venue-modal-btn-secondary" onClick={() => setShowImageUpload(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {showBookingDetails && selectedBooking && (
        <div className="venue-modal-overlay" onClick={() => setShowBookingDetails(false)}>
          <div className="venue-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="venue-modal-header">
              <h3>{selectedBooking.eventName}</h3>
              <button className="venue-modal-close" onClick={() => setShowBookingDetails(false)}>
                ×
              </button>
            </div>
            <div className="venue-modal-body">
              <div className="profile-booking-details-modal">
                <div className="profile-modal-detail-item">
                  <span>Venue:</span>
                  <span>{selectedBooking.venue}</span>
                </div>
                <div className="profile-modal-detail-item">
                  <span>Date:</span>
                  <span>{formatDate(selectedBooking.date)}</span>
                </div>
                <div className="profile-modal-detail-item">
                  <span>Time:</span>
                  <span>{formatTime(selectedBooking.time)}</span>
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
                  <span>{selectedBooking.location}</span>
                </div>
                <div className="profile-modal-detail-item profile-modal-total">
                  <span>Total Amount:</span>
                  <span>NPR {selectedBooking.amount.toLocaleString()}</span>
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
    </div>
  )
}

export default ProfilePage