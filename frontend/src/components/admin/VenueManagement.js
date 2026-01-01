import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { venueService,imageService } from '../../services/api';
import '../../styles/admin/VenueManagement.css';


const VenueManagement = () => {
  const [venues, setVenues] = useState([]);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const menuRef = useRef();
  const navigate = useNavigate();
  const [images, setImages] = useState({});

  // Close menu on click outside
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpenId(null);
      }
    }
    if (menuOpenId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpenId]);

  const handleDelete = async (id) => {
  console.log("Deleting venue id:", id);
  try {
    const response = await venueService.deleteVenue(id);
    console.log("Delete response:", response);
    setVenues(prev => prev.filter(v => v.venue_id !== id));
    alert("Venue deleted successfully!");
  } catch (err) {
    console.error("Failed to delete:", err);
    alert("Failed to delete venue. Please try again.");
  }
};

  const handleDeactivate = (id) => {
    setVenues((prev) => prev.map((venue) =>
      venue.id === id ? { ...venue, status: 'Inactive' } : venue
    ));
    setMenuOpenId(null);
  };

const handleAdd = (id) => {
     navigate('/admin/venues/add');
    setMenuOpenId(null); 
  };


  const handleEditVenue = (venue) => {
  if (!venue?.venue_id) {
    console.error("Invalid venue ID:", venue?.venue_id);
    return;
  }
  console.log("Navigating to edit Venue with ID:", venue.venue_id);
  navigate(`/admin/venues/edit/${venue.venue_id}`);
};

 const handleViewVenue = (venue) => {
  if (!venue?.venue_id) {
    console.error("Invalid venue ID:", venue?.venue_id);
    return;
  }
  console.log("Navigating to edit Venue with ID:", venue.venue_id);
  navigate(`/admin/venues/${venue.venue_id}`);
};



