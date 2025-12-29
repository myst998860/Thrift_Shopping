"use client"

import { useState } from "react"
import "../../styles/ContactPage.css"
import Header from "./Header"
import Footer from "./Footer"

const ContactPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    contactNumber: "",
    emailAddress: "",
    message: "",
    images: [],   // <-- FIXED name
  })

  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [imagePreview, setImagePreview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState("idle")
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [apiError, setApiError] = useState("")

  const validateField = (name, value) => {
    switch (name) {
      case "fullName":
        if (!value.trim()) return "Full name is required"
        if (value.length < 2) return "Full name must be at least 2 characters"
        if (!/^[a-zA-Z\s]+$/.test(value)) return "Letters only"
        return ""

      case "contactNumber":
        if (!value.trim()) return "Contact number is required"
        if (!/^\+?[\d\s\-()]{10,15}$/.test(value)) return "Invalid phone number"
        return ""

      case "emailAddress":
        if (!value.trim()) return "Email address is required"
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email"
        return ""

      case "message":
        if (!value.trim()) return "Message is required"
        if (value.length < 10) return "Min 10 characters"
        return ""

      default:
        return ""
    }
  }

  const handleInputChange = (e) => {
    const { name, value, files } = e.target

    // FIXED: image field handler
    if (name === "images" && files && files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        images: files,
      }))

      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result)
      reader.readAsDataURL(files[0])
      return
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    const error = validateField(name, value)
    setErrors((prev) => ({ ...prev, [name]: error }))
  }

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, images: [] }))
    setImagePreview(null)
  }

  const validateForm = () => {
    const newErrors = {
      fullName: validateField("fullName", formData.fullName),
      contactNumber: validateField("contactNumber", formData.contactNumber),
      emailAddress: validateField("emailAddress", formData.emailAddress),
      message: validateField("message", formData.message),
    }
    setErrors(newErrors)
    return !Object.values(newErrors).some((e) => e)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!validateForm()) {
      setIsSubmitting(false)
      return
    }

    try {
      const fd = new FormData()
      fd.append("fullName", formData.fullName)
      fd.append("contactNumber", formData.contactNumber)
      fd.append("emailAddress", formData.emailAddress)
      fd.append("message", formData.message)

      // FIXED — correct Loop + correct field name
      if (formData.images && formData.images.length > 0) {
        for (let i = 0; i < formData.images.length; i++) {
          fd.append("images", formData.images[i])
        }
      }

      const token = localStorage.getItem("jwtToken")

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:8080"}/api/contacts/new`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: fd,
        }
      )

      if (!response.ok) throw new Error("Failed to submit")

      setSubmitStatus("success")
      setShowSuccessModal(true)

      // Reset form
      setFormData({
        fullName: "",
        contactNumber: "",
        emailAddress: "",
        message: "",
        images: [],
      })

      setImagePreview(null)
    } catch (error) {
      setApiError(error.message)
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="wedding-contact-wrapper">
      <Header />

      <section className="banner-area">
        <div className="banner-text">
          <h1>We’d Love To Hear From You</h1>
          <p>Questions about a product, a pickup, or just want to say hi? Let’s chat.</p>
          <div className="hero-cta">
            <button
              type="button"
              className="hero-btn"
              onClick={() => window.scrollTo({ top: document.body.scrollHeight / 3, behavior: "smooth" })}
            >
              Plan Your Visit
            </button>
          </div>
        </div>
      </section>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="success-modal-overlay">
          <div className="success-modal">
            <div className="success-icon">✅</div>
            <h3>Message Sent Successfully!</h3>
            <p>We’ll get back to you as soon as possible.</p>
            <button className="modal-close-btn" onClick={() => setShowSuccessModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      <div className="page-container">
        <div className="layout-columns">
          <form onSubmit={handleSubmit} className="inquiry-form">
            <div className="form-header">
              <h2>Say Hello!</h2>
              <p>Share a little about what you’re looking for and we’ll reply within 1 business day.</p>
            </div>

            {apiError && <div className="error-message">{apiError}</div>}

            <div className="form-row">
              <div className="input-wrapper">
                <label htmlFor="fullName">
                  Full Name <span className="required">*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="Jane Doe"
                  className={errors.fullName && touched.fullName ? "error" : ""}
                  disabled={isSubmitting}
                />
                {errors.fullName && <p className="error-text">{errors.fullName}</p>}
              </div>

              <div className="input-wrapper">
                <label htmlFor="contactNumber">
                  Contact Number <span className="required">*</span>
                </label>
                <input
                  id="contactNumber"
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="+1 555 123 4567"
                  className={errors.contactNumber && touched.contactNumber ? "error" : ""}
                  disabled={isSubmitting}
                />
                {errors.contactNumber && <p className="error-text">{errors.contactNumber}</p>}
              </div>
            </div>

            <div className="input-wrapper">
              <label htmlFor="emailAddress">
                Email Address <span className="required">*</span>
              </label>
              <input
                id="emailAddress"
                type="email"
                name="emailAddress"
                value={formData.emailAddress}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="you@email.com"
                className={errors.emailAddress && touched.emailAddress ? "error" : ""}
                disabled={isSubmitting}
              />
              {errors.emailAddress && <p className="error-text">{errors.emailAddress}</p>}
            </div>

            <div className="input-wrapper">
              <label htmlFor="message">
                Message <span className="required">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Tell us about the items or support you need..."
                className={errors.message && touched.message ? "error" : ""}
                maxLength={500}
                disabled={isSubmitting}
              />
              <div className="message-help">
                <span className="character-count">{`${formData.message.length}/500`}</span>
                <span className="message-hint">Minimum 10 characters</span>
              </div>
              {errors.message && <p className="error-text">{errors.message}</p>}
            </div>

            <div className="input-wrapper">
              <label htmlFor="images">Upload Images (optional)</label>
              <div className="image-upload-container">
                <input
                  type="file"
                  id="images"
                  name="images"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="image-input"
                  multiple
                  disabled={isSubmitting}
                />
                <label htmlFor="images" className="image-upload-label">
                  {imagePreview ? (
                    <div className="image-preview-wrapper">
                      <img className="image-preview" src={imagePreview} alt="Preview" />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={handleRemoveImage}
                        disabled={isSubmitting}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="image-upload-placeholder">
                      <span className="upload-icon">📷</span>
                      <span>Drop up to 3 product photos</span>
                      <span className="upload-hint">PNG, JPG up to 5MB</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <button className="send-button" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="loading-spinner" />
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </button>
            <p className="submit-help">We typically reply within one business day.</p>
          </form>

          <section className="details-section">
            <div className="contact-intro">
              <h2>Contact Our Team</h2>
              <p>Reach out directly or book an appointment to visit the thrift studio.</p>
            </div>

            <div className="contact-grid">
              <article className="contact-card">
                <div className="card-header">
                  <span className="category-icon">🛍️</span>
                  <h3>Shopping Support</h3>
                </div>
                <p>Need help finding a piece or confirming availability? We’re on it.</p>
                <div className="contact-actions">
                  <a className="email-link" href="mailto:shop@thriftco.com">
                    shop@thriftco.com
                  </a>
                  <button
                    type="button"
                    className="copy-btn"
                    onClick={() => navigator.clipboard.writeText("shop@thriftco.com")}
                  >
                    Copy
                  </button>
                </div>
              </article>

              <article className="contact-card featured">
                <div className="card-header">
                  <span className="category-icon">🤝</span>
                  <h3>Donations & Partnerships</h3>
                </div>
                <p>Have items to donate or want to collaborate on a pop-up? Let’s talk.</p>
                <div className="contact-actions">
                  <a className="email-link" href="mailto:partners@thriftco.com">
                    partners@thriftco.com
                  </a>
                  <button
                    type="button"
                    className="copy-btn"
                    onClick={() => navigator.clipboard.writeText("partners@thriftco.com")}
                  >
                    Copy
                  </button>
                </div>
              </article>

              <article className="contact-card">
                <div className="card-header">
                  <span className="category-icon">📦</span>
                  <h3>Order Questions</h3>
                </div>
                <p>Tracking, exchanges, or custom requests—drop us a quick note.</p>
                <div className="contact-actions">
                  <a className="email-link" href="mailto:orders@thriftco.com">
                    orders@thriftco.com
                  </a>
                  <button
                    type="button"
                    className="copy-btn"
                    onClick={() => navigator.clipboard.writeText("orders@thriftco.com")}
                  >
                    Copy
                  </button>
                </div>
              </article>
            </div>

            <div className="quick-contact">
              <h3>Quick Contact</h3>
              <div className="quick-contact-items">
                <div className="quick-contact-item">
                  <span className="contact-icon">📞</span>
                  <div>
                    <strong>Call or Text</strong>
                    <a href="tel:+15551234567">+1 (555) 123-4567</a>
                    <span>Mon–Sat, 9am–6pm EST</span>
                  </div>
                </div>
                <div className="quick-contact-item">
                  <span className="contact-icon">📍</span>
                  <div>
                    <strong>Visit Us</strong>
                    <span>
                      214 Market Street, Suite 8
                      <br />
                      Brooklyn, NY
                    </span>
                  </div>
                </div>
                <div className="quick-contact-item">
                  <span className="contact-icon">💬</span>
                  <div>
                    <strong>Live Chat</strong>
                    <span>Weekdays 10am–5pm</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default ContactPage
