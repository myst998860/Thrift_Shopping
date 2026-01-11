import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { userService } from '../../services/api';
import { bookingService } from '../../services/api';

const ViewBooking = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const dto = await bookingService.getBookingById(bookingId);
        setBooking(dto);
      } catch (err) {
        console.error(err);
        setApiError("Failed to load booking data");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  if (loading) return <p>Loading booking details...</p>;
  if (apiError) return <p style={{ color: "red" }}>{apiError}</p>;
  if (!booking) return <p>Booking not found.</p>;

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "auto",
        padding: 20,
        border: "1px solid #ddd",
        borderRadius: 8,
        backgroundColor: "#fafafa",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <h2>Booking Details</h2>

      <BookingDetail label="Booking ID" value={booking.bookingId} />
      <BookingDetail label="Venue Name" value={booking.venueName} />
      <BookingDetail label="Partner" value={booking.partnerName} />
      <BookingDetail label="Status" value={booking.status} />
      <BookingDetail
        label="Booked Time"
        value={new Date(booking.bookedTime).toLocaleString()}
      />
      <BookingDetail label="Duration (hrs)" value={booking.duration} />
      <BookingDetail label="Guests" value={booking.guests} />
      <BookingDetail
        label="Special Requests"
        value={booking.specialRequests || "None"}
      />

      <button
        onClick={() => navigate(-1)}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          fontWeight: "600",
        }}
      >
        Back to Bookings
      </button>
    </div>
  );
};

const BookingDetail = ({ label, value }) => (
  <div style={{ marginBottom: 12, display: "flex" }}>
    <strong style={{ width: 180 }}>{label}:</strong>
    <span>{value}</span>
  </div>
);

export default ViewBooking;
