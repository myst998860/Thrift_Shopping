import React from 'react';
import { Link } from 'react-router-dom';
import "../../styles/SearchResults.css";

const SearchResults = ({ results, category, location, onClose }) => {
  if (!results || results.length === 0) {
    return (
      <div className="search-results-container">
        <div className="search-results-header">
          <h2>Search Results</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="no-results">
          <p>No venues found for {category || 'any category'} in {location || 'any location'}.</p>
          <p>Try different search criteria or browse our categories below.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="search-results-container">
      <div className="search-results-header">
        <h2>Search Results</h2>
        <div className="search-info">
          <span>{results.length} venues found</span>
          {category && <span className="search-tag">Category: {category}</span>}
          {location && <span className="search-tag">Location: {location}</span>}
        </div>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <div className="search-results-grid">
        {results.map((venue) => (
          <div key={venue.venue_id} className="search-result-card">
            <div className="search-result-image">
              {venue.imageUrl ? (
                <img src={venue.imageUrl} alt={venue.name} />
              ) : (
                <div className="placeholder-image">No Image</div>
              )}
            </div>
            <div className="search-result-content">
              <h3>{venue.venueName}</h3>
              <p className="venue-location">{venue.location}</p>
              <p className="venue-category">{venue.category}</p>
              <p className="venue-price">Starting from ${venue.price}/hour</p>
              <Link to={`/venue/${venue.venue_id}`} className="view-details-button">
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
