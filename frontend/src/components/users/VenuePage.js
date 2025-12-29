import React, { useState, useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { venueService, imageService } from "../../services/api";
import "../../styles/VenuePage.css";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";


export default function VenuePage() {
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    guests: '',
    venueType: '',
    spacePreference: '',
    rating: ''
  });
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const navigate = useNavigate();
  const { addItem } = useCart();

  const triggerToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    window.clearTimeout(window.__thriftgood_toast_timer);
    window.__thriftgood_toast_timer = window.setTimeout(() => setShowToast(false), 2000);
  };

  useEffect(() => {
    let isMounted = true;  // to prevent state update if unmounted

    const fetchVenues = async () => {
      try {
        setLoading(true);
        const response = await venueService.listVenue();
        const venueList = Array.isArray(response) ? response : [];
        
        // Fetch images for venues
        const venuesWithImages = await Promise.all(
          venueList.map(async (venue, index) => {
            let imageUrl = '';
            try {
              const imageBlob = await imageService.getImage(venue.venue_id);
              imageUrl = URL.createObjectURL(imageBlob);
            } catch (imgErr) {
              console.error(`Error loading image for venue ${venue.venue_id}:`, imgErr);
              // fallback image if error
              imageUrl = `https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80`;
            }
            return {
              ...venue,
              image: imageUrl,
            };
          })
        );

        if (isMounted) {
          setVenues(venuesWithImages);
          setFilteredVenues(venuesWithImages);
          setError(null);
        }
      } catch (error) {
        console.error("Error fetching venues:", error);
        if (isMounted) setError("Failed to load venues. Please try again later.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchVenues();

    // Cleanup function to revoke blob URLs when component unmounts
    return () => {
      isMounted = false;
      venues.forEach(v => {
        if (v.image && v.image.startsWith('blob:')) {
          URL.revokeObjectURL(v.image);
        }
      });
    };
  }, []);

  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);

    let filtered = venues;

    if (newFilters.guests) {
      const guestCount = parseInt(newFilters.guests);
      filtered = filtered.filter(venue => parseInt(venue.capacity) >= guestCount);
    }

    if (newFilters.venueType && newFilters.venueType !== '') {
      filtered = filtered.filter(venue =>
        venue.venueName?.toLowerCase().includes(newFilters.venueType.toLowerCase())
      );
    }

    if (newFilters.rating && newFilters.rating !== '') {
      const minRating = parseFloat(newFilters.rating);
      filtered = filtered.filter(venue => (venue.rating || 4.5) >= minRating);
    }

    setFilteredVenues(filtered);
  };

  const handleSearch = () => {
    console.log("Search triggered with filters:", filters);
  };

  if (loading) {
    return (
      <div className="venue-page">
        <Header />
        <div className="container" style={{ paddingTop: '88px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', fontSize: '18px', color: '#666' }}>
          Loading Amazing Products...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="venue-page">
        <Header />
        <div className="container" style={{ paddingTop: '88px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '300px', fontSize: '18px', color: '#e74c3c', textAlign: 'center' }}>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#ffc107', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="venue-page">
      <Header />
      <div className="container" style={{ paddingTop: '96px', maxWidth: '1200px', margin: '0 auto', paddingLeft: '16px', paddingRight: '16px' }}>
        <div style={{ display: 'flex', gap: '20px' }}>
          {/* Left Sidebar Filters */}
          <aside style={{ width: '260px', flex: '0 0 260px' }}>
            <div style={{ fontWeight: 700, marginBottom: '10px', color: '#0f172a' }}>Search</div>
            <input
              type="text"
              placeholder="Search items..."
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
            />

            <div style={{ fontWeight: 700, margin: '14px 0 8px', color: '#0f172a' }}>Category</div>
            <select className="dropdown" value={filters.venueType} onChange={(e) => handleFilterChange('venueType', e.target.value)} style={{ width: '100%' }}>
              <option value="">All Categories</option>
              <option value="ballroom">Ballroom</option>
              <option value="garden">Garden</option>
              <option value="conference">Conference</option>
              <option value="banquet">Banquet</option>
            </select>

            <div style={{ fontWeight: 700, margin: '14px 0 8px', color: '#0f172a' }}>Size</div>
            <select className="dropdown" value={filters.guests} onChange={(e) => handleFilterChange('guests', e.target.value)} style={{ width: '100%' }}>
              <option value="">All Sizes</option>
              <option value="50">50+ Guests</option>
              <option value="100">100+ Guests</option>
              <option value="200">200+ Guests</option>
              <option value="500">500+ Guests</option>
            </select>

            <div style={{ fontWeight: 700, margin: '14px 0 8px', color: '#0f172a' }}>Condition</div>
            <select className="dropdown" value={filters.rating} onChange={(e) => handleFilterChange('rating', e.target.value)} style={{ width: '100%' }}>
              <option value="">All Conditions</option>
              <option value="4">4+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="5">5 Stars</option>
            </select>
          </aside>

          {/* Right Content */}
          <main style={{ flex: 1, minWidth: 0 }}>
            {/* Top bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ color: '#475569', fontSize: '14px' }}>
                Showing {filteredVenues.length} of {filteredVenues.length} items
              </div>
              <select style={{ border: '1px solid #e2e8f0', padding: '8px 10px', borderRadius: '8px', color: '#0f172a' }} defaultValue="newest">
                <option value="newest">Newest First</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
              </select>
            </div>

            {/* Grid */}
            {filteredVenues.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px', color: '#666', fontSize: '18px' }}>
                No venues found matching your criteria. Try adjusting your filters.
              </div>
            ) : (
              <div className="venue-grid">
                {filteredVenues.map((venue, index) => (
                  <div key={venue.venue_id || index} className="venue-card">
                    <div 
                      className="image-container" 
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/venues/${venue.venue_id}`)}
                    >
                      <img
                        src={venue.image || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"}
                        alt={venue.venueName || "Venue"}
                        className="venue-image"
                      />
                      <div className="explore-overlay">Explore</div>
                    </div>
                    <div className="venue-content">
                      <h3 className="venue-title">{venue.venueName || "Grand Ballroom"}</h3>
                      <p className="venue-location">{venue.description || "No description available"}</p>
                      <div className="venue-details">
                        {/* <span className="capacity-icon">👥</span> */}
                        {/* <span>Capacity: {venue.capacity || "500"} people</span> */}
                      </div>
                      <div className="price-row">
                        <span className="price">
                          NPR {venue.price || "15,000"}
                          <span className="price-unit"></span>
                        </span>
                      </div>
                      {/* <div className="stars">★★★★★</div> */}
                   <button
  className="add-to-cart-button"
  onClick={async (e) => {
    e.stopPropagation();

    const success = await addItem({
      venueId: venue.venue_id, // send only venueId
      quantity: 1
    });

    if (success) triggerToast("Added to cart");
    else triggerToast("Failed to add to cart. Please login.");
  }}
>
  Add to Cart
</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
      {showToast && (
        <div style={{ 
          position: "fixed", 
          right: 16, 
          bottom: 16, 
          background: "#16a34a", 
          color: "white", 
          padding: "12px 18px", 
          borderRadius: 8, 
          boxShadow: "0 8px 24px rgba(0,0,0,0.18)", 
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            width="20" 
            height="20"
          >
            <path d="M20 6L9 17l-5-5"></path>
          </svg>
          {toastMessage || "Added to cart"}
        </div>
      )}
    </div>
  );
}