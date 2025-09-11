"use client";

import { useState, useEffect } from 'react';
import { venueService, imageService } from '../../services/api';
import VenueGrid from './VenueGrid';
import { useNavigate } from 'react-router-dom';

const PopularVenues = ({ venues: propVenues }) => {
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchPopularVenues = async () => {
      setLoading(true);
      setError(null);

      try {
        let venueList = [];

        if (propVenues && propVenues.length > 0) {
          venueList = propVenues.slice(0, 4);
        } else {
          const response = await venueService.listVenue();
          venueList = Array.isArray(response) ? response.slice(0, 4) : [];
        }

        // Fetch images for each venue
        const popularVenues = await Promise.all(
          venueList.map(async (venue) => {
            try {
              const blob = await imageService.getImage(venue.venue_id);
              const imageUrl = URL.createObjectURL(blob);
              return {
                id: venue.venue_id,
                name: venue.venueName,
                image: imageUrl,
              };
            } catch (err) {
              console.error(`Error loading image for venue ${venue.venue_id}:`, err);
              return {
                id: venue.venue_id,
                name: venue.venueName,
                image: 'https://www.bing.com/ck/a?!&&p=ffbf9fa539dd1660196639ced0b17acb04b307b3710877273bae79dd77f3c19bJmltdHM9MTc1MzA1NjAwMA&ptn=3&ver=2&hsh=4&fclid=2c293859-3576-63ef-0a75-2e7a34c462bd&u=a1L2ltYWdlcy9zZWFyY2g_cT1pbWFnZXZlbnVlJmlkPUEyMkE4NTEwODBFNTY5OERGQTQ5MTQ4M0UzRkVGOEQyNDQ2NDUyOTkmRk9STT1JQUNGSVI&ntb=1',
              };
            }
          })
        );

        setVenues(popularVenues);
      } catch (err) {
        console.error("Error fetching venues:", err);
        setError("Could not load popular venues. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPopularVenues();
  }, [propVenues]);

  const handlePageChange = (page) => setCurrentPage(page);

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', fontSize: '16px', color: '#666' }}>
        Loading popular venues...
      </div>
    );
  }

  return (
    <>
      {error && (
        <div style={{
          background: '#fff3cd',
          color: '#856404',
          padding: '12px',
          margin: '20px auto',
          borderRadius: '4px',
          border: '1px solid #ffeaa7',
          maxWidth: '1200px',
          textAlign: 'center'
        }}>
          ⚠️ {error}
        </div>
      )}
      <VenueGrid
        title="Popular Venues"
        viewAllText={`View All (${venues.length})`}
        venues={venues}
        currentPage={currentPage}
        totalPages={Math.ceil(venues.length / 4) || 1}
        onPageChange={handlePageChange}
        venueType="popular"
        onViewAll={() => navigate("/popular-venues")}
      />
    </>
  );
};

export default PopularVenues;
