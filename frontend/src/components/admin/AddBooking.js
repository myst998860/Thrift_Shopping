import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { bookingService, venueService } from "../../services/api";

const AddBook = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    venueId: "",
    partnerName:"",
    date: "",
    status: "",
  });

  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    venueService
      .listVenue()
      .then((data) => setVenues(data))
      .catch((err) => console.error("Failed fetching venues", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "venueId") {
      const selected = venues.find((v) => String(v.venue_id) === value);
      setSelectedVenue(selected || null);
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.venueId) errs.venueId = "Venue is required";
    if (!formData.date) errs.date = "Date/Time is required";
    if (!formData.status) errs.status = "Status is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError("");

    try {
      const payload = {
        venueId: Number(formData.venueId),
        bookedTime: formData.date,
        status: formData.status,
      };

      await bookingService.createBooking(payload);

      alert("Booking added successfully!");
      navigate("/admin/bookings");
    } catch (err) {
      console.error("Booking add failed:", err);
      const msg = err.response?.data?.message || "Error adding booking";
      setApiError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: "auto" }}>
      <h2>Add New Booking</h2>
      {apiError && <div style={{ color: "red" }}>{apiError}</div>}

      <div>
        <label htmlFor="venueId">Venue</label>
        <select
          name="venueId"
          value={formData.venueId}
          onChange={handleChange}
        >
          <option value="">Select a venue</option>
          {venues.map((v) => (
            <option key={v.venue_id} value={v.venue_id}>
              {v.venueName} — {v.partner}
            </option>
          ))}
        </select>
        {errors.venueId && (
          <span style={{ color: "red" }}>{errors.venueId}</span>
        )}
      </div>

      {selectedVenue && (
        <div
          style={{
            background: "#f9f9f9",
            padding: "10px",
            marginTop: "8px",
            borderRadius: "4px",
          }}
        >
          <strong>Selected Venue:</strong>
          <div>Name: {selectedVenue.venueName}</div>
          <div>Partner: {selectedVenue.partner}</div>
          <div>Price: {selectedVenue.price}</div>
        </div>
      )}

      <div>
        <label>Date/Time</label>
        <input
          name="date"
          type="datetime-local"
          value={formData.date}
          onChange={handleChange}
        />
        {errors.date && <span style={{ color: "red" }}>{errors.date}</span>}
      </div>

      <div>
        <label>Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="">Choose status</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Pending">Pending</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        {errors.status && <span style={{ color: "red" }}>{errors.status}</span>}
      </div>

      <div style={{ marginTop: 20 }}>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Booking"}
        </button>
      </div>
    </form>
  );
};

export default AddBook;
