import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { venueService, imageService } from '../../services/api';

const ViewVenue = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [venue, setVenue] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const data = await venueService.getVenue(id);
        setVenue(data);

        // Fetch the venue image
        const imageBlob = await imageService.getImage(id);
        const objectUrl = URL.createObjectURL(imageBlob);
        setImageUrl(objectUrl);
      } catch (error) {
        setApiError('Failed to load venue details');
      } finally {
        setLoading(false);
      }
    };

    fetchVenue();
  }, [id]);

  if (loading) return <p>Loading venue details...</p>;
  if (apiError) return <p style={{ color: 'red' }}>{apiError}</p>;
  if (!venue) return <p>Venue not found.</p>;

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h2 style={styles.title}>{venue.venueName}</h2>
        {imageUrl && <img src={imageUrl} alt={venue.venueName} style={styles.image} />}
      </div>
      <div style={styles.details}>
        <Detail label="Location" value={venue.location} />
        <Detail label="Capacity" value={venue.capacity} />
        <Detail label="Price per Hour" value={venue.price} />
        <Detail label="Min Booking Hours" value={venue.minBookingHours} />
        <Detail label="Opening Time" value={venue.openingTime} />
        <Detail label="Closing Time" value={venue.closingTime} />
        <Detail label="Bookings" value={venue.bookings ?? '0'} />
        <Detail label="Status" value={venue.status} />
        <Detail label="Description" value={venue.description} lines={4} />
        <Detail label="Amenities" value={venue.amenities?.join(', ')} />
      </div>
      <button onClick={() => navigate('/admin/venues')} style={styles.button}>
        Back to Venues
      </button>
    </div>
  );
};

const Detail = ({ label, value, lines }) => (
  <div style={styles.detail}>
    <strong style={styles.label}>{label}:</strong>
    <span style={styles.value}>{value || '-'}</span>
  </div>
);

const styles = {
  card: {
    maxWidth: 800,
    margin: '20px auto',
    padding: '20px',
    borderRadius: '8px',
    backgroundColor: '#fff',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '10px',
  },
  image: {
    width: '100%',
    height: 'auto',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  details: {
    marginBottom: '20px',
  },
  detail: {
    marginBottom: '12px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontWeight: '500',
    color: '#555',
  },
  value: {
    fontWeight: '400',
    color: '#333',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  button: {
    display: 'block',
    width: '100%',
    padding: '12px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    textAlign: 'center',
    textDecoration: 'none',
    marginTop: '20px',
  },
};

export default ViewVenue;