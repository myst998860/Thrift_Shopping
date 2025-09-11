import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { bookingService, venueService } from "../../services/api";

const AddBooking = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    venueId: "",
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
      navigate("/partner/bookings");
    } catch (err) {
      const msg = err.response?.data?.message || "Error adding booking";
      setApiError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Add New Booking</h2>
          <p style={styles.subtitle}>Create a new booking for your venue</p>
        </div>

        {apiError && (
          <div style={styles.errorAlert}>
            <span style={styles.errorIcon}>⚠️</span>
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="venueId">
              Select Venue *
            </label>
            <select
              name="venueId"
              value={formData.venueId}
              onChange={handleChange}
              style={{
                ...styles.select,
                borderColor: errors.venueId ? "#e74c3c" : "#ddd"
              }}
            >
              <option value="">Choose a venue from your list</option>
              {venues.map((v) => (
                <option key={v.venue_id} value={v.venue_id}>
                  {v.venueName}
                </option>
              ))}
            </select>
            {errors.venueId && (
              <span style={styles.errorText}>{errors.venueId}</span>
            )}
          </div>

          {selectedVenue && (
            <div style={styles.venueCard}>
              <div style={styles.venueHeader}>
                <span style={styles.venueIcon}>🏢</span>
                <span style={styles.venueTitle}>Selected Venue Details</span>
              </div>
              <div style={styles.venueDetails}>
                <div style={styles.venueInfo}>
                  <span style={styles.venueLabel}>Name:</span>
                  <span style={styles.venueValue}>{selectedVenue.venueName}</span>
                </div>
                <div style={styles.venueInfo}>
                  <span style={styles.venueLabel}>Price:</span>
                  <span style={styles.venueValue}>₹{selectedVenue.price}</span>
                </div>
              </div>
            </div>
          )}

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Date & Time *
            </label>
            <input
              name="date"
              type="datetime-local"
              value={formData.date}
              onChange={handleChange}
              style={{
                ...styles.input,
                borderColor: errors.date ? "#e74c3c" : "#ddd"
              }}
            />
            {errors.date && <span style={styles.errorText}>{errors.date}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Booking Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={{
                ...styles.select,
                borderColor: errors.status ? "#e74c3c" : "#ddd"
              }}
            >
              <option value="">Select booking status</option>
              <option value="Confirmed">✅ Confirmed</option>
              <option value="Pending">⏳ Pending</option>
              <option value="Cancelled">❌ Cancelled</option>
            </select>
            {errors.status && <span style={styles.errorText}>{errors.status}</span>}
          </div>

          <div style={styles.buttonGroup}>
            <button
              type="button"
              onClick={() => navigate("/partner/bookings")}
              style={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                ...styles.submitButton,
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? "not-allowed" : "pointer"
              }}
            >
              {isSubmitting ? (
                <span style={styles.loadingText}>
                  <span style={styles.spinner}>⏳</span> Adding Booking...
                </span>
              ) : (
                "Create Booking"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #ffffffff 0%, #c5c5c5ff 100%)",
    padding: "20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  card: {
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
    padding: "40px",
    width: "100%",
    maxWidth: "600px",
    margin: "20px"
  },
  header: {
    textAlign: "center",
    marginBottom: "30px"
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#2c3e50",
    margin: "0 0 8px 0"
  },
  subtitle: {
    fontSize: "16px",
    color: "#7f8c8d",
    margin: "0"
  },
  errorAlert: {
    background: "#fee",
    border: "1px solid #fcc",
    borderRadius: "8px",
    padding: "12px 16px",
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#c0392b"
  },
  errorIcon: {
    fontSize: "16px"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "24px"
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: "4px"
  },
  input: {
    padding: "12px 16px",
    border: "2px solid #ddd",
    borderRadius: "8px",
    fontSize: "16px",
    transition: "border-color 0.3s ease",
    outline: "none"
  },
  select: {
    padding: "12px 16px",
    border: "2px solid #ddd",
    borderRadius: "8px",
    fontSize: "16px",
    backgroundColor: "white",
    transition: "border-color 0.3s ease",
    outline: "none",
    cursor: "pointer"
  },
  errorText: {
    color: "#e74c3c",
    fontSize: "14px",
    marginTop: "4px"
  },
  venueCard: {
    background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
    border: "2px solid #dee2e6",
    borderRadius: "12px",
    padding: "20px",
    marginTop: "8px"
  },
  venueHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "16px"
  },
  venueIcon: {
    fontSize: "20px"
  },
  venueTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#495057"
  },
  venueDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  venueInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  venueLabel: {
    fontSize: "14px",
    color: "#6c757d",
    fontWeight: "500"
  },
  venueValue: {
    fontSize: "14px",
    color: "#495057",
    fontWeight: "600"
  },
  buttonGroup: {
    display: "flex",
    gap: "16px",
    marginTop: "16px"
  },
  cancelButton: {
    flex: 1,
    padding: "14px 24px",
    border: "2px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "white",
    color: "#6c757d",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease"
  },
  submitButton: {
    flex: 2,
    padding: "14px 24px",
    border: "none",
    borderRadius: "8px",
    background: "linear-gradient(135deg, #000000ff 0%, #000000ff 100%)",
    color: "white",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)"
  },
  loadingText: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px"
  },
  spinner: {
    animation: "spin 1s linear infinite"
  }
};

export default AddBooking;