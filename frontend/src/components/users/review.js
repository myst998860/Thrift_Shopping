"use client"

import { useState, useEffect } from "react"

import Header from "./Header"
import Footer from "./Footer"
import "../../styles/review.css" 

// Mock reviews data
const initialReviews = [
  {
    id: 1,
    name: "Sarah Johnson",
    rating: 5,
    comment:
      "Absolutely fantastic service! The team helped us organize our corporate event flawlessly. Every detail was perfectly managed, and our guests were thoroughly impressed. The venue booking process was seamless, and the staff was incredibly professional throughout.",
    date: "December 15, 2024",
  },
  {
    id: 2,
    name: "Michael Chen",
    rating: 4,
    comment:
      "Great experience overall. The event management system made it easy to coordinate our wedding reception. The only minor issue was a slight delay in the initial setup, but the team quickly resolved it. Would definitely recommend for large events.",
    date: "December 10, 2024",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    rating: 5,
    comment:
      "Outstanding service from start to finish! The platform is user-friendly and the customer support team is incredibly responsive. They helped us manage a multi-day conference with over 500 attendees. Everything went smoothly!",
    date: "December 8, 2024",
  },
  {
    id: 4,
    name: "David Thompson",
    rating: 4,
    comment:
      "Very satisfied with the service. The venue options were diverse and the booking process was straightforward. The event coordination team was professional and attentive to our needs. Will use again for future events.",
    date: "December 5, 2024",
  },
  {
    id: 5,
    name: "Lisa Wang",
    rating: 5,
    comment:
      "Exceptional experience! The team went above and beyond to ensure our charity gala was a success. The attention to detail and proactive communication made the entire process stress-free. Highly recommended!",
    date: "December 1, 2024",
  },
]


// Star Icon Component
function StarIcon({ filled }) {
  return (
    <svg
      className={`review-star-icon ${filled ? "review-star-filled" : "review-star-empty"}`}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  )
}

