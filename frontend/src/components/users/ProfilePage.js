"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { userService, bookingService, profileService, orderAPI } from "../../services/api"
import { useUserSession } from "../../context/UserSessionContext"
import Header from "./Header"
import Footer from "./Footer"
import "../../styles/venue-booking.css"
import "../../styles/profile-page.css"
import "../../styles/modern-components.css"

// Map backend order status to high‑level tab category (kept for potential future use)
const getStatusCategory = (status = "") => {
  const s = String(status).toLowerCase();

  if (s.includes("pending") || s.includes("unpaid")) return "To Pay";
  if (s.includes("processing") || s.includes("confirmed") || s.includes("toship"))
    return "To Ship";
  if (s.includes("shipped") || s.includes("out for delivery") || s.includes("toreceive"))
    return "To Receive";
  if (s.includes("delivered") || s.includes("completed")) return "To Review";

  // Cancelled or any other statuses will only show under "All"
  return "All";
};

const getStatusBadgeStyle = (status = "") => {
  const s = String(status).toLowerCase();

  if (s.includes("completed") || s.includes("delivered")) {
    return { backgroundColor: "#e6f4ea", color: "#256029" };
  }
  if (s.includes("cancelled")) {
    return { backgroundColor: "#fdecea", color: "#a4262c" };
  }
  if (s.includes("pending") || s.includes("processing")) {
    return { backgroundColor: "#fff4e5", color: "#8a4b08" };
  }
  if (s.includes("shipped")) {
    return { backgroundColor: "#e5f1ff", color: "#1f4fbf" };
  }

  return { backgroundColor: "#f2f4f7", color: "#344054" };
};

