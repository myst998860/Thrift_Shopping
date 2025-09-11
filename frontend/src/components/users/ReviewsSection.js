"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import "../../styles/ReviewsSection.css" 
import profileImage from "../../images/profile.webp";


export default function ReviewsSection() {
  const reviews = [
    {
      id: 1,
      name: "Guy Hawkins",
      handle: "@guyhawkins",
      text: "Impressed by the professionalism and attention to detail.",
      avatar: profileImage,
    },
    {
      id: 2,
      name: "Karla Lynn",
      handle: "@karlalynn98",
      text: "A seamless experience from start to finish. Highly recommend!",
      avatar: profileImage,
    },
    {
      id: 3,
      name: "Jane Cooper",
      handle: "@janecooper",
      text: "Reliable and trustworthy. Made my life so much easier!",
      avatar: profileImage,
    },
    {
      id: 4,
      name: "Robert Fox",
      handle: "@robertfox",
      text: "Outstanding service and results. Truly a game-changer for our business.",
      avatar: profileImage,
    },
    {
      id: 5,
      name: "Esther Howard",
      handle: "@estherh",
      text: "The best decision we made! Their team is incredibly supportive and knowledgeable.",
      avatar: profileImage,
    },
  ]

  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState(0) // 1 for next, -1 for prev
  const [isHovered, setIsHovered] = useState(false)

  // Auto-play functionality
  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(() => {
        setDirection(1)
        setActiveIndex((prevIndex) => (prevIndex === reviews.length - 1 ? 0 : prevIndex + 1))
      }, 5000) // 5 seconds delay
      return () => clearInterval(interval)
    }
  }, [reviews.length, isHovered])

  const handleDotClick = useCallback(
    (index) => {
      setDirection(index > activeIndex ? 1 : -1)
      setActiveIndex(index)
    },
    [activeIndex],
  )

  // Variants for the main review card content (text and name)
  const contentVariants = {
    enter: (direction) => ({
      y: 20,
      opacity: 0,
    }),
    center: {
      y: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      y: -20,
      opacity: 0,
    }),
  }

  // Function to get the three visible reviews
  const getVisibleReviews = useCallback(() => {
    const visible = []
    const totalReviews = reviews.length

    // Get the previous review
    const prevIndex = (activeIndex - 1 + totalReviews) % totalReviews
    visible.push(reviews[prevIndex])

    // Get the current (center) review
    visible.push(reviews[activeIndex])

    // Get the next review
    const nextIndex = (activeIndex + 1) % totalReviews
    visible.push(reviews[nextIndex])

    return visible
  }, [activeIndex, reviews])

  const visibleReviews = getVisibleReviews()

  return (
    <section className="reviews-section">
      <div className="reviews-header">
        <p className="reviews-subtitle">Testimonial</p>
        <h2 className="reviews-title">Transformative Client Experiences</h2>
      </div>

      <div
        className="carousel-container"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {visibleReviews.map((review, index) => {
          const isCenter = index === 1 // The middle review is the active one
          return (
            <motion.div
              key={review.id} // Key by review ID for content animation
              className={`review-card ${isCenter ? "review-card--active" : "review-card--side"}`}
              initial={false} // Disable initial animation for the card itself
              animate={isCenter ? "center" : "side"} // Animate based on position
              transition={{ duration: 0.3 }}
            >
              <div className="review-card-content">
                <div className="quote-icon"></div> {/* Custom quote icon */}
                <AnimatePresence mode="wait">
                  {isCenter && ( // Only animate content for the center card
                    <motion.p
                      key={review.id + "-text"} // Key for text animation
                      className="review-text"
                      variants={contentVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      custom={direction}
                      transition={{ duration: 0.3 }}
                    >
                      {review.text}
                    </motion.p>
                  )}
                  {!isCenter && ( // Static content for side cards
                    <p className="review-text">{review.text}</p>
                  )}
                </AnimatePresence>
              </div>
              <div className="reviewer-info">
                <div className="reviewer-avatar">
                  <img src={review.avatar || "/placeholder.svg"} alt={review.name} />
                </div>
                <div>
                  <AnimatePresence mode="wait">
                    {isCenter && ( // Only animate content for the center card
                      <motion.h3
                        key={review.id + "-name"} // Key for name animation
                        className="reviewer-name"
                        variants={contentVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        custom={direction}
                        transition={{ duration: 0.3, delay: 0.05 }}
                      >
                        {review.name}
                      </motion.h3>
                    )}
                    {!isCenter && ( // Static content for side cards
                      <h3 className="reviewer-name">{review.name}</h3>
                    )}
                  </AnimatePresence>
                  <p className="reviewer-handle">{review.handle}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="carousel-dots">
        {reviews.map((_, index) => (
          <button
            key={index}
            className={`carousel-dot ${index === activeIndex ? "carousel-dot--active" : ""}`}
            onClick={() => handleDotClick(index)}
            aria-label={`Go to review ${index + 1}`}
          ></button>
        ))}
      </div>
    </section>
  )
}
