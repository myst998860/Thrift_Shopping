import { useState } from "react";
import { venueService, imageService } from "../../services/api";
import SearchResults from "./SearchResults";
import "../../styles/HeroSection.css";

const HeroSection = () => {
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Ensure category and location are properly formatted (trim whitespace)
      const formattedCategory = category ? category.trim() : '';
      const formattedLocation = location ? location.trim() : '';
      
      console.log('Searching venues with category:', formattedCategory, 'and location:', formattedLocation);
      const results = await venueService.searchVenues(formattedCategory, formattedLocation);
      console.log('Search results:', results);
      
      // Fetch images for each venue
      const venuesWithImages = await Promise.all(
        results.map(async (venue) => {
          try {
            const imageBlob = await imageService.getImage(venue.venue_id);
            return {
              ...venue,
              imageUrl: URL.createObjectURL(imageBlob)
            };
          } catch (error) {
            console.error(`Failed to load image for venue ${venue.venue_id}:`, error);
            return {
              ...venue,
              imageUrl: null
            };
          }
        })
      );
      
      console.log('Venues with images:', venuesWithImages);
      setSearchResults(venuesWithImages);
      setShowResults(true);
    } catch (error) {
      console.error("Search failed:", error);
      setError("Failed to search venues. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCloseResults = () => {
    setShowResults(false);
  };

  return (
    <>
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Your Venue, Your Way</h1>
          <div className="hero-search">
            <select 
              className="hero-dropdown" 
              value={category} 
              onChange={e => setCategory(e.target.value)}
              disabled={isLoading}
            >
              <option value="">Select Category</option>
              <option value="Wedding Venues">Wedding Venues</option>
              <option value="Corporate Events">Corporate Events</option>
              <option value="Birthday Parties">Birthday Parties</option>
              <option value="Conferences">Conferences</option>
            </select>
            <select 
              className="hero-dropdown" 
              value={location} 
              onChange={e => setLocation(e.target.value)}
              disabled={isLoading}
            >
              <option value="">Select Location</option>
              <option value="Kathmandu">Kathmandu</option>
              <option value="Pokhara">Pokhara</option>
              <option value="Chitwan">Chitwan</option>
              <option value="Lalitpur">Lalitpur</option>
            </select>
            <button 
              className={`hero-search-button ${isLoading ? 'loading' : ''}`} 
              onClick={handleSearch}
              disabled={isLoading}
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
          {error && <div className="hero-search-error">{error}</div>}
        </div>
      </section>
      
      {showResults && (
        <SearchResults 
          results={searchResults} 
          category={category} 
          location={location} 
          onClose={handleCloseResults} 
        />
      )}
    </>
  );
};

export default HeroSection;
