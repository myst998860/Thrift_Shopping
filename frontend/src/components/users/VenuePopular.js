"use client"

import { useState, useEffect, useCallback } from "react"
import { venueService, imageService } from "../../services/api" // Update path as needed
import { useNavigate } from "react-router-dom"
import "../../styles/VenuePopular.css"

const VenuePopular = () => {
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [favorites, setFavorites] = useState(new Set())
  const navigate = useNavigate()

  const fetchPopularVenues = useCallback(async () => {
    let isMounted = true

    try {
      setLoading(true)
      setError(null)

      const response = await venueService.listVenue()
      const venueList = Array.isArray(response) ? response : []

      // Fetch images and transform venue data
      const venuesWithImages = await Promise.all(
        venueList.map(async (venue) => {
          let imageUrl = ""
          try {
            const imageBlob = await imageService.getImage(venue.venue_id)
            imageUrl = URL.createObjectURL(imageBlob)
          } catch (imgErr) {
            console.error(`Error loading image for venue ${venue.venue_id}:`, imgErr)
            imageUrl = `https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80`
          }

          return {
            ...venue,
            image: imageUrl,
          }
        }),
      )

      // Sort venues by rating
      const sortedVenues = venuesWithImages.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5))

      if (isMounted) {
        setVenues(sortedVenues)
      }
    } catch (error) {
      console.error("Error fetching popular venues:", error)
      if (isMounted) {
        setError("Failed to load popular venues. Please try again later.")
      }
    } finally {
      if (isMounted) {
        setLoading(false)
      }
    }

    return () => {
      isMounted = false
      venues.forEach((v) => {
        if (v.image && v.image.startsWith("blob:")) {
          URL.revokeObjectURL(v.image)
        }
      })
    }
  }, [venues])

  useEffect(() => {
    fetchPopularVenues()
  }, [])

  const toggleFavorite = (venueId) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(venueId)) {
        newFavorites.delete(venueId)
      } else {
        newFavorites.add(venueId)
      }
      return newFavorites
    })
  }

  const handleViewDetails = (venueId) => {
    navigate(`/venues/${venueId}`)
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating || 4.5)
    const hasHalfStar = (rating || 4.5) % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="popular-venues-star popular-venues-star-filled">
          ★
        </span>,
      )
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="popular-venues-star popular-venues-star-half">
          ★
        </span>,
      )
    }

    const emptyStars = 5 - Math.ceil(rating || 4.5)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="popular-venues-star popular-venues-star-empty">
          ☆
        </span>,
      )
    }

    return stars
  }

  if (loading) {
    return (
      <div className="popular-venues-container">
        <div className="popular-venues-header">
          <div className="popular-venues-skeleton popular-venues-skeleton-title"></div>
          <div className="popular-venues-skeleton popular-venues-skeleton-subtitle"></div>
        </div>

        <div className="popular-venues-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="popular-venues-card popular-venues-skeleton-card">
              <div className="popular-venues-skeleton popular-venues-skeleton-image"></div>
              <div className="popular-venues-content">
                <div className="popular-venues-skeleton popular-venues-skeleton-text-lg"></div>
                <div className="popular-venues-skeleton popular-venues-skeleton-text-sm"></div>
                <div className="popular-venues-skeleton popular-venues-skeleton-text-md"></div>
                <div className="popular-venues-skeleton popular-venues-skeleton-text-md"></div>
                <div className="popular-venues-skeleton popular-venues-skeleton-button"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="popular-venues-container">
        <div className="popular-venues-error-container">
          <div className="popular-venues-error-icon">⚠️</div>
          <p className="popular-venues-error-message">{error}</p>
          <button onClick={fetchPopularVenues} className="popular-venues-retry-button">
            <span className="popular-venues-retry-icon">🔄</span>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="popular-venues-container">
      {/* Simplified Header */}
      <div className="popular-venues-header">
        <h1 className="popular-venues-title">Popular Venues</h1>
        <p className="popular-venues-subtitle">
          Discover our most highly rated and frequently booked venues for your special events
        </p>
      </div>

      {/* Results Count */}
      <div className="popular-venues-results-info">
        <p>Showing {venues.length} popular venues</p>
      </div>

      {/* Venue Grid */}
      <div className="popular-venues-grid">
        {venues.map((venue) => (
          <div key={venue.venue_id} className="popular-venues-card">
            <div className="popular-venues-image-container">
              <img
                src={venue.image || "/placeholder.svg"}
                alt={venue.venueName}
                className="popular-venues-image"
                onError={(e) => {
                  e.target.src =
                    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
                }}
              />

              {/* Hover Overlay */}
              <div className="popular-venues-image-overlay">
                <button className="popular-venues-overlay-button" onClick={() => handleViewDetails(venue.venue_id)}>
                  👁️ View Details
                </button>
              </div>

              {/* Favorite Button */}
              <button
                className={`popular-venues-favorite-button ${favorites.has(venue.venue_id) ? "popular-venues-favorited" : ""}`}
                onClick={() => toggleFavorite(venue.venue_id)}
                title={favorites.has(venue.venue_id) ? "Remove from favorites" : "Add to favorites"}
              >
                {favorites.has(venue.venue_id) ? "❤️" : "🤍"}
              </button>

              {/* Category Badge */}
              {venue.category && <div className="popular-venues-category-badge">{venue.category}</div>}
            </div>

            <div className="popular-venues-content">
              <h3 className="popular-venues-venue-title">{venue.venueName}</h3>

              <div className="popular-venues-location">
                <span className="popular-venues-location-icon">📍</span>
                <span>{venue.location}</span>
              </div>

              <div className="popular-venues-capacity">
                <span className="popular-venues-capacity-icon">👥</span>
                <span>Capacity: {venue.capacity} people</span>
              </div>

              <div className="popular-venues-rating-price">
                <div className="popular-venues-rating-container">
                  <div className="popular-venues-stars">{renderStars(venue.rating)}</div>
                  <span className="popular-venues-rating-number">{venue.rating || 4.5}</span>
                </div>

                <div className="popular-venues-price-container">
                  <div className="popular-venues-price">NPR {venue.price?.toLocaleString()}</div>
                  <div className="popular-venues-price-unit">/hour</div>
                </div>
              </div>

              <button className="popular-venues-view-details-button" onClick={() => handleViewDetails(venue.venue_id)}>
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {venues.length === 0 && !loading && (
        <div className="popular-venues-no-results">
          <div className="popular-venues-no-results-icon">🔍</div>
          <h3>No venues available</h3>
          <p>Please check back later for new venues</p>
          <button onClick={fetchPopularVenues} className="popular-venues-retry-button">
            Refresh
          </button>
        </div>
      )}
    </div>
  )
}

export default VenuePopular