useEffect(() => {
    const fetchVenues = async () => {
    setLoading(true);
   try {
        const response = await venueService.listVenue();
        console.log("API venues response:", response);


        
        // Map venues and set initial state
        const mappedVenues = response.map(v => ({
          venue_id: v.venue_id,
          venueName: v.venueName,
          partnerName: v.partnerName,
          location: v.location,
          category: v.category,
          price: v.price,
          brand: v.brand,
          minBookingHours: v.minBookingHours,
          capacity: v.capacity,
          openingTime: v.openingTime,
          closingTime: v.closingTime,
          status: v.status,
          description: v.description,
          amenities: v.amenities || [],
          bookingCount: v.bookingCount ?? (v.bookings ? v.bookings.length : 0),
        }));
        console.log("Mapped venues with bookingCount:", mappedVenues);


        setVenues(mappedVenues);

        // Fetch images one by one (or in parallel)
        const imagePromises = mappedVenues.map(async (venue) => {
          try {
            const imageBlob = await imageService.getImage(venue.venue_id);
            return {
              venue_id: venue.venue_id,
              imageUrl: URL.createObjectURL(imageBlob),
            };
          } catch {
            return {
              venue_id: venue.venue_id,
              imageUrl: null, 
            };
          }
        });

        const imagesArray = await Promise.all(imagePromises);

        // Convert to an object for easy access
        const imagesMap = {};
        imagesArray.forEach(({ venue_id, imageUrl }) => {
          imagesMap[venue_id] = imageUrl;
        });

        setImages(imagesMap);

      } catch (err) {
        console.error(err);
        setError('Failed to fetch venues or images.');
        setVenues([]);
        setImages({});
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, []);


  // Filter venues based on search term
  const filteredVenues = venues.filter(venue => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      venue.venueName?.toLowerCase().includes(searchLower) ||
      venue.partnerName?.toLowerCase().includes(searchLower) ||
      venue.category?.toLowerCase().includes(searchLower) ||
      venue.brand?.toLowerCase().includes(searchLower)
    );
  });

  const StatusBadge = ({ status }) => {
    const isActive = status?.toLowerCase() === 'active';
    return (
      <span className={`status-badge ${isActive ? 'status-active' : 'status-inactive'}`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  // Get category color based on category name
  const getCategoryColor = (category) => {
    if (!category) return { bg: '#f3f4f6', text: '#6b7280' };
    
    const categoryLower = category.toLowerCase();
    
    // Define color schemes for different categories
    const colorMap = {
      // Electronics
      'electronics': { bg: '#dbeafe', text: '#1e40af' },
      'electronic': { bg: '#dbeafe', text: '#1e40af' },
      'phone': { bg: '#dbeafe', text: '#1e40af' },
      'mobile': { bg: '#dbeafe', text: '#1e40af' },
      'computer': { bg: '#dbeafe', text: '#1e40af' },
      'laptop': { bg: '#dbeafe', text: '#1e40af' },
      
      // Clothing
      'clothing': { bg: '#fce7f3', text: '#9f1239' },
      'clothes': { bg: '#fce7f3', text: '#9f1239' },
      'apparel': { bg: '#fce7f3', text: '#9f1239' },
      'fashion': { bg: '#fce7f3', text: '#9f1239' },
      'shirt': { bg: '#fce7f3', text: '#9f1239' },
      'dress': { bg: '#fce7f3', text: '#9f1239' },
      
      // Furniture
      'furniture': { bg: '#fef3c7', text: '#92400e' },
      'furnishing': { bg: '#fef3c7', text: '#92400e' },
      'chair': { bg: '#fef3c7', text: '#92400e' },
      'table': { bg: '#fef3c7', text: '#92400e' },
      'sofa': { bg: '#fef3c7', text: '#92400e' },
      
      // Books
      'book': { bg: '#e9d5ff', text: '#6b21a8' },
      'books': { bg: '#e9d5ff', text: '#6b21a8' },
      'literature': { bg: '#e9d5ff', text: '#6b21a8' },
      
      // Sports
      'sports': { bg: '#d1fae5', text: '#065f46' },
      'sport': { bg: '#d1fae5', text: '#065f46' },
      'fitness': { bg: '#d1fae5', text: '#065f46' },
      'gym': { bg: '#d1fae5', text: '#065f46' },
      
      // Toys
      'toy': { bg: '#fde68a', text: '#78350f' },
      'toys': { bg: '#fde68a', text: '#78350f' },
      'games': { bg: '#fde68a', text: '#78350f' },
      
      // Kitchen
      'kitchen': { bg: '#fed7aa', text: '#9a3412' },
      'cooking': { bg: '#fed7aa', text: '#9a3412' },
      'utensil': { bg: '#fed7aa', text: '#9a3412' },
      
      // Home & Garden
      'home': { bg: '#cffafe', text: '#164e63' },
      'garden': { bg: '#cffafe', text: '#164e63' },
      'decoration': { bg: '#cffafe', text: '#164e63' },
      
      // Vehicles
      'vehicle': { bg: '#e0e7ff', text: '#3730a3' },
      'car': { bg: '#e0e7ff', text: '#3730a3' },
      'bike': { bg: '#e0e7ff', text: '#3730a3' },
      'automobile': { bg: '#e0e7ff', text: '#3730a3' },
    };

    // Check for exact match first
    if (colorMap[categoryLower]) {
      return colorMap[categoryLower];
    }

    // Check for partial match
    for (const [key, colors] of Object.entries(colorMap)) {
      if (categoryLower.includes(key) || key.includes(categoryLower)) {
        return colors;
      }
    }

    // Default color based on category hash for consistent colors
    const hash = categoryLower.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    const defaultColors = [
      { bg: '#dbeafe', text: '#1e40af' }, // Blue
      { bg: '#fce7f3', text: '#9f1239' }, // Pink
      { bg: '#fef3c7', text: '#92400e' }, // Yellow
      { bg: '#e9d5ff', text: '#6b21a8' }, // Purple
      { bg: '#d1fae5', text: '#065f46' }, // Green
      { bg: '#fde68a', text: '#78350f' }, // Amber
      { bg: '#fed7aa', text: '#9a3412' }, // Orange
      { bg: '#cffafe', text: '#164e63' }, // Cyan
      { bg: '#e0e7ff', text: '#3730a3' }, // Indigo
      { bg: '#f3e8ff', text: '#7c3aed' }, // Violet
    ];
    
    return defaultColors[hash % defaultColors.length];
  };

  if (loading) {
    return (
      <div className="venue-management-container">
        <div className="loading-message">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="venue-management-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="venue-management-container">
      <div className="venue-management-header">
        <div>
          <h1 className="venue-management-title">Product Management</h1>
          <p className="venue-management-subtitle">Manage all Products on the platform</p>
        </div>
        <button onClick={handleAdd} className="add-product-btn">
          <span>+</span> Add New Product
        </button>
      </div>

      <div className="venue-management-content">
        <div className="products-count-top">
          {filteredVenues.length} {filteredVenues.length === 1 ? 'Product' : 'Products'}
        </div>
        <div className="search-section">
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search product by name, partner, category, or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="products-table-container">
          {filteredVenues.length === 0 ? (
            <div className="no-products">
              {searchTerm ? 'No products found matching your search.' : 'No products available.'}
            </div>
          ) : (
            <table className="products-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product Image</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Brand</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVenues.map((venue) => (
                  <tr key={venue.venue_id}>
                    <td className="venue-id-cell">{venue.venue_id}</td>
                    <td className="venue-image-cell">
                      {images[venue.venue_id] ? (
                        <img
                          src={images[venue.venue_id]}
                          alt={venue.venueName}
                          className="venue-image"
                        />
                      ) : (
                        <div className="no-image-placeholder">
                          <span>📷</span>
                          <span>No image</span>
                        </div>
                      )}
                    </td>
                    <td className="venue-name-cell">{venue.venueName || 'N/A'}</td>
                    <td>
                      <span 
                        className="category-badge" 
                        style={{
                          backgroundColor: getCategoryColor(venue.category).bg,
                          color: getCategoryColor(venue.category).text
                        }}
                      >
                        {venue.category || 'N/A'}
                      </span>
                    </td>
                    <td className="price-cell">NPR {venue.price?.toLocaleString() || '0'}</td>
                    <td>{venue.brand || 'N/A'}</td>
                    <td className="status-cell">
                      <StatusBadge status={venue.status} />
                    </td>
                    <td className="actions-cell">
                      <button
                        className="actions-toggle-btn"
                        onClick={() => setMenuOpenId(menuOpenId === venue.venue_id ? null : venue.venue_id)}
                        aria-label="Actions"
                      >
                        ⋮
                      </button>

                      {menuOpenId === venue.venue_id && (
                        <div ref={menuRef} className="actions-menu">
                          <div className="actions-menu-header">Actions</div>
                          <button
                            className="action-menu-item"
                            onClick={() => {
                              setMenuOpenId(null);
                              handleViewVenue(venue);
                            }}
                          >
                            View Product
                          </button>
                          <button
                            className="action-menu-item"
                            onClick={() => {
                              setMenuOpenId(null);
                              handleEditVenue(venue);
                            }}
                          >
                            Edit Product
                          </button>
                          <button
                            className="action-menu-item"
                            onClick={() => {
                              setMenuOpenId(null);
                              alert('View bookings feature coming soon');
                            }}
                          >
                            View Bookings
                          </button>
                          <button
                            className="action-menu-item"
                            onClick={() => {
                              setMenuOpenId(null);
                              handleDeactivate(venue.venue_id);
                            }}
                          >
                            Deactivate Product
                          </button>
                          <button
                            className="action-menu-item delete-action"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this product?')) {
                                setMenuOpenId(null);
                                handleDelete(venue.venue_id);
                              }
                            }}
                          >
                            Delete Product
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default VenueManagement;