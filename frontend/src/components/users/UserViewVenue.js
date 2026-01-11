import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { venueService, imageService } from '../../services/api';
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
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedProductsLoading, setRelatedProductsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

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

  // Fetch related products (other venues)
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!venue) return;

      try {
        setRelatedProductsLoading(true);
        const response = await venueService.listVenue();
        const allVenues = Array.isArray(response) ? response : [];

        // Filter out current venue, only active ones, and get up to 4 related products
        const related = allVenues
          .filter(v => v.venue_id !== parseInt(id) && v.status?.toLowerCase() === 'active')
          .slice(0, 4);

        // Fetch images for related products
        const relatedWithImages = await Promise.all(
          related.map(async (v) => {
            let imageUrl = '';
            try {
              if (v.imageUrls && v.imageUrls.length > 0) {
                imageUrl = v.imageUrls[0];
              } else {
                const imageBlob = await imageService.getImage(v.venue_id);
                imageUrl = URL.createObjectURL(imageBlob);
              }
            } catch (imgErr) {
              imageUrl = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80';
            }
            return {
              ...v,
              image: imageUrl,
            };
          })
        );

        setRelatedProducts(relatedWithImages);
      } catch (error) {
        console.error('Error fetching related products:', error);
      } finally {
        setRelatedProductsLoading(false);
      }
    };

    if (venue) {
      fetchRelatedProducts();
    }
  }, [venue, id]);

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

            {/* Action Buttons */}
            <div className="uvv-product-actions">
              <button
                onClick={handleAddToCart}
                className="uvv-button uvv-button--cart"
                disabled={addingToCart || venue.status?.toLowerCase() === 'inactive'}
              >
                <span className="uvv-button-icon">🛒</span>
                {venue.status?.toLowerCase() === 'inactive' ? 'Sold Out' : (addingToCart ? 'Adding...' : 'Add to Cart')}
              </button>
              <button
                onClick={handleBuyNow}
                className="uvv-button uvv-button--buy"
                disabled={addingToCart || venue.status?.toLowerCase() === 'inactive'}
              >
                {venue.status?.toLowerCase() === 'inactive' ? 'Already Sold' : 'Buy Now'}
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

        {/* Product Information Tabs */}
        <div className="uvv-product-tabs-section">
          <div className="uvv-tabs">
            <button
              className={`uvv-tab ${activeTab === 'description' ? 'uvv-tab--active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button
              className={`uvv-tab ${activeTab === 'additional' ? 'uvv-tab--active' : ''}`}
              onClick={() => setActiveTab('additional')}
            >
              Additional Information
            </button>
            <button
              className={`uvv-tab ${activeTab === 'review' ? 'uvv-tab--active' : ''}`}
              onClick={() => setActiveTab('review')}
            >
              Review
            </button>
          </div>

          <div className="uvv-tab-content">
            {activeTab === 'description' && (
              <div className="uvv-tab-panel">
                <p className="uvv-description-text">
                  {venue.description ||
                    `${venue.venueName} is a premium venue located in ${venue.location}. 
                    Perfect for weddings, corporate events, and special celebrations. 
                    This venue offers modern amenities and elegant décor to make your event memorable. 
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`}
                </p>
              </div>
            )}

            {activeTab === 'additional' && (
              <div className="uvv-tab-panel">
                <table className="uvv-info-table">
                  <tbody>
                    <tr>
                      <td className="uvv-info-table-label">Brand</td>
                      <td className="uvv-info-table-value">{venue.brand || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="uvv-info-table-label">Size</td>
                      <td className="uvv-info-table-value">{venue.size || 'S, M, L, XL, XXL'}</td>
                    </tr>
                    <tr>
                      <td className="uvv-info-table-label">Color</td>
                      <td className="uvv-info-table-value">{venue.color || 'Brown, Grey, Green, Red, Blue'}</td>
                    </tr>
                    <tr>
                      <td className="uvv-info-table-label">Material</td>
                      <td className="uvv-info-table-value">{venue.material || 'Premium Quality'}</td>
                    </tr>
                    <tr>
                      <td className="uvv-info-table-label">Country of Origin</td>
                      <td className="uvv-info-table-value">{venue.countryOfOrigin || 'Nepal'}</td>
                    </tr>
                    <tr>
                      <td className="uvv-info-table-label">Status</td>
                      <td className="uvv-info-table-value">{venue.status || 'Available'}</td>
                    </tr>
                    <tr>
                      <td className="uvv-info-table-label">Quality</td>
                      <td className="uvv-info-table-value">{venue.quality || 'Premium'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'review' && (
              <div className="uvv-tab-panel">
                <div className="uvv-review-empty">
                  <p>No reviews yet. Be the first to review this product!</p>
                </div>
              </div>
            )}
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

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="uvv-related-products">
            <div className="uvv-related-products-header">
              <h2 className="uvv-related-products-title">Related Products</h2>
              <p className="uvv-related-products-subtitle">Explore Related Products</p>
            </div>
            <div className="uvv-related-products-grid">
              {relatedProducts.map((product) => {
                const discountPercent = Math.round(((product.price * 1.5 - product.price) / (product.price * 1.5)) * 100);
                const originalPrice = Math.round(product.price * 1.5);
                const rating = product.rating || 4.5;

                return (
                  <div
                    key={product.venue_id}
                    className="uvv-related-product-card"
                    onClick={() => navigate(`/venues/${product.venue_id}`)}
                  >
                    <div className="uvv-related-product-image-container">
                      <img
                        src={product.image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80'}
                        alt={product.venueName}
                        className="uvv-related-product-image"
                      />
                      {discountPercent > 0 && (
                        <div className="uvv-related-product-badge">{discountPercent}% off</div>
                      )}
                    </div>
                    <div className="uvv-related-product-info">
                      <div className="uvv-related-product-category">{product.category || 'Product'}</div>
                      <h3 className="uvv-related-product-name">{product.venueName || 'Product Name'}</h3>
                      <div className="uvv-related-product-rating">
                        <span className="uvv-related-product-stars">
                          {'★'.repeat(Math.floor(rating))}
                          {'☆'.repeat(5 - Math.floor(rating))}
                        </span>
                        <span className="uvv-related-product-rating-value">{rating.toFixed(1)}</span>
                      </div>
                      <div className="uvv-related-product-pricing">
                        <span className="uvv-related-product-price-current">NPR {product.price || '0'}</span>
                        {originalPrice > product.price && (
                          <span className="uvv-related-product-price-original">NPR {originalPrice}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default UserViewVenue;