const ProfilePage = () => {
  const { isUserLoggedIn, user, logout } = useUserSession();
  const [userData, setUserData] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);

  // NEW: location modal & value
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [newLocation, setNewLocation] = useState("");
  const [savingLocation, setSavingLocation] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState("personal-info");
  
  // Orders search
  const [orderSearchTerm, setOrderSearchTerm] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Fetch user profile using JWT token
        const userDetails = await profileService.getProfile();
        console.log("User details fetched via token:", userDetails);

        const nameParts = (userDetails.fullname || userDetails.name || "John Doe").split(" ");
        setUserData({
          id: userDetails.id || userDetails.user_id,
          firstName: nameParts[0] || "John",
          lastName: nameParts.slice(1).join(" ") || "Doe",
          name: userDetails.fullname || userDetails.name || "John Doe",
          email: userDetails.email || "example@gmail.com",
          location: userDetails.location || "Kathmandu, Nepal",
          phone: userDetails.phoneNumber || userDetails.phone || "+0123-456-789",
          profileImage: userDetails.profileImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
          joinDate: userDetails.joinDate || "January 2023",
          gender: userDetails.gender || "Female",
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

  // Fetch orders when orders tab is active
  useEffect(() => {
    const fetchOrders = async () => {
      if (activeNavItem !== 'orders') return;
      
      const userId = parseInt(localStorage.getItem("userId"), 10) || userData?.id;
      if (!userId) return;

      setOrdersLoading(true);
      try {
        const data = await orderAPI.getUserOrders(userId);
        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };

    if (activeNavItem === 'orders' && (userData?.id || localStorage.getItem("userId"))) {
      fetchOrders();
    }
  }, [activeNavItem, userData?.id]);

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

  // Handle cancel order
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      await orderAPI.updateOrderStatus(orderId, "Cancelled");
      // Re-fetch orders
      const userId = parseInt(localStorage.getItem("userId"), 10) || userData?.id;
      if (userId) {
        const data = await orderAPI.getUserOrders(userId);
        setOrders(Array.isArray(data) ? data : []);
      }
      alert("Order cancelled successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to cancel the order.");
    }
  };

  // NEW: Update location handler
  const handleUpdateLocation = async () => {
    try {
      if (!newLocation || !newLocation.trim()) {
        alert("Please enter a location.");
        return;
      }
      if (!userData || !userData.id) {
        alert("User ID not available.");
        return;
      }

      setSavingLocation(true);

      // Call userService - adjust method signature if your service expects an object vs string
      // The example assumes userService.updateLocation(userId, location)
      await userService.updateLocation(userData.id, newLocation);

      // Update UI immediately
      setUserData(prev => ({
        ...prev,
        location: newLocation
      }));

      setShowLocationModal(false);
      setNewLocation("");
      alert("Location updated successfully!");
    } catch (err) {
      console.error("Error updating location:", err);
      alert("Failed to update location. Try again.");
    } finally {
      setSavingLocation(false);
    }
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
      <Header isLoggedIn={isUserLoggedIn} user={user} onLogout={logout} hasNotifications={true} />
      
      {/* Page Title and Breadcrumbs */}
      <div className="account-page-header">
        <h1 className="account-page-title">My Account</h1>
        <div className="account-breadcrumb">
          <Link to="/home">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <span>My Account</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="account-main-container">
        {/* Left Sidebar Navigation */}
        <aside className="account-sidebar">
          <nav className="account-nav">
            <button 
              className={`account-nav-item ${activeNavItem === 'personal-info' ? 'active' : ''}`}
              onClick={() => setActiveNavItem('personal-info')}
            >
              Personal Information
            </button>
            <button 
              className={`account-nav-item ${activeNavItem === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveNavItem('orders')}
            >
              My Orders
            </button>
            <button 
              className={`account-nav-item ${activeNavItem === 'address' ? 'active' : ''}`}
              onClick={() => setActiveNavItem('address')}
            >
              Manage Address
            </button>
            <button 
              className={`account-nav-item ${activeNavItem === 'payment' ? 'active' : ''}`}
              onClick={() => setActiveNavItem('payment')}
            >
              Payment Method
            </button>
            <button 
              className={`account-nav-item ${activeNavItem === 'password' ? 'active' : ''}`}
              onClick={() => setActiveNavItem('password')}
            >
              Password Manager
            </button>
            <button 
              className={`account-nav-item ${activeNavItem === 'logout' ? 'active' : ''}`}
              onClick={() => {
                logout();
                window.location.href = '/login';
              }}
            >
              Logout
            </button>
          </nav>
        </aside>

        {/* Right Main Content */}
        <main className="account-content">
          {activeNavItem === 'personal-info' && (
            <div className="personal-info-section">
              {/* Profile Picture */}
              <div className="profile-picture-section">
                <div className="profile-picture-container">
                  <img
                    src={userData.profileImage || "/placeholder.svg"}
                    alt={userData.name}
                    className="account-profile-image"
                  />
                  <button 
                    className="profile-edit-icon"
                    onClick={() => setShowImageUpload(true)}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M11.333 2.667a1.333 1.333 0 0 1 1.884 0l.45.45a1.333 1.333 0 0 1 0 1.884l-7.333 7.333a1.333 1.333 0 0 1-.943.39H2.667a1.333 1.333 0 0 1-1.334-1.333V9.5a1.333 1.333 0 0 1 .39-.943l7.333-7.333zm-8 8v2h2l5.9-5.9-2-2L3.333 10.667zm8.45-6.45l-.45.45-2-2 .45-.45a1.333 1.333 0 0 1 1.884 0l.116.116a1.333 1.333 0 0 1 0 1.884z" fill="white"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <form className="personal-info-form">
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={userData.firstName || ""}
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={userData.lastName || ""}
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    value={userData.email || ""}
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input 
                    type="tel" 
                    className="form-input" 
                    value={userData.phone || ""}
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Gender *</label>
                  <select className="form-select" value={userData.gender || "Female"} disabled>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Location *</label>
                  <div className="location-input-group">
                    <input 
                      type="text" 
                      className="form-input" 
                      value={userData.location || ""}
                      readOnly
                    />
                    <button 
                      type="button"
                      className="location-change-btn"
                      onClick={() => {
                        setNewLocation(userData.location || "");
                        setShowLocationModal(true);
                      }}
                    >
                      Change
                    </button>
                  </div>
                </div>

                <button 
                  type="button"
                  className="update-changes-btn"
                  onClick={() => {
                    setNewLocation(userData.location || "");
                    setShowLocationModal(true);
                  }}
                >
                  Update Changes
                </button>
              </form>
            </div>
          )}

          {activeNavItem === 'orders' && (
            <div className="orders-section">
              <h2 className="section-title">My Orders</h2>
              
              {/* Search */}
              <div className="order-search-container">
                <input
                  type="text"
                  placeholder="Search by product name or order ID"
                  value={orderSearchTerm}
                  onChange={(e) => setOrderSearchTerm(e.target.value)}
                  className="order-search-input"
                />
              </div>

              {/* Orders List */}
              {ordersLoading ? (
                <div className="empty-state">Loading orders...</div>
              ) : (() => {
                // Filter orders by search only
                const filteredOrders = orders.filter((order) => {
                  if (!orderSearchTerm.trim()) return true;
                  const term = orderSearchTerm.toLowerCase();
                  const inId = String(order.orderId).toLowerCase().includes(term);
                  const inItems = (order.items || []).some((item) => {
                    const name = (item.venueName || item.productName || "").toLowerCase();
                    return name.includes(term);
                  });
                  return inId || inItems;
                });

                if (filteredOrders.length === 0) {
                  return (
                    <div className="empty-state">
                      {orders.length === 0 
                        ? <>No orders found. <Link to="/venues">Start shopping!</Link></>
                        : "No orders found for this filter."}
                    </div>
                  );
                }

                return (
                  <div className="orders-list">
                    {filteredOrders.map((order) => {
                      const firstItem = (order.items || [])[0] || {};
                      const sellerName = firstItem.venueName || firstItem.sellerName || "Seller";
                      const badgeStyle = getStatusBadgeStyle(order.status);

                      return (
                        <div key={order.orderId} className="order-item-card">
                          {/* Card header: seller + status badge */}
                          <div className="order-item-header">
                            <div className="order-seller">
                              <span className="order-seller-icon">🛍</span>
                              <span>{sellerName}</span>
                            </div>
                            <span className="order-status-badge" style={badgeStyle}>
                              {order.status}
                            </span>
                          </div>

                          {/* Main content row */}
                          <div className="order-item-content">
                            <img
                              src={
                                firstItem.venueId
                                  ? `/proxy/image?venue_id=${firstItem.venueId}`
                                  : "/placeholder.png"
                              }
                              alt={firstItem.venueName || "Product image"}
                              className="order-item-image"
                            />

                            <div className="order-item-info">
                              <div className="order-item-details">
                                <div className="order-item-name">
                                  {firstItem.venueName || firstItem.productName || "Product"}
                                </div>
                                {firstItem.color && (
                                  <div className="order-item-meta">
                                    Color: {firstItem.color}
                                  </div>
                                )}
                                <div className="order-item-meta">
                                  Qty: {firstItem.quantity}{" "}
                                  {order.items && order.items.length > 1
                                    ? `+ ${order.items.length - 1} more item(s)`
                                    : ""}
                                </div>
                              </div>

                              <div className="order-item-footer">
                                <div className="order-item-price">
                                  NPR {order.totalAmount?.toLocaleString()}
                                </div>
                                <div className="order-item-id">
                                  Order #{order.orderId}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="order-item-actions">
                            {order.status.toLowerCase() !== "cancelled" && (
                              <button
                                onClick={() => handleCancelOrder(order.orderId)}
                                className="cancel-order-btn"
                              >
                                Cancel Order
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {activeNavItem === 'address' && (
            <div className="empty-section">
              <p>Manage Address section coming soon.</p>
            </div>
          )}

          {activeNavItem === 'payment' && (
            <div className="empty-section">
              <p>Payment Method section coming soon.</p>
            </div>
          )}

          {activeNavItem === 'password' && (
            <div className="empty-section">
              <p>Password Manager section coming soon.</p>
            </div>
          )}
        </main>
      </div>

      {/* Feature Highlights */}
      <section className="account-features">
        <div className="feature-card">
          <div className="feature-icon">📦</div>
          <h3 className="feature-title">Free Shipping</h3>
          <p className="feature-description">Free shipping for order above $180</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">💳</div>
          <h3 className="feature-title">Flexible Payment</h3>
          <p className="feature-description">Multiple secure payment options</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🎧</div>
          <h3 className="feature-title">24x7 Support</h3>
          <p className="feature-description">We support online all days.</p>
        </div>
      </section>

      <Footer />

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

      {/* Location Update Modal (NEW) */}
      {showLocationModal && (
        <div className="venue-modal-overlay" onClick={() => { if (!savingLocation) setShowLocationModal(false); }}>
          <div className="venue-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="venue-modal-header">
              <h3>Update Location</h3>
              <button className="venue-modal-close" onClick={() => { if (!savingLocation) setShowLocationModal(false); }}>
                ×
              </button>
            </div>
            <div className="venue-modal-body">
              <p>Enter your new location:</p>
              <input
                type="text"
                className="profile-file-input"
                placeholder="e.g. Kathmandu, Nepal"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "16px",
                  marginTop: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ddd"
                }}
                disabled={savingLocation}
              />
            </div>
            <div className="venue-modal-actions">
              <button 
                className="venue-modal-btn-primary"
                onClick={handleUpdateLocation}
                disabled={savingLocation}
              >
                {savingLocation ? "Saving..." : "Save"}
              </button>
              <button 
                className="venue-modal-btn-secondary"
                onClick={() => { if (!savingLocation) setShowLocationModal(false); }}
                disabled={savingLocation}
              >
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



