import React, { useState, useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import PopularVenues from "./PopularVenues";
import HeroSection from "./HeroSection";
import { venueService, imageService } from "../../services/api";
import "../../styles/VenuePage.css";
import { useNavigate } from "react-router-dom";


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

  const navigate = useNavigate();

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
        <HeroSection />
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', fontSize: '18px', color: '#666' }}>
          Loading venues...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="venue-page">
        <Header />
        <HeroSection />
        <div className="container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '300px', fontSize: '18px', color: '#e74c3c', textAlign: 'center' }}>
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
      <HeroSection />
      <div className="container">
        {/* Filter Section */}
        <div className="filter-section">
          <select
            className="dropdown"
            value={filters.guests}
            onChange={(e) => handleFilterChange('guests', e.target.value)}
          >
            <option value="">No. of Guests</option>
            <option value="50">50+ Guests</option>
            <option value="100">100+ Guests</option>
            <option value="200">200+ Guests</option>
            <option value="500">500+ Guests</option>
          </select>

          <select
            className="dropdown"
            value={filters.venueType}
            onChange={(e) => handleFilterChange('venueType', e.target.value)}
          >
            <option value="">Venue Type</option>
            <option value="ballroom">Ballroom</option>
            <option value="garden">Garden</option>
            <option value="conference">Conference</option>
            <option value="banquet">Banquet</option>
          </select>

          <select
            className="dropdown"
            value={filters.spacePreference}
            onChange={(e) => handleFilterChange('spacePreference', e.target.value)}
          >
            <option value="">Space Preference</option>
            <option value="indoor">Indoor</option>
            <option value="outdoor">Outdoor</option>
            <option value="mixed">Indoor/Outdoor</option>
          </select>

          <select
            className="dropdown"
            value={filters.rating}
            onChange={(e) => handleFilterChange('rating', e.target.value)}
          >
            <option value="">Rating</option>
            <option value="4">4+ Stars</option>
            <option value="4.5">4.5+ Stars</option>
            <option value="5">5 Stars</option>
          </select>

          <button className="search-button" onClick={handleSearch}>
            Search
          </button>
        </div>

        {/* Venues Section */}
        <div className="section-header">
          <h2 className="section-title">Venues</h2>
          <a href="/" className="view-all-link">
            View All ({filteredVenues.length})
          </a>
        </div>

        {filteredVenues.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#666', fontSize: '18px' }}>
            No venues found matching your criteria. Try adjusting your filters.
          </div>
        ) : (
          <div className="venue-grid">
            {filteredVenues.map((venue, index) => (
              <div key={venue.venue_id || index} className="venue-card">
              <div className="image-container">
                <img
                  src={venue.image || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"}
                  alt={venue.venueName || "Venue"}
                  className="venue-image"
                />
                <div className="explore-overlay">Explore</div>
              </div>
              <div className="venue-content">
                <h3 className="venue-title">{venue.venueName || "Grand Ballroom"}</h3>
                <p className="venue-location">{venue.location || "Kathmandu, Nepal"}</p>
                <div className="venue-details">
                  <span className="capacity-icon">👥</span>
                  <span>Capacity: {venue.capacity || "500"} people</span>
                </div>
                <div className="price-row">
                  <span className="price">
                    NPR {venue.price || "15,000"}
                    <span className="price-unit">/hour</span>
                  </span>
                </div>
                <div className="stars">★★★★★</div>
                <button
                  className="view-details-button"
                  onClick={() => navigate(`/venues/${venue.venue_id}`)}
                >
                  View Details
                </button>
              </div>
            </div>
            
            ))}
          </div>
        )}
      </div>
      <PopularVenues />
      <Footer />
    </div>
  );
}