import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { venueService, imageService } from '../../services/api';
import { useUserSession } from '../../context/UserSessionContext';
import Header from '../users/Header';
import Footer from '../users/Footer';
import VenueMap from './VenueMap'; // Import the new Leaflet map component
import '../../styles/UserViewVenue.css';
import '../../styles/leaflet-map.css'; // Import the map styles

const UserViewVenue = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isUserLoggedIn } = useUserSession();
  const [venue, setVenue] = useState(null);
  const [venueImage, setVenueImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVenueDetails = async () => {
      if (!id) {
        setError('Invalid venue ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const venueData = await venueService.getVenue(id);
        setVenue(venueData);

        try {
          const imageBlob = await imageService.getImage(id);
          const imageUrl = URL.createObjectURL(imageBlob);
          setVenueImage(imageUrl);
        } catch (imgError) {
          console.warn('Could not load venue image:', imgError);
          setVenueImage('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80');
        }
      } catch (error) {
        console.error('Error fetching venue details:', error);
        if (error.response?.status === 404) {
          setError('Venue not found');
        } else if (error.response?.status === 401) {
          setError('Please log in to view venue details');
        } else {
          setError('Failed to load venue details. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVenueDetails();

    return () => {
      if (venueImage && venueImage.startsWith('blob:')) {
        URL.revokeObjectURL(venueImage);
      }
    };
  }, [id]);

  const handleBookVenue = () => {
    if (isUserLoggedIn) {
      navigate('/venue-booking', { state: { venueId: id, venueName: venue?.venueName } });
    } else {
      // Redirect to login page with return URL
      navigate('/login', { 
        state: { 
          from: `/venues/${id}`,
          message: 'Please log in to book this venue'
        } 
      });
    }
  };

  const handleBackToVenues = () => {
    navigate('/venues');
  };

  if (loading) {
    return (
      <div className="uvv-page">
        <Header />
        <div className="uvv-loading">
          <div className="uvv-loading__spinner"></div>
          <p>Loading venue details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="uvv-page">
        <Header />
        <div className="uvv-error">
          <div className="uvv-error__icon">⚠️</div>
          <h2 className="uvv-error__title">Oops! Something went wrong</h2>
          <p className="uvv-error__message">{error}</p>
          <div className="uvv-error__actions">
            <button onClick={handleBackToVenues} className="uvv-button--back">← Back to Venues</button>
            <button onClick={() => window.location.reload()} className="uvv-button--retry">Try Again</button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="uvv-page">
        <Header />
        <div className="uvv-error">
          <div className="uvv-error__icon">🏢</div>
          <h2 className="uvv-error__title">Venue Not Found</h2>
          <p className="uvv-error__message">The venue you're looking for doesn't exist or has been removed.</p>
          <button onClick={handleBackToVenues} className="uvv-button--back">← Back to Venues</button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="uvv-page">
      <Header />

      <div className="uvv-breadcrumb-container">
        <div className="uvv-breadcrumb">
          <Link to="/home" className="uvv-breadcrumb__link">Home</Link>
          <span className="uvv-breadcrumb__separator">›</span>
          <Link to="/venues" className="uvv-breadcrumb__link">Venues</Link>
          <span className="uvv-breadcrumb__separator">›</span>
          <span className="uvv-breadcrumb__current">{venue.venueName}</span>
        </div>
      </div>

      <div className="uvv-container">
        <div className="uvv-hero">
          <div className="uvv-hero__image-container">
            <img
              src={venueImage || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'}
              alt={venue.venueName}
              className="uvv-hero__image"
            />
            <div className="uvv-hero__overlay">
              <div className="uvv-hero__content">
                <h1 className="uvv-hero__title">{venue.venueName}</h1>
                <div className="uvv-hero__location">
                  <span className="uvv-hero__location-icon">📍</span>
                  {venue.location}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="uvv-content">
          <div className="uvv-main-info">
            <div className="uvv-stats">
              <div className="uvv-stats__item">
                <div className="uvv-stats__icon">👥</div>
                <div className="uvv-stats__content">
                  <div className="uvv-stats__label">Capacity</div>
                  <div className="uvv-stats__value">{venue.capacity} guests</div>
                </div>
              </div>

              <div className="uvv-stats__item">
                <div className="uvv-stats__icon">💰</div>
                <div className="uvv-stats__content">
                  <div className="uvv-stats__label">Price</div>
                  <div className="uvv-stats__value">NPR {venue.price}/hour</div>
                </div>
              </div>

              <div className="uvv-stats__item">
                <div className="uvv-stats__icon">⭐</div>
                <div className="uvv-stats__content">
                  <div className="uvv-stats__label">Rating</div>
                  <div className="uvv-stats__value">4.8/5</div>
                </div>
              </div>

              <div className="uvv-stats__item">
                <div className="uvv-stats__icon">📅</div>
                <div className="uvv-stats__content">
                  <div className="uvv-stats__label">Status</div>
                  <div className="uvv-stats__value">{venue.status || 'Available'}</div>
                </div>
              </div>
            </div>

            <div className="uvv-description">
              <h2 className="uvv-description__title">About This Venue</h2>
              <p className="uvv-description__text">
                {venue.description ||
                  `${venue.venueName} is a premium venue located in ${venue.location}. 
                  Perfect for weddings, corporate events, and special celebrations. 
                  With a capacity of ${venue.capacity} guests, this venue offers 
                  modern amenities and elegant décor to make your event memorable.`}
              </p>
            </div>

            {/* Updated Location Map Section using Leaflet */}
            {(venue.mapLocationUrl || venue.location) && (
              <div className="uvv-location">
                <h2 className="uvv-location__title">Location</h2>
                <div className="uvv-location__content">
                  <VenueMap
                    venueId={id}
                    mapLocationUrl={venue.mapLocationUrl}
                    venueName={venue.venueName}
                    location={venue.location}
                    height="350px"
                    showDirections={true}
                    zoom={16}
                  />
                  <div className="uvv-location__details">
                    <div className="uvv-location__address">
                      <span className="uvv-location__icon">📍</span>
                      <span>{venue.location}</span>
                    </div>
                    {venue.mapLocationUrl && (
                      <a 
                        href={venue.mapLocationUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="uvv-location__link"
                      >
                        View on Google Maps →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="uvv-features">
              <h2 className="uvv-features__title">Features & Amenities</h2>
              <div className="uvv-features__grid">
                <div className="uvv-features__item"><span className="uvv-features__icon">🅿️</span><span>Free Parking</span></div>
                <div className="uvv-features__item"><span className="uvv-features__icon">📶</span><span>WiFi Available</span></div>
                <div className="uvv-features__item"><span className="uvv-features__icon">❄️</span><span>Air Conditioning</span></div>
                <div className="uvv-features__item"><span className="uvv-features__icon">🎵</span><span>Sound System</span></div>
                <div className="uvv-features__item"><span className="uvv-features__icon">💡</span><span>Professional Lighting</span></div>
                <div className="uvv-features__item"><span className="uvv-features__icon">🍽️</span><span>Catering Available</span></div>
              </div>
            </div>

            <div className="uvv-contact">
              <h2 className="uvv-contact__title">Contact Information</h2>
              <div className="uvv-contact__details">
                <div className="uvv-contact__item"><span className="uvv-contact__icon">📧</span><span>info@{venue.venueName?.toLowerCase().replace(/\s+/g, '')}.com</span></div>
                <div className="uvv-contact__item"><span className="uvv-contact__icon">📞</span><span>+977-1-4567890</span></div>
                <div className="uvv-contact__item"><span className="uvv-contact__icon">🌐</span><span>www.{venue.venueName?.toLowerCase().replace(/\s+/g, '')}.com</span></div>
              </div>
            </div>
          </div>

          <div className="uvv-sidebar">
            <div className="uvv-booking">
              <div className="uvv-booking__header">
                <h3 className="uvv-booking__title">Book This Venue</h3>
                <div className="uvv-booking__price">
                  <span className="uvv-booking__price-value">NPR {venue.price}</span>
                  <span className="uvv-booking__price-unit">/hour</span>
                </div>
              </div>
              

              <div className="uvv-booking__content">
                <p className="uvv-booking__description">
                  {isUserLoggedIn 
                    ? 'Ready to book this amazing venue for your event?' 
                    : 'Log in to book this amazing venue for your event'}
                </p>
                <button onClick={handleBookVenue} className="uvv-booking__button">
                  {isUserLoggedIn ? 'Book Now' : 'Log in to Book'}
                </button>
                <div className="uvv-booking__note">
                  <small>* Final pricing may vary based on event requirements</small>
                  {!isUserLoggedIn && (
                    <div className="uvv-booking__login-note">
                      <small>You must be logged in to book venues</small>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="uvv-actions">
              <button onClick={handleBackToVenues} className="uvv-actions__button uvv-actions__button--secondary">← Back to Venues</button>
              <button onClick={() => window.print()} className="uvv-actions__button uvv-actions__button--secondary">🖨️ Print Details</button>
              <button
                onClick={() => navigator.share && navigator.share({
                  title: venue.venueName,
                  text: `Check out ${venue.venueName} - ${venue.location}`,
                  url: window.location.href
                })}
                className="uvv-actions__button uvv-actions__button--secondary"
              >
                📤 Share
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default UserViewVenue;
