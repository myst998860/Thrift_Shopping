"use client"
import { useState, useEffect } from "react"
import { bookingService, venueService } from "../../services/api"
import "../../styles/venue-booking.css"
import "../../styles/modern-components.css"
import "../../styles/leaflet-map.css"
import Header from "./Header"
import VenueMap from "./VenueMap" // Import the new Leaflet map component
import { useLocation, useNavigate } from "react-router-dom"

const VenueBooking = () => {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { venueId } = state || {}

  // Multi-step state management - Remove "payment" step since we'll navigate to PaymentPage
  const [currentStep, setCurrentStep] = useState("form") // "form", "review"

  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    duration: "4",
    guests: "",
    specialRequests: "",
  })

  const [formErrors, setFormErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [bookedSlots, setBookedSlots] = useState([])
  const [venueDetails, setVenueDetails] = useState(null)

  useEffect(() => {
    if (!venueId) navigate("/venues")
  }, [venueId, navigate])

  // Fetch venue details
  useEffect(() => {
    const fetchVenueDetails = async () => {
      try {
        const data = await venueService.getVenue(venueId)
        setVenueDetails(data)
      } catch (err) {
        console.error("Error fetching venue details:", err)
      }
    }
    if (venueId) fetchVenueDetails()
  }, [venueId])

  // Fetch booked slots when date changes
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (formData.date && venueId) {
        try {
          const bookings = await bookingService.getBookingsByVenueAndDate(venueId, formData.date)
          setBookedSlots(bookings)
        } catch (err) {
          console.error("Error fetching booked slots:", err)
        }
      }
    }
    fetchBookedSlots()
  }, [formData.date, venueId])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const errs = {}
    if (!formData.date) errs.date = "Please select a date"
    else {
      const sel = new Date(formData.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (sel < today) errs.date = "Please select a future date"
    }
    if (!formData.startTime) errs.startTime = "Please select a start time"
    const g = Number.parseInt(formData.guests, 10)
    if (!g || g < 1) errs.guests = "Please enter number of guests"
    else if (g > 1000) errs.guests = "Maximum 1000 guests allowed"
    setFormErrors(errs)
    return !Object.keys(errs).length
  }

  const isTimeDisabled = (time) => {
    const selectedDate = formData.date
    if (!selectedDate || bookedSlots.length === 0) return false
    const checkTime = new Date(`${selectedDate}T${time}:00`)
    return bookedSlots.some((slot) => {
      const bookingStart = new Date(slot.bookedTime)
      const bookingEnd = new Date(bookingStart.getTime() + slot.duration * 60 * 60 * 1000)
      const bufferStart = new Date(bookingStart.getTime() - 60 * 60 * 1000)
      const bufferEnd = new Date(bookingEnd.getTime() + 60 * 60 * 1000)
      return checkTime >= bufferStart && checkTime < bufferEnd
    })
  }

  // Step 1: Handle form submission (move to review)
  const handleFormSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setCurrentStep("review")
  }

  // Step 2: Handle review confirmation (navigate to PaymentPage)
  const handleReviewConfirm = () => {
    // Prepare booking data for PaymentPage
    const bookingData = {
      venueId: Number(venueId),
      venueName: venueDetails?.venueName,
      date: formData.date,
      startTime: formData.startTime,
      duration: formData.duration,
      guests: formData.guests,
      specialRequests: formData.specialRequests,
      venuePrice: venueDetails?.price || 15000,
    }

    // Navigate to PaymentPage with booking data
    navigate("/payment", {
      state: {
        bookingData,
        // onBack: () => navigate(-1), // Go back to this page
      },
    })
  }

  // Navigation helpers
  const goBackToForm = () => setCurrentStep("form")

  const timeOptions = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
  ]

  // Calculate pricing
  const calculatePricing = () => {
    const basePrice = venueDetails?.price || 15000
    const duration = Number.parseInt(formData.duration, 10) || 2
    const guestCount = Number.parseInt(formData.guests, 10) || 0
    const subtotal = basePrice * duration
    const serviceCharge = Math.round(subtotal * 0.1) // 10% service charge
    const tax = Math.round((subtotal + serviceCharge) * 0.13) // 13% VAT
    const guestFee = guestCount > 100 ? (guestCount - 100) * 50 : 0 // Extra fee for guests over 100
    const total = subtotal + serviceCharge + tax + guestFee
    return {
      basePrice,
      duration,
      subtotal,
      serviceCharge,
      tax,
      guestFee,
      total,
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const options = { year: "numeric", month: "long", day: "numeric" }
    return date.toLocaleDateString("en-US", options)
  }

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  // Helper function to extract coordinates from Google Maps URL
  const extractCoordinatesFromUrl = (mapUrl) => {
    if (!mapUrl) return null;
    
    // Try to extract coordinates from various Google Maps URL formats
    const patterns = [
      /@(-?\d+\.?\d*),(-?\d+\.?\d*)/, // @lat,lng format
      /q=(-?\d+\.?\d*),(-?\d+\.?\d*)/, // q=lat,lng format
      /ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/, // ll=lat,lng format
      /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/, // 3d/4d format
    ];
    
    for (const pattern of patterns) {
      const match = mapUrl.match(pattern);
      if (match) {
        return {
          lat: parseFloat(match[1]),
          lng: parseFloat(match[2])
        };
      }
    }
    
    return null;
  };

  // Generate Google Maps embed URL
  const getMapEmbedUrl = (mapUrl, venueName, location) => {
    if (!mapUrl) return null;
    
    const coordinates = extractCoordinatesFromUrl(mapUrl);
    
    if (coordinates) {
      // Use coordinates for embed
      return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qcqn0Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8&q=${coordinates.lat},${coordinates.lng}&zoom=15`;
    } else {
      // Fallback to search by venue name and location
      const query = encodeURIComponent(`${venueName} ${location}`);
      return `https://www.google.com/maps/embed/v1/search?key=AIzaSyBFw0Qcqn0Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8&q=${query}`;
    }
  };
  const pricing = calculatePricing()

  // Render different steps
  const renderFormStep = () => (
    <div className="venue-booking-sidebar">
      <div className="venue-booking-card">
        <div className="venue-booking-header">
          <h3 className="venue-booking-title">Book this venue</h3>
          <p className="venue-booking-subtitle">Fill in the details below</p>
        </div>
        {error && (
          <div
            style={{
              background: "#f8d7da",
              color: "#721c24",
              padding: "12px",
              margin: "16px",
              borderRadius: "4px",
              border: "1px solid #f5c6cb",
            }}
          >
            ❌ {error}
          </div>
        )}
        <form className="venue-booking-form" onSubmit={handleFormSubmit}>
          <div className="venue-form-group">
            <label className="venue-form-label">Event Date *</label>
            <input
              type="date"
              className={`venue-form-input ${formErrors.date ? "venue-input-error" : ""}`}
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
            {formErrors.date && <div className="venue-form-error">{formErrors.date}</div>}
          </div>
          <div className="venue-form-group">
            <label className="venue-form-label">Start Time *</label>
            <select
              className={`venue-form-input ${formErrors.startTime ? "venue-input-error" : ""}`}
              value={formData.startTime}
              onChange={(e) => handleInputChange("startTime", e.target.value)}
            >
              <option value="">Select time</option>
              {timeOptions.map((t) => (
                <option key={t} value={t} disabled={isTimeDisabled(t)}>
                  {t} {isTimeDisabled(t) ? " (Unavailable)" : ""}
                </option>
              ))}
            </select>
            {formErrors.startTime && <div className="venue-form-error">{formErrors.startTime}</div>}
          </div>
          <div className="venue-form-group">
            <label className="venue-form-label">Duration</label>
            <select
              className="venue-form-input"
              value={formData.duration}
              onChange={(e) => handleInputChange("duration", e.target.value)}
            >
              <option value="2">2 hours</option>
              <option value="4">4 hours</option>
              <option value="6">6 hours</option>
              <option value="8">8 hours</option>
              <option value="12">12 hours</option>
            </select>
          </div>
          <div className="venue-form-group">
            <label className="venue-form-label">Number of Guests *</label>
            <input
              type="number"
              className={`venue-form-input ${formErrors.guests ? "venue-input-error" : ""}`}
              placeholder="Enter number of guests"
              value={formData.guests}
              onChange={(e) => handleInputChange("guests", e.target.value)}
              min="1"
              max="1000"
            />
            {formErrors.guests && <div className="venue-form-error">{formErrors.guests}</div>}
          </div>
          <div className="venue-form-group">
            <label className="venue-form-label">Special Requests</label>
            <textarea
              className="venue-form-textarea"
              placeholder="Any special requirements or requests..."
              value={formData.specialRequests}
              onChange={(e) => handleInputChange("specialRequests", e.target.value)}
              rows="3"
            />
          </div>
          <button type="submit" className="venue-continue-btn" disabled={loading}>
            Continue to Review
          </button>
        </form>
      </div>
    </div>
  )

  const renderReviewStep = () => (
    <div className="venue-booking-sidebar">
      <div className="venue-review-card">
        <div className="venue-review-header">
          <h3 className="venue-review-title">Review Your Booking</h3>
          <p className="venue-review-subtitle">Please confirm your booking details</p>
        </div>
        <div className="venue-review-content">
          <div className="venue-review-details">
            <div className="venue-review-item">
              <div className="venue-review-label">Venue</div>
              <div className="venue-review-value">{venueDetails?.venueName || "Loading..."}</div>
            </div>
            <div className="venue-review-item">
              <div className="venue-review-label">Date</div>
              <div className="venue-review-value">{formatDate(formData.date)}</div>
            </div>
            <div className="venue-review-item">
              <div className="venue-review-label">Time</div>
              <div className="venue-review-value">{formatTime(formData.startTime)}</div>
            </div>
            <div className="venue-review-item">
              <div className="venue-review-label">Duration</div>
              <div className="venue-review-value">{formData.duration} hours</div>
            </div>
            <div className="venue-review-item">
              <div className="venue-review-label">Number of Guests</div>
              <div className="venue-review-value">{formData.guests}</div>
            </div>
            {formData.specialRequests && (
              <div className="venue-review-item">
                <div className="venue-review-label">Special Requests</div>
                <div className="venue-review-value">{formData.specialRequests}</div>
              </div>
            )}
          </div>
          <div className="venue-review-pricing">
            <div className="venue-pricing-row">
              <span className="venue-pricing-label">
                Base Price ({formData.duration} hours × NPR {pricing.basePrice.toLocaleString()})
              </span>
              <span className="venue-pricing-value">NPR {pricing.subtotal.toLocaleString()}</span>
            </div>
            <div className="venue-pricing-row">
              <span className="venue-pricing-label">Service Charge (10%)</span>
              <span className="venue-pricing-value">NPR {pricing.serviceCharge.toLocaleString()}</span>
            </div>
            <div className="venue-pricing-row">
              <span className="venue-pricing-label">VAT (13%)</span>
              <span className="venue-pricing-value">NPR {pricing.tax.toLocaleString()}</span>
            </div>
            {pricing.guestFee > 0 && (
              <div className="venue-pricing-row">
                <span className="venue-pricing-label">Additional Guest Fee ({formData.guests - 100} guests)</span>
                <span className="venue-pricing-value">NPR {pricing.guestFee.toLocaleString()}</span>
              </div>
            )}
            <div className="venue-pricing-row venue-pricing-total">
              <span className="venue-pricing-label">Total Amount</span>
              <span className="venue-pricing-value">NPR {pricing.total.toLocaleString()}</span>
            </div>
          </div>
          <div className="venue-review-terms">
            <small>
              By proceeding to payment, you agree to our terms and conditions. Cancellation policy applies as per venue
              guidelines.
            </small>
          </div>
          <div className="venue-review-actions">
            <button onClick={handleReviewConfirm} className="venue-proceed-btn" disabled={loading}>
              Proceed to Payment
            </button>
            <button onClick={goBackToForm} className="venue-back-btn" disabled={loading}>
              ← Back to Edit Details
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // Progress indicator - Updated to show only 2 steps
  const renderProgressIndicator = () => {
    const steps = [
      { key: "form", label: "Details", number: 1 },
      { key: "review", label: "Review", number: 2 },
    ]

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "2rem 0",
          gap: "1rem",
        }}
      >
        {steps.map((step, index) => (
          <div key={step.key} style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background:
                  currentStep === step.key
                    ? "#2d5a27"
                    : steps.findIndex((s) => s.key === currentStep) > index
                      ? "#2d5a27"
                      : "#e9ecef",
                color:
                  currentStep === step.key || steps.findIndex((s) => s.key === currentStep) > index
                    ? "white"
                    : "#6c757d",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "1rem",
              }}
            >
              {steps.findIndex((s) => s.key === currentStep) > index ? "✓" : step.number}
            </div>
            <span
              style={{
                marginLeft: "0.5rem",
                fontWeight: currentStep === step.key ? "bold" : "normal",
                color: currentStep === step.key ? "#2d5a27" : "#6c757d",
              }}
            >
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div
                style={{
                  width: "60px",
                  height: "2px",
                  background: steps.findIndex((s) => s.key === currentStep) > index ? "#2d5a27" : "#e9ecef",
                  margin: "0 1rem",
                }}
              />
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="venue-booking-page">
      <Header />
      {/* <section className="venue-hero-section">
        <img
          src={
            venueDetails?.imageUrl ||
            "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200&h=400&fit=crop&crop=center" ||
            "/placeholder.svg"
          }
          alt={venueDetails?.venueName || "Venue Image"}
          className="venue-hero-background"
        />
        <div className="venue-hero-content">
          <h1 className="venue-hero-title">{venueDetails?.venueName || "Book Your Perfect Venue"}</h1>
          <div className="venue-hero-tagline">
            <p className="venue-hero-text-primary">We bring</p>
            <p className="venue-hero-text-highlight">dream events</p>
            <p className="venue-hero-text-primary">to life!</p>
          </div>
        </div>
      </section> */}
      <main className="venue-main-content">
        {renderProgressIndicator()}
        <div className="venue-content-grid">
          {/* Venue Details */}
          <div className="venue-details-section">
            <h2 className="venue-details-title">{venueDetails?.venueName}</h2>
            <div className="venue-image-carousel">
              <img
                src={
                  venueDetails?.imageUrl ||
                  "https://images.unsplash.com/photo-1519167758481-83f29c8e8d4b?w=800&h=400&fit=crop" ||
                  "/placeholder.svg"
                }
                alt={venueDetails?.venueName || "Venue Image"}
                className="venue-carousel-image"
              />
            </div>
            <div className="venue-rating-section">
              <div className="venue-rating-container">
                <div className="venue-rating-stars">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="venue-star-icon">
                      ★
                    </span>
                  ))}
                </div>
                <span className="venue-rating-number">4.8</span>
                <span className="venue-rating-count">(124 reviews)</span>
              </div>
            </div>
            <div className="venue-tabs-container">
              <div className="venue-tab-content">
                <div className="venue-about-section">
                  <h3 className="venue-section-heading">About this venue</h3>
                  <p className="venue-description-text">{venueDetails?.description || "Loading venue details..."}</p>
                  <div className="venue-info-grid">
                    <div className="venue-info-item">
                      <div className="venue-info-heading">
                        <span>👥</span> Capacity
                      </div>
                      <div className="venue-info-text">{venueDetails?.capacity || "N/A"} guests</div>
                    </div>
                    <div className="venue-info-item">
                      <div className="venue-info-heading">
                        <span>📍</span> Location
                      </div>
                      <div className="venue-info-text">{venueDetails?.location || "N/A"}</div>
                    </div>
                    <div className="venue-info-item">
                      <div className="venue-info-heading">
                        <span>🕒</span> Opening Hours
                      </div>
                      <div className="venue-info-text">
                        {venueDetails?.openingTime} - {venueDetails?.closingTime}
                      </div>
                    </div>
                    <div className="venue-info-item">
                      <div className="venue-info-heading">
                        <span>💰</span> Price
                      </div>
                      <div className="venue-info-text">NPR {venueDetails?.price || "N/A"} / hour</div>
                    </div>
                  </div>
                  <h4 className="venue-section-heading">Amenities:</h4>
                  <ul>
                    {venueDetails?.amenities?.length > 0 ? (
                      venueDetails.amenities.map((amenity, idx) => <li key={idx}>✔ {amenity}</li>)
                    ) : (
                      <li>No amenities listed</li>
                    )}
                  </ul>
                </div>
              </div>
              
              {/* Location Map Section */}
              {venueDetails?.mapLocationUrl && (
                <div className="venue-location-section">
                  <h4 className="venue-section-heading">Location Map</h4>
                  <div className="venue-map-container">
                    <VenueMap
                      venueId={venueDetails.id}
                      mapLocationUrl={venueDetails.mapLocationUrl}
                      venueName={venueDetails.venueName}
                      location={venueDetails.location}
                      height="250px"
                      showDirections={true}
                      zoom={15}
                    />
                  </div>
                  <div className="venue-location-actions">
                    <a 
                      href={venueDetails.mapLocationUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="venue-location-link"
                    >
                      📍 View on Google Maps
                    </a>
                  </div>
                </div>
              )}
              
            </div>
          </div>
          {/* Booking Form/Review */}
          {currentStep === "form" && renderFormStep()}
          {currentStep === "review" && renderReviewStep()}
        </div>
      </main>
    </div>
  )
}

export default VenueBooking