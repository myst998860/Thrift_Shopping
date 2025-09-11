import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { venueService } from '../../services/api';

const ViewVenue = () => {
  const { id } = useParams();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const data = await venueService.getVenue(id);
        setVenue(data);
      } catch (err) {
        setError('Failed to load venue details.');
      } finally {
        setLoading(false);
      }
    };
    fetchVenue();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!venue) return <div>No venue found.</div>;

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h2>Venue Details</h2>
      <div><strong>Name:</strong> {venue.venueName}</div>
      <div><strong>Location:</strong> {venue.location}</div>
      <div><strong>Capacity:</strong> {venue.capacity}</div>
      <div><strong>Price per Hour:</strong> {venue.price}</div>
    </div>
  );
};

export default ViewVenue; 