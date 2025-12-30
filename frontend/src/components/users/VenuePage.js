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
    category: '',
  size: '',
  brand: '',
  rating: '',
  price: ''
  });
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();
  const { addItem } = useCart();

  const itemsPerPage = 12; // 4 columns × 3 rows

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
  setCurrentPage(1);

  let filtered = [...venues];

  // CATEGORY filter
  if (newFilters.category) {
    filtered = filtered.filter(
      v => v.category?.toLowerCase() === newFilters.category.toLowerCase()
    );
  }

  // SIZE filter
  if (newFilters.size) {
    filtered = filtered.filter(
      v => v.size?.toLowerCase() === newFilters.size.toLowerCase()
    );
  }

  // BRAND filter
  if (newFilters.brand) {
    filtered = filtered.filter(
      v => v.brand?.toLowerCase().includes(newFilters.brand.toLowerCase())
    );
  }

  // CONDITION / RATING filter (optional fallback)
  if (newFilters.rating) {
    const minRating = Number(newFilters.rating);
    filtered = filtered.filter(
      v => (v.rating ?? 5) >= minRating
    );
  }

  // PRICE ✅
  if (newFilters.price) {
    filtered = filtered.filter(v => {
      const price = Number(v.price) || 0;

      if (newFilters.price === 'low') return price < 5000;
      if (newFilters.price === 'medium') return price >= 5000 && price <= 10000;
      if (newFilters.price === 'high') return price > 50000;

      return true;
    });
  }

  setFilteredVenues(filtered);
};

  // Calculate pagination
  const totalPages = Math.ceil(filteredVenues.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVenues = filteredVenues.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Extract unique categories from venues
  const uniqueCategories = [...new Set(
    venues
      .map(v => v.category)
      .filter(cat => cat && cat.trim() !== "")
  )];

  return (
    <div className="venue-page">
      <Header />
      
      {/* Banner Image Section */}
      <div className="shop-banner">
        <img 
          src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1920&q=80" 
          alt="Shop Banner" 
          className="shop-banner-image"
        />
        <div className="shop-banner-overlay">
          <div className="shop-banner-content">
            {/* Breadcrumb */}
            <div className="shop-breadcrumb">
              <span>Home</span>
              <span className="breadcrumb-separator"> &gt; </span>
              <span className="breadcrumb-current">Shop</span>
            </div>
            {/* Page Title */}
            <h1 className="shop-title">Shop</h1>
          </div>
        </div>
      </div>

      <div className="shop-container" style={{ paddingTop: '40px', maxWidth: '1400px', margin: '0 auto', paddingLeft: '20px', paddingRight: '20px' }}>

        {/* Top bar with sorting and layout options */}
        <div className="shop-top-bar">
          <div className="shop-results">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredVenues.length)} of {filteredVenues.length} items
          </div>
          <div className="shop-controls">
            <select className="shop-sort" defaultValue="newest">
              <option value="newest">Default Sorting</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="name">Name A-Z</option>
            </select>
            <div className="layout-icons">
              <button className="layout-icon active">☰</button>
              <button className="layout-icon">☷</button>
              <button className="layout-icon">☰</button>
            </div>
          </div>
        </div>

        {/* Horizontal Filter Bar */}
        <div className="shop-filter-bar">
          <div className="filter-dropdown">
            <span className="filter-label">Filter by</span>
            <select className="filter-select" value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)}>
              <option value="">All</option>
              {uniqueCategories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="filter-dropdown">
            <span className="filter-label">Categories</span>
            <select className="filter-select" value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)}>
              <option value="">All Categories</option>
                   {/* <option value="Vintage">Vintage</option>
                <option value="Classic">Classic</option>
                <option value="Retro">Retro</option>
                <option value="Brand">Brand</option> */}
              {uniqueCategories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="filter-dropdown">
            <span className="filter-label">Size</span>
            <select className="filter-select" value={filters.size} onChange={(e) => handleFilterChange('size', e.target.value)}>
              <option value="">All Sizes</option>
                  <option value="XL">XL</option>
                <option value="L">L</option>
                <option value="M">M</option>
                <option value="S">S</option>
            </select>
          </div>

          <div className="filter-dropdown">
            <span className="filter-label">Condition</span>
            <select className="filter-select" value={filters.rating} onChange={(e) => handleFilterChange('rating', e.target.value)}>
              <option value="">All Conditions</option>
              <option value="4">4+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="5">5 Stars</option>
            </select>
          </div>

          <div className="filter-dropdown">
            <span className="filter-label">Price</span>
            <select className="filter-select" value={filters.price} onChange={(e) => handleFilterChange('price', e.target.value)}>
              <option value="">All Prices</option>
              <option value="low">Under NPR 5,000</option>
              <option value="medium">NPR 5,000 - 10,000</option>
              <option value="high">Over NPR 50,000</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {filteredVenues.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#666', fontSize: '18px' }}>
            No venues found matching your criteria. Try adjusting your filters.
          </div>
        ) : (
          <div className="shop-grid">
            {currentVenues.map((venue, index) => (
              <div key={venue.venue_id || index} className="shop-product-card">
                <div 
                  className="shop-product-image-container" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/venues/${venue.venue_id}`)}
                >
                  <img
                    src={venue.image || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"}
                    alt={venue.venueName || "Venue"}
                    className="shop-product-image"
                  />
                  <div className="shop-product-overlay">
                    <button
                      className="shop-add-to-cart-btn"
                      onClick={async (e) => {
                        e.stopPropagation();
                        const success = await addItem({
                          venueId: venue.venue_id,
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
                <div className="shop-product-info">
                  <h3 className="shop-product-name">{venue.venueName || "Product Name"}</h3>
                  <div className="shop-product-price">NPR {venue.price || "15,000"}</div>
                  <div className="shop-product-colors">
                    <span className="color-dot" style={{ backgroundColor: '#4A90E2' }}></span>
                    <span className="color-dot" style={{ backgroundColor: '#E94B3C' }}></span>
                    <span className="color-dot" style={{ backgroundColor: '#F5A623' }}></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination - Only show if there are more than 12 items */}
        {totalPages > 1 && (
          <div className="shop-pagination">
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 3) {
                pageNum = i + 1;
              } else if (currentPage === 1) {
                pageNum = i + 1;
              } else if (currentPage === totalPages) {
                pageNum = totalPages - 2 + i;
              } else {
                pageNum = currentPage - 1 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            {currentPage < totalPages && (
              <button
                className="pagination-btn pagination-next"
                onClick={() => handlePageChange(currentPage + 1)}
              >
                →
              </button>
            )}
          </div>
        )}
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