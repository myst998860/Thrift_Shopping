import React, { useEffect, useState, useRef } from 'react';
import '../../styles/admin/Booking.css';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '../../services/api';

const statusColors = {
  Confirmed: "#b2ffb2",
  Active: "#b2ffb2",
  Cancelled: "#ffb2b2",
  Pending: "#fff7b2",
};

const statusTextColors = {
  Confirmed: "#1a7f1a",
  Active: "#1a7f1a",
  Cancelled: "#b21a1a",
  Pending: "#b29a1a",
};

const Booking = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [actionMenu, setActionMenu] = useState({ open: false, index: null });
  const menuRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const response = await bookingService.listBooking();
        // Normalize status - default to "pending pickup" if status is missing or invalid
        const validStatuses = ["pending pickup", "Processed pickup", "pickuped successfully"];
        const normalizedBookings = response.map(booking => ({
          ...booking,
          status: validStatuses.includes(booking.status) 
            ? booking.status 
            : "pending pickup"
        }));
        setBookings(normalizedBookings);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch bookings.");
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
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [actionMenu]);

  const handleAction = (action, booking) => {
  setActionMenu({ open: false, index: null });

  if (action === 'View Booking') {
    navigate(`/bookings/${booking.bookingId}`);
  }

   if (action === 'Edit Booking') {
    navigate(`/bookings/edit/${booking.bookingId}`);
  }

  console.log(`${action} clicked for booking ID ${booking.bookingId}`);
};

  const filteredBookings = bookings.filter(
    (b) =>
      b.venueName?.toLowerCase().includes(search.toLowerCase()) ||
      b.partnerName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    navigate("/partner/bookings/new");
    setActionMenu({ open: false, index: null });
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await bookingService.updateBookingStatus(bookingId, newStatus);
      // Update the booking status in the local state
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.bookingId === bookingId
            ? { ...booking, status: newStatus }
            : booking
        )
      );
    } catch (err) {
      console.error('Failed to update booking status:', err);
      setError("Failed to update booking status.");
    }
  };

  return (
    <div className="booking-management-container">
      <div className="booking-header">
        <h2>Booking Management</h2>
        <button
          onClick={handleAdd}
          style={{
            background: "#111",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "10px 22px",
            fontWeight: 600,
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          + Add New Booking
        </button>
      </div>
      <a href="#" className="manage-link">
        Manage all booking
      </a>
      <div className="booking-table-container">
        <div className="booking-table-header">
          <div>All Bookings</div>
          <div className="booking-table-desc">
            A list of all bookings made on the platform
          </div>
        </div>
        <input
          type="text"
          className="booking-search"
          placeholder="Search by venue or partner..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <table className="booking-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Venue Name</th>
               <th>Customer Name</th>
              <th>Partner Name</th>
              <th>Date/Time</th>
              <th>Duration</th>
              <th>Guests</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((b, idx) => (
              <tr key={b.bookingId}>
                <td>{b.bookingId}</td>
                <td>{b.venueName}</td>
                  <td>{b.attendeeName}</td>
                <td>{b.partnerName}</td>
                <td>{new Date(b.bookedTime).toLocaleString()}</td>
                <td>{b.duration}</td>
                <td>{b.guests}</td>
                <td>
                  <select
                    value={b.status || "pending pickup"}
                    onChange={(e) => handleStatusChange(b.bookingId, e.target.value)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: "4px",
                      border: "1px solid #ddd",
                      fontSize: "14px",
                      cursor: "pointer",
                      backgroundColor: "#fff",
                      minWidth: "150px"
                    }}
                  >
                    <option value="pending pickup">pending pickup</option>
                    <option value="Processed pickup">Processed pickup</option>
                    <option value="pickuped successfully">pickuped successfully</option>
                  </select>
                </td>
                <td style={{ position: "relative" }}>
                  <button
                    className="action-btn"
                    onClick={() =>
                      setActionMenu({
                        open:
                          !actionMenu.open || actionMenu.index !== idx,
                        index: idx,
                      })
                    }
                  >
                    &#8942;
                  </button>
                  {actionMenu.open && actionMenu.index === idx && (
                    <div className="action-menu" ref={menuRef}>
                      <div className="action-menu-title">Actions</div>
                     <div onClick={() => handleAction("View Booking", b)}>
                      View Booking
                      </div>

                     <div onClick={() => handleAction("Edit Booking", b)}>
  Edit Booking
</div>
                      <div onClick={() => handleAction("Approve Venue", b)}>
                        Approve Venue
                      </div>
                      <div onClick={() => handleAction("Reject Venue", b)}>
                        Reject Venue
                      </div>
                      <div
                        className="delete-action"
                        onClick={() => handleAction("Delete Venue", b)}
                      >
                        Delete Venue
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <p>Loading bookings...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </div>
  );
};

export default Booking;
