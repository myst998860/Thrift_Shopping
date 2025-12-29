import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { venueService } from '../../services/api';
import { useUserSession } from '../../context/UserSessionContext';
import { useCart } from '../../context/CartContext';
import Header from '../users/Header';
import Footer from '../users/Footer';
import VenueMap from './VenueMap'; // Import the new Leaflet map component
import '../../styles/UserViewVenue.css';
import '../../styles/leaflet-map.css'; // Import the map styles

const UserViewVenue = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isUserLoggedIn } = useUserSession();
  const { addItem } = useCart();
  const [venue, setVenue] = useState(null);
  const [venueImages, setVenueImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);

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

        if (venueData.imageUrls && venueData.imageUrls.length > 0) {
          setVenueImages(venueData.imageUrls);
          setSelectedImage(venueData.imageUrls[0]); // first image default
        } else {
          const fallback = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';
          setVenueImages([fallback]);
          setSelectedImage(fallback);
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
  }, [id]);

  const handleAddToCart = async () => {
    if (!isUserLoggedIn) {
      navigate('/login', { 
        state: { 
          from: `/venues/${id}`,
          message: 'Please log in to add items to cart'
        } 
      });
      return;
    }

    if (!venue || !id) return;

    setAddingToCart(true);
    try {
      const success = await addItem({ venueId: parseInt(id), quantity: 1 });
      if (success) {
        alert('Venue added to cart successfully!');
      } else {
        alert('Failed to add venue to cart. Please try again.');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add venue to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isUserLoggedIn) {
      navigate('/login', { 
        state: { 
          from: `/venues/${id}`,
          message: 'Please log in to purchase this venue'
        } 
      });
      return;
    }

    if (!venue || !id) return;

    // Add to cart first, then navigate to checkout
    setAddingToCart(true);
    try {
      const success = await addItem({ venueId: parseInt(id), quantity: 1 });
      if (success) {
        navigate('/checkout');
      } else {
        alert('Failed to add venue to cart. Please try again.');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add venue to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBackToVenues = () => {
    navigate('/venues');
  };

  // Use the actual venue images array
  const thumbnailImages = venueImages.length > 0 ? venueImages : [];

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
        <div className="uvv-product-layout">
          {/* Left Side - Image Gallery */}
          <div className="uvv-product-images">
            <div className="uvv-product-image-main">
              <img
                src={selectedImage || (venueImages.length > 0 ? venueImages[0] : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80')}
                alt={venue.venueName}
                className="uvv-product-image"
              />
            </div>
            {thumbnailImages.length > 0 && (
              <div className="uvv-product-thumbnails">
                {thumbnailImages.map((thumb, index) => (
                  <button
                    key={index}
                    className={`uvv-thumbnail ${selectedImage === thumb ? 'uvv-thumbnail--active' : ''}`}
                    onClick={() => setSelectedImage(thumb)}
                  >
                    <img src={thumb} alt={`${venue.venueName} view ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Product Information */}
          <div className="uvv-product-info">
            <h1 className="uvv-product-title">{venue.venueName}</h1>
            
            {/* Condition & Category Tags */}
            <div className="uvv-product-tags">
              <span className="uvv-tag uvv-tag--condition">{venue.quality || 'Excellent'}</span>
              {/* <span className="uvv-tag uvv-tag--category">{venue.brand || 'Venue'}</span> */}
            </div>

            {/* Pricing */}
            <div className="uvv-product-pricing">
              <div className="uvv-price-current">NPR {venue.price}</div>
              <div className="uvv-price-original">NPR {Math.round(venue.price * 1.5)}</div>
              <span className="uvv-discount-badge">33% off</span>
            </div>

            {/* Description */}
            <div className="uvv-product-description">
              <p>
                {venue.description ||
                  `${venue.venueName} is a premium venue located in ${venue.location}. 
                  Perfect for weddings, corporate events, and special celebrations. 
                  This venue offers modern amenities and elegant décor to make your event memorable.`}
              </p>
            </div>

            {/* Product Details */}
            <div className="uvv-product-details">
              <h3 className="uvv-details-title">Product Details</h3>
              <div className="uvv-details-grid">
                <div className="uvv-detail-item">
                  <span className="uvv-detail-label">Brand:</span>
                  <span className="uvv-detail-value">{venue.brand || 'N/A'}</span>
                </div>
                {/* <div className="uvv-detail-item">
                  <span className="uvv-detail-label">Location:</span>
                  <span className="uvv-detail-value">{venue.location}</span>
                </div> */}
                <div className="uvv-detail-item">
                  <span className="uvv-detail-label">Status:</span>
                  <span className="uvv-detail-value">{venue.status || 'Available'}</span>
                </div>
                <div className="uvv-detail-item">
                  <span className="uvv-detail-label">Quality:</span>
                  <span className="uvv-detail-value">{venue.quality || 'Premium'}</span>
                </div>
              </div>
            </div>

            {/* Measurements / Specifications */}
            <div className="uvv-product-measurements">
              <h3 className="uvv-measurements-title">Specifications</h3>
              <div className="uvv-measurements-grid">
                <div className="uvv-measurement-item">
                  {/* <span className="uvv-measurement-label">Capacity:</span> */}
                  {/* <span className="uvv-measurement-value">{venue.brand || 'N/A'} guests</span> */}
                </div>
                <div className="uvv-measurement-item">
                  <span className="uvv-measurement-label">Price:</span>
                  <span className="uvv-measurement-value">NPR {venue.price}</span>
                </div>
                <div className="uvv-measurement-item">
                  {/* <span className="uvv-measurement-label">Location:</span> */}
                  <span className="uvv-measurement-value">{venue.location}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="uvv-product-actions">
              <button 
                onClick={handleAddToCart} 
                className="uvv-button uvv-button--cart"
                disabled={addingToCart}
              >
                <span className="uvv-button-icon">🛒</span>
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
              <button 
                onClick={handleBuyNow} 
                className="uvv-button uvv-button--buy"
                disabled={addingToCart}
              >
                Buy Now
              </button>
            </div>

            {/* Service Guarantees */}
            <div className="uvv-service-guarantees">
              <div className="uvv-guarantee-item">
                <span className="uvv-guarantee-icon">🚚</span>
                <span className="uvv-guarantee-text">Free shipping over NPR 50,000</span>
              </div>
              <div className="uvv-guarantee-item">
                <span className="uvv-guarantee-icon">↩️</span>
                <span className="uvv-guarantee-text">7-day returns</span>
              </div>
              <div className="uvv-guarantee-item">
                <span className="uvv-guarantee-icon">🛡️</span>
                <span className="uvv-guarantee-text">Quality guaranteed</span>
              </div>
            </div>

            {/* Seller Information */}
            <div className="uvv-seller-info">
              <div className="uvv-seller-item">
                <span className="uvv-seller-label">Sold by:</span>
                <span className="uvv-seller-value">ThriftGood Curated</span>
              </div>
              <div className="uvv-seller-item">
                <span className="uvv-seller-label">Listed:</span>
                <span className="uvv-seller-value">{new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Location Map Section */}
        {(venue.mapLocationUrl || venue.location) && (
          <div className="uvv-additional-info">
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
          </div>
        )}
      </div>
    </div>
  );
};

export default UserViewVenue;