// User Icon Component
function UserIcon() {
  return (
    <svg className="review-user-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  )
}

// Review Form Component
function ReviewForm({ onSubmitReview }) {
  const [formData, setFormData] = useState({
    name: "",
    rating: 0,
    comment: "",
  })
  const [hoveredRating, setHoveredRating] = useState(0)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (formData.rating === 0) {
      newErrors.rating = "Please select a rating"
    }

    if (!formData.comment.trim()) {
      newErrors.comment = "Comment is required"
    } else if (formData.comment.trim().length < 10) {
      newErrors.comment = "Comment must be at least 10 characters long"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (validateForm()) {
      setIsSubmitting(true)

      // Simulate API call delay for better animation effect
      await new Promise((resolve) => setTimeout(resolve, 1000))

      onSubmitReview({
        name: formData.name.trim(),
        rating: formData.rating,
        comment: formData.comment.trim(),
      })

      // Show success state
      setSubmitSuccess(true)

      // Reset form after success animation
      setTimeout(() => {
        setFormData({ name: "", rating: 0, comment: "" })
        setErrors({})
        setIsSubmitting(false)
        setSubmitSuccess(false)
      }, 1500)
    }
  }

  const handleRatingClick = (rating) => {
    setFormData((prev) => ({ ...prev, rating }))
    if (errors.rating) {
      setErrors((prev) => ({ ...prev, rating: "" }))
    }
  }

  const getCharacterCountClass = () => {
    const length = formData.comment.length
    if (length > 450) return "review-character-count review-count-danger"
    if (length > 400) return "review-character-count review-count-warning"
    return "review-character-count"
  }

  return (
    <div className="review-submission-card">
      <div className="review-submission-header">
        <h2 className="review-submission-title">Submit Your Review</h2>
      </div>
      <div className="review-submission-content">
        <form onSubmit={handleSubmit} className="review-submission-form">
          <div className="review-input-group">
            <label htmlFor="name" className="review-input-label">
              Your Name
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, name: e.target.value }))
                if (errors.name) setErrors((prev) => ({ ...prev, name: "" }))
              }}
              placeholder="Enter your full name"
              className={`review-text-input ${errors.name ? "review-input-error" : ""}`}
              disabled={isSubmitting}
            />
            {errors.name && <p className="review-error-message">{errors.name}</p>}
          </div>

          <div className="review-input-group">
            <label className="review-input-label">Rating</label>
            <div className="review-rating-container">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="review-star-button"
                  disabled={isSubmitting}
                >
                  <StarIcon filled={star <= (hoveredRating || formData.rating)} />
                </button>
              ))}
              <span className={`review-rating-text ${formData.rating > 0 ? "review-rating-selected" : ""}`}>
                {formData.rating > 0 ? `${formData.rating} star${formData.rating !== 1 ? "s" : ""}` : "Select rating"}
              </span>
            </div>
            {errors.rating && <p className="review-error-message">{errors.rating}</p>}
          </div>

          <div className="review-input-group">
            <label htmlFor="comment" className="review-input-label">
              Your Review
            </label>
            <textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, comment: e.target.value }))
                if (errors.comment) setErrors((prev) => ({ ...prev, comment: "" }))
              }}
              placeholder="Share your experience with our event management services..."
              rows={4}
              className={`review-textarea-input ${errors.comment ? "review-input-error" : ""}`}
              maxLength={500}
              disabled={isSubmitting}
            />
            <p className={getCharacterCountClass()}>{formData.comment.length}/500 characters</p>
            {errors.comment && <p className="review-error-message">{errors.comment}</p>}
          </div>

          <button
            type="submit"
            className={`review-submit-button ${submitSuccess ? "review-submit-success" : ""}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : submitSuccess ? "Review Submitted!" : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  )
}

// Review List Component
function ReviewList({ reviews }) {
  const [newReviewIds, setNewReviewIds] = useState(new Set())

  useEffect(() => {
    // Track new reviews for highlighting
    if (reviews.length > 0) {
      const latestReview = reviews[0]
      if (latestReview && !newReviewIds.has(latestReview.id)) {
        setNewReviewIds((prev) => new Set([...prev, latestReview.id]))

        // Remove highlight after animation
        setTimeout(() => {
          setNewReviewIds((prev) => {
            const updated = new Set(prev)
            updated.delete(latestReview.id)
            return updated
          })
        }, 2000)
      }
    }
  }, [reviews, newReviewIds])

  const renderStars = (rating) => {
    return (
      <div className="review-stars-display">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon key={star} filled={star <= rating} />
        ))}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="review-empty-state">
        <div className="review-empty-icon">
          <StarIcon filled={false} />
        </div>
        <h3>No Reviews Yet</h3>
        <p>Be the first to share your experience!</p>
      </div>
    )
  }

  return (
    <div className="review-display-container">
      <h2 className="review-display-title">
        Customer Reviews (<span className="review-total-count">{reviews.length}</span>)
      </h2>
      <div className="review-display-grid">
        {reviews.map((review, index) => (
          <div
            key={review.id}
            className={`review-item-card ${newReviewIds.has(review.id) ? "review-item-new" : ""}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="review-item-content">
              <div className="review-item-header">
                <div className="review-user-avatar">
                  <UserIcon />
                </div>
                <div className="review-item-details">
                  <div className="review-item-meta">
                    <div>
                      <h3 className="review-author-name">{review.name}</h3>
                      <p className="review-item-date">{review.date}</p>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  <p className="review-item-comment">{review.comment}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Main Reviews Page Component
export default function ReviewsPage() {
  const [reviews, setReviews] = useState(initialReviews)

  const handleSubmitReview = (newReview) => {
    const review = {
      ...newReview,
      id: Date.now(), // Simple ID generation for demo
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    }

    // Add new review to the beginning of the list
    setReviews((prev) => [review, ...prev])
  }

  return (
    <div className="review-system-page">
      
      <Header />
      

      <main className="review-system-main">
        <div className="review-system-container">
          {/* Page Header */}
          <div className="review-system-header">
            <h1 className="review-system-title">Event Reviews</h1>
            <p className="review-system-description">
              Share your experience with our event management services and read what other customers have to say about
              their events.
            </p>
          </div>

          {/* Review Form Section */}
          <div className="review-system-form-section">
            <ReviewForm onSubmitReview={handleSubmitReview} />
          </div>

          {/* Reviews List Section */}
          <div className="review-system-reviews-section">
            <ReviewList reviews={reviews} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
