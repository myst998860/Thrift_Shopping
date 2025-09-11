"use client";

import { useState, useEffect } from "react";
import VenueGrid from "./VenueGrid";
import { venueService, imageService } from "../../services/api";
import { useNavigate } from "react-router-dom";
const BrowseByCategory = ({ propVenues }) => {
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchCategoryVenues = async () => {
      setLoading(true);
      try {
        const venueList = propVenues && propVenues.length > 0
          ? propVenues
          : await venueService.listVenue();

        if (!Array.isArray(venueList)) throw new Error('Invalid venue data');

        // Fetch images for each venue asynchronously
        const venuesWithImages = await Promise.all(
          venueList.map(async (venue, index) => {
            let imageUrl = '';

            try {
              // Fetch image blob via your API proxy
              const imageBlob = await imageService.getImage(venue.venue_id);
              // Convert blob to object URL for <img> src
              imageUrl = URL.createObjectURL(imageBlob);
            } catch (imgError) {
              console.error(`Error loading image for venue ${venue.venue_id}:`, imgError);
              // Fallback to default image if fetching fails
              imageUrl = `https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80`;
            }

            return {
              id: venue.venue_id || index + 1,
              name: venue.venueName || "Venue",
              image: imageUrl,
            };
          })
        );

        setVenues(venuesWithImages);
        setError(null);
      } catch (error) {
        console.error("Error fetching category venues:", error);
        // Fallback data if the whole fetch fails
        const fallbackVenues = [
          {
            id: 1,
            name: "Venue",
            image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
          },
          {
            id: 2,
            name: "Venue",
            image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",
          },
          {
            id: 3,
            name: "Venue",
            image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=400&q=80",
          },
          {
            id: 4,
            name: "Venue",
            image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
          },
        ];
        setVenues(fallbackVenues);
        setError("Could not load latest venues. Showing sample venues.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryVenues();

    // Cleanup to revoke object URLs when component unmounts or venues change
    return () => {
      venues.forEach(v => {
        if (v.image && v.image.startsWith('blob:')) {
          URL.revokeObjectURL(v.image);
        }
      });
    };
  }, [propVenues]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div style={{ 
        padding: '60px 20px',
        textAlign: 'center',
        fontSize: '16px',
        color: '#666'
      }}>
        Loading venue categories...
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
        title="Browse Venues"
        viewAllText={`View All (${venues.length})`}
        venues={venues}
        currentPage={currentPage}
        totalPages={Math.ceil(venues.length / 4) || 1}
        onPageChange={handlePageChange}
        venueType="default"
        onViewAll={() => navigate("/venues")}
      />
    </>
  );
};

export default BrowseByCategory;