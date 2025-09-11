"use client"

import { useState, useEffect } from "react"
import { contactService } from "../../services/api"
import "../../styles/ContactPage.css"
import Header from "./Header"
import Footer from "./Footer"

const ContactPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    contactNumber: "",
    emailAddress: "",
    message: "",
  })

  const [errors, setErrors] = useState({
    fullName: "",
    contactNumber: "",
    emailAddress: "",
    message: "",
  })

  const [touched, setTouched] = useState({
    fullName: false,
    contactNumber: false,
    emailAddress: false,
    message: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState("idle")
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [apiError, setApiError] = useState("")

  // Auto-hide success message after 5 seconds
  useEffect(() => {
    if (submitStatus === "success") {
      setShowSuccessModal(true)
      const timer = setTimeout(() => {
        setSubmitStatus("idle")
        setShowSuccessModal(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [submitStatus])

  const validateField = (name, value) => {
    switch (name) {
      case "fullName":
        if (!value.trim()) {
          return "Full name is required"
        }
        if (value.trim().length < 2) {
          return "Full name must be at least 2 characters"
        }
        if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          return "Full name can only contain letters and spaces"
        }
        return ""

      case "contactNumber":
        if (!value.trim()) {
          return "Contact number is required"
        }
        if (!/^\+?[\d\s\-()]{10,15}$/.test(value.trim())) {
          return "Please enter a valid phone number (10-15 digits)"
        }
        return ""

      case "emailAddress":
        if (!value.trim()) {
          return "Email address is required"
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          return "Please enter a valid email address"
        }
        return ""

      case "message":
        if (!value.trim()) {
          return "Message is required"
        }
        if (value.trim().length < 10) {
          return "Message must be at least 10 characters"
        }
        if (value.trim().length > 500) {
          return "Message must not exceed 500 characters"
        }
        return ""

      default:
        return ""
    }
  }

  const validateForm = () => {
    const newErrors = {
      fullName: validateField("fullName", formData.fullName),
      contactNumber: validateField("contactNumber", formData.contactNumber),
      emailAddress: validateField("emailAddress", formData.emailAddress),
      message: validateField("message", formData.message),
    }
    setErrors(newErrors)
    return !Object.values(newErrors).some((error) => error !== "")
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))

    if (touched[name]) {
      const error = validateField(name, value)
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: error,
      }))
    }

    // Clear API error when user starts typing
    if (apiError) {
      setApiError("")
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched((prevTouched) => ({
      ...prevTouched,
      [name]: true,
    }))

    const error = validateField(name, value)
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")
    setApiError("")

    setTouched({
      fullName: true,
      contactNumber: true,
      emailAddress: true,
      message: true,
    })

    if (!validateForm()) {
      setIsSubmitting(false)
      // Focus on first error field
      const firstErrorField = Object.keys(errors).find((key) => errors[key])
      if (firstErrorField) {
        document.getElementById(firstErrorField)?.focus()
      }
      return
    }

    try {
      const contactData = {
        name: formData.fullName,
        phone: formData.contactNumber,
        email: formData.emailAddress,
        message: formData.message,
        subject: "Contact Form Submission",
        timestamp: new Date().toISOString()
      }

      console.log("Submitting contact form:", contactData)
      const response = await contactService.sendMessage(contactData)
      console.log("Contact form submitted successfully:", response)

      setSubmitStatus("success")

      // Reset form
      setFormData({
        fullName: "",
        contactNumber: "",
        emailAddress: "",
        message: "",
      })
      setErrors({
        fullName: "",
        contactNumber: "",
        emailAddress: "",
        message: "",
      })
      setTouched({
        fullName: false,
        contactNumber: false,
        emailAddress: false,
        message: false,
      })

    } catch (error) {
      console.error("Contact form submission failed:", error)
      setSubmitStatus("error")
      
      if (error.response?.data?.message) {
        setApiError(error.response.data.message)
      } else {
        setApiError("Failed to send message. Please try again or contact us directly.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyToClipboard = (email) => {
    navigator.clipboard.writeText(email).then(() => {
      // Show a brief feedback
      const button = document.querySelector(`[data-email="${email}"]`)
      if (button) {
        const originalText = button.textContent
        button.textContent = "Copied!"
        setTimeout(() => {
          button.textContent = originalText
        }, 2000)
      }
    })
  }

  return (
    <div className="wedding-contact-wrapper">
      <Header />

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="success-modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="success-icon">✅</div>
            <h3>Message Sent Successfully!</h3>
            <p>Thank you for reaching out. We'll get back to you within 24 hours.</p>
            <button onClick={() => setShowSuccessModal(false)} className="modal-close-btn">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="banner-area">
        <div className="banner-text">
          <h1>We are Your Event Partner</h1>
          <p>We bring dream events to life!</p>
          <div className="hero-cta">
            <button
              className="hero-btn"
              onClick={() => document.getElementById("contact-form").scrollIntoView({ behavior: "smooth" })}
            >
              Get Started
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="page-container">
        <div className="layout-columns">
          {/* Contact Form */}
          <div className="inquiry-form" id="contact-form">
            <div className="form-header">
              <h2>Say Hello!</h2>
              <p>Ready to plan your dream event? Let's start the conversation.</p>
            </div>

            {submitStatus === "error" && (
              <div className="error-message" role="alert">
                <span className="error-icon">⚠️</span>
                {apiError || "Something went wrong. Please try again or contact us directly."}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-row">
                <div className="input-wrapper">
                  <label htmlFor="fullName">
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    disabled={isSubmitting}
                    className={errors.fullName && touched.fullName ? "error" : ""}
                    aria-describedby={errors.fullName && touched.fullName ? "fullName-error" : undefined}
                  />
                  {errors.fullName && touched.fullName && (
                    <span className="error-text" id="fullName-error" role="alert">
                      {errors.fullName}
                    </span>
                  )}
                </div>

                <div className="input-wrapper">
                  <label htmlFor="contactNumber">
                    Contact Number <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    id="contactNumber"
                    name="contactNumber"
                    placeholder="+977 (988) 777-6655"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    disabled={isSubmitting}
                    className={errors.contactNumber && touched.contactNumber ? "error" : ""}
                    aria-describedby={errors.contactNumber && touched.contactNumber ? "contactNumber-error" : undefined}
                  />
                  {errors.contactNumber && touched.contactNumber && (
                    <span className="error-text" id="contactNumber-error" role="alert">
                      {errors.contactNumber}
                    </span>
                  )}
                </div>
              </div>

              <div className="input-wrapper">
                <label htmlFor="emailAddress">
                  Email Address <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="emailAddress"
                  name="emailAddress"
                  placeholder="your.email@example.com"
                  value={formData.emailAddress}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  required
                  disabled={isSubmitting}
                  className={errors.emailAddress && touched.emailAddress ? "error" : ""}
                  aria-describedby={errors.emailAddress && touched.emailAddress ? "emailAddress-error" : undefined}
                />
                {errors.emailAddress && touched.emailAddress && (
                  <span className="error-text" id="emailAddress-error" role="alert">
                    {errors.emailAddress}
                  </span>
                )}
              </div>

              <div className="input-wrapper">
                <label htmlFor="message">
                  Message <span className="required">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Tell us about your event requirements..."
                  value={formData.message}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  required
                  disabled={isSubmitting}
                  className={errors.message && touched.message ? "error" : ""}
                  aria-describedby="message-help message-error"
                />
                <div className="message-help">
                  <div className="character-count" id="message-help">
                    {formData.message.length}/500 characters
                  </div>
                  <div className="message-hint">
                    Include your event date, venue preferences, and any special requirements.
                  </div>
                </div>
                {errors.message && touched.message && (
                  <span className="error-text" id="message-error" role="alert">
                    {errors.message}
                  </span>
                )}
              </div>

              <button type="submit" className="send-button" disabled={isSubmitting} aria-describedby="submit-help">
                {isSubmitting ? (
                  <>
                    <span className="loading-spinner"></span>
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </button>
              <div className="submit-help" id="submit-help">
                We'll respond within 24 hours
              </div>
            </form>
          </div>

          {/* Contact Information */}
          <div className="details-section">
            <div className="contact-intro">
              <h2>Get in Touch</h2>
              <p>Choose the best way to reach us based on your needs.</p>
            </div>

            {/* Compact Contact Grid */}
            <div className="contact-grid">
              <div className="contact-card">
                <div className="card-header">
                  <span className="category-icon">🤝</span>
                  <h3>Vendors</h3>
                </div>
                <p>Business partnerships and vendor registration</p>
                <div className="contact-actions">
                  <a href="mailto:vendors@company.com" className="email-link">
                    vendors@company.com
                  </a>
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboard("vendors@company.com")}
                    data-email="vendors@company.com"
                    title="Copy email"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="contact-card">
                <div className="card-header">
                  <span className="category-icon">💬</span>
                  <h3>Support</h3>
                </div>
                <p>Customer feedback and general queries</p>
                <div className="contact-actions">
                  <a href="mailto:info@company.com" className="email-link">
                    info@company.com
                  </a>
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboard("info@company.com")}
                    data-email="info@company.com"
                    title="Copy email"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="contact-card">
                <div className="card-header">
                  <span className="category-icon">💕</span>
                  <h3>Event Planning</h3>
                </div>
                <p>Ready to plan your dream event? Let's start the conversation!</p>
                <div className="contact-actions">
                  <a href="mailto:hello@company.com" className="email-link">
                    hello@company.com
                  </a>
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboard("hello@company.com")}
                    data-email="hello@company.com"
                    title="Copy email"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Contact Info */}
            <div className="quick-contact">
              <h3>Quick Contact</h3>
              <div className="quick-contact-items">
                <div className="quick-contact-item">
                  <span className="contact-icon">📞</span>
                  <div>
                    <strong>Phone</strong>
                    <a href="tel:+1234567890">+977 (988) 777-6655</a>
                  </div>
                </div>
                <div className="quick-contact-item">
                  <span className="contact-icon">📍</span>
                  <div>
                    <strong>Address</strong>
                    <span>123 Event St, Kathmandu, Nepal</span>
                  </div>
                </div>
                <div className="quick-contact-item">
                  <span className="contact-icon">🕒</span>
                  <div>
                    <strong>Hours</strong>
                    <span>
                      Mon-Fri: 9AM-6PM
                      <br />
                      Sat: 10AM-4PM
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer /> 
    </div>
  )
}

export default ContactPage