"use client";

import { useState, useEffect } from "react";
import Navbar from "./Header";
import HeroSection from "./HeroSection";
import BrowseByCategory from "./BrowseByCategory";
import PopularVenues from "./PopularVenues";
import ReviewsSection from "./ReviewsSection";
import Footer from "./Footer";
import { venueService, imageService } from "../../services/api";
import "../../styles/HomePage.css";

const HomePage = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
const [images, setImages] = useState({});

  useEffect(() => {
   const fetchTopVenues = async () => {
    try {
      setLoading(true);
      const response = await venueService.listVenue();
      const topVenues = Array.isArray(response) ? response.slice(0, 8) : [];
      setVenues(topVenues);
      setError(null);

      // Fetch images for each venue
      const imagePromises = topVenues.map(async (venue) => {
        try {
          const imageBlob = await imageService.getImage(venue.venue_id);
          return { venue_id: venue.venue_id, imageUrl: URL.createObjectURL(imageBlob) };
        } catch {
          return { venue_id: venue.venue_id, imageUrl: null };
        }
      });

      const imagesArray = await Promise.all(imagePromises);
      const imageMap = {};
      imagesArray.forEach(({ venue_id, imageUrl }) => {
        imageMap[venue_id] = imageUrl;
      });

      setImages(imageMap);
    } catch (error) {
      console.error("Error fetching top venues:", error);
      setError("Failed to load venues. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  fetchTopVenues();
}, []);

  if (loading) {
    return (
      <div className="homepage">
        <Navbar />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          fontSize: '18px',
          color: '#666'
        }}>
          Loading amazing venues...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="homepage">
        <Navbar />
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          fontSize: '18px',
          color: '#e74c3c',
          textAlign: 'center',
          padding: '20px'
        }}>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#ffc107',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="homepage">
      <Navbar />
      <HeroSection />
      <BrowseByCategory venues={venues} />
      <PopularVenues venues={venues} />
      <ReviewsSection />
      <Footer />
    </div>
  );
};

export default HomePage;