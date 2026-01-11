import '../../styles/admin/RecentBookings.css';
import React, { useEffect, useState,useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '../../services/api';


const RecentBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [actionMenu, setActionMenu] = useState({ open: false, index: null });
  const menuRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const response = await bookingService.listBooking();
        console.log('Booking response:', response);
        setBookings(response || []);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch bookings.');
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActionMenu({ open: false, index: null });
      }
    };

    if (actionMenu.open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [actionMenu]);

  const handleAction = (action, booking) => {
    setActionMenu({ open: false, index: null });

    if (action === 'View Booking') {
      navigate(`/bookings/${booking.bookingId}`);
    }

    console.log(`${action} clicked for booking ID ${booking.bookingId}`);
  };

  // ✅ Place filteredBookings here inside the functional body
  const filteredBookings = bookings.filter(
    (b) =>
      b.venueName?.toLowerCase().includes(search.toLowerCase()) ||
      b.partnerName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="recent-bookings-container">
      <div className="recent-bookings-header">
        <div>
          <h2 className="recent-bookings-title">Recent Bookings</h2>
          <p className="recent-bookings-subtitle">Latest Bookings</p>
        </div>
        {/* Optional search input UI */}
        {/* <input
          type="text"
          placeholder="Search venue or partner"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        /> */}
      </div>

      <div className="recent-bookings-list">
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          filteredBookings.map((booking, index) => (
            <div className="booking-card" key={index}>
              <div className="booking-info">
                <h3 className="booking-venue">{booking.venueName}</h3>
                <p className="booking-customer">Customer: {booking.attendeeName}</p>
                <p className="booking-partner">Partner: {booking.partnerName}</p>
                <p className="booking-date">
                  Date: {new Date(booking.bookedTime).toLocaleDateString()}
                </p>
              </div>
              <div className="booking-price-details">
                <p className="booking-price">
                  NPR {booking.amount?.toLocaleString()}
                </p>
                <button
                  className="view-details-button"
                  onClick={() => handleAction('View Booking', booking)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="view-all-bookings-container">
        <button className="view-all-bookings-button">
          View all Recent Bookings
        </button>
      </div>
    </div>
  );
};

export default RecentBookings;
