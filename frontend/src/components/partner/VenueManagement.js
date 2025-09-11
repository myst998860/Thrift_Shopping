
import React, { useState, useEffect,useRef } from 'react';
import '../../styles/admin/PartnerManagement.css';
import { venueService, imageService } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const VenueManagement = () => {
  const [venues, setVenues] = useState([]);
  const [menuOpenId, setMenuOpenId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
     navigate('/partner/venues/new');
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
          location: v.location,
          category: v.category,
          price: v.price,
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


  const StatusBadge = ({ status }) => {
    const statusClasses = `status-badge ${status === 'Active' ? 'status-active' : 'status-inactive'}`;
    return <span className={statusClasses}>{status}</span>;
  };


  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 2px 8px #eee' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Venue Management</h1>
      <p style={{ color: '#888', marginBottom: 24 }}>Manage all venues on the platform</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600 }}>All Venues</h2>
        <button onClick={handleAdd} style={{ background: '#111', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 22px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>+ Add New Venue</button>
      </div>
      <input type="text" placeholder="Search venues by name, partner, or location..." style={{ width: 320, padding: 8, borderRadius: 6, border: '1px solid #ddd', marginBottom: 16 }} />
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
        <thead>
          <tr style={{ background: '#f7f7f7', textAlign: 'left' }}>
            <th style={{ padding: 10 }}>ID</th>
            <th>Venue Image</th>
          <th style={{ padding: 10 ,textAlign: 'center', verticalAlign: 'middle' }}>Venue Name</th>
          <th style={{ padding: 10,textAlign: 'center', verticalAlign: 'middle'  }}>Location</th>
          <th style={{ padding: 10,textAlign: 'center', verticalAlign: 'middle'  }}>category</th>
          <th style={{ padding: 10,textAlign: 'center', verticalAlign: 'middle'  }}>Capacity</th>
          <th style={{ padding: 10,textAlign: 'center', verticalAlign: 'middle'  }}>Price/Hour</th>
          <th style={{ padding: 10 ,textAlign: 'center', verticalAlign: 'middle' }}>Booking Time</th>
          <th style={{ padding: 10,textAlign: 'center', verticalAlign: 'middle'  }}>Opening Time</th>
          <th style={{ padding: 10 ,textAlign: 'center', verticalAlign: 'middle' }}>Closing Time</th>
          <th style={{ padding: 10,textAlign: 'center', verticalAlign: 'middle'  }}>Bookings</th>
          <th style={{ padding: 10,textAlign: 'center', verticalAlign: 'middle'  }}>Status</th>
          <th style={{ padding: 10,textAlign: 'center', verticalAlign: 'middle'  }}>Actions</th>
          </tr>
        </thead>
    <tbody>
  {venues.map((venue) => (
    <tr key={venue.venue_id} style={{ borderBottom: '1px solid #eee' }}>
      <td style={{ padding: 10 }}>{venue.venue_id}</td>
      <td>
         {images[venue.venue_id] ? (
            <img
              src={images[venue.venue_id]}
              alt={venue.venueName}
              style={{ width: 200, height: 'auto' }}
            />
          ) : (
            <div>No image available</div>
          )}
      </td>
     <td style={{ padding: 10,textAlign: 'center', verticalAlign: 'middle' }}>{venue.venueName}</td>
      <td style={{ padding: 10,textAlign: 'center', verticalAlign: 'middle'  }}>{venue.location}</td>
            <td style={{ padding: 10,textAlign: 'center', verticalAlign: 'middle'  }}>{venue.category}</td>
      <td style={{ padding: 10 ,textAlign: 'center', verticalAlign: 'middle' }}>{venue.capacity}</td>
      <td style={{ padding: 10 ,textAlign: 'center', verticalAlign: 'middle' }}>{venue.price}</td>
        <td style={{ padding: 10 ,textAlign: 'center', verticalAlign: 'middle' }}>{venue.minBookingHours}</td>
      <td style={{ padding: 10,textAlign: 'center', verticalAlign: 'middle'  }}>{venue.openingTime}</td>
      <td style={{ padding: 10 ,textAlign: 'center', verticalAlign: 'middle' }}>{venue.closingTime}</td>
      <td style={{ padding: 10 ,textAlign: 'center', verticalAlign: 'middle' }}>{venue.bookingCount}</td>
      <td style={{ padding: 10,textAlign: 'center', verticalAlign: 'middle'  }}>
  <span style={{
  background: venue.status?.toLowerCase() === 'active' ? '#e6ffe6' : '#ffe6e6',
  color: venue.status?.toLowerCase() === 'active' ? '#22bb33' : '#d9534f',
  borderRadius: 12,
  padding: '4px 14px',
  fontWeight: 500,
  fontSize: 14,
  textAlign: 'center',
  verticalAlign: 'middle'
}}>
  {venue.status?.toLowerCase() === 'active' ? 'Active' : 'Inactive'}
</span>
</td>
      <td style={{ padding: 10, position: 'relative',alignItems: 'center',justifyContent: 'center',display: 'flex' }}>
        {/* The toggle button */}
        <button
          style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer',verticalAlign: 'middle' }}
          onClick={() => setMenuOpenId(menuOpenId === venue.venue_id ? null : venue.venue_id)}
          aria-label="Actions"
        >
          ⋮
        </button>

        {/* The dropdown menu */}
        {menuOpenId === venue.venue_id && (
          <div
            ref={menuRef}
            style={{
              position: 'absolute',
              top: 30,
              right: 0,
              background: '#fff',
              border: '1px solid #eee',
              borderRadius: 8,
              boxShadow: '0 2px 8px #eee',
              zIndex: 10,
              minWidth: 180
            }}
          >
            <div style={{ padding: '10px 16px', fontWeight: 600, color: '#888', borderBottom: '1px solid #f0f0f0',display: 'flex', justifyContent: 'center', alignItems: 'center', height: 40   }}>
              Actions
            </div>
           <button
              style={menuBtnStyle}
              onClick={() => {
                setMenuOpenId(null);
                handleViewVenue(venue);
                console.log("venue is: ",venue);
              }}
            >
              View venue
            </button>
            <button
              style={menuBtnStyle}
              onClick={() => {
                setMenuOpenId(null);
                handleEditVenue(venue);
                console.log("venue is: ",venue);
              }}
            >
              Edit venue
            </button>

            
            
            <button style={menuBtnStyle} onClick={() => { setMenuOpenId(null); alert('View bookings'); }}>
              View bookings
            </button>
            <button style={menuBtnStyle} onClick={() => { setMenuOpenId(null); handleDeactivate(venue.venue_id); }}>
              Deactivate venue
            </button>
            <button
              style={{ ...menuBtnStyle, color: '#d9534f' }}
              onClick={() => {
                setMenuOpenId(null);
                handleDelete(venue.venue_id);
              }}
            >
              Delete venue
            </button>
          </div>
        )}
      </td>
    </tr>
  ))}
</tbody>
      </table>
    </div>
  );
};

const menuBtnStyle = {
  display: 'block',
  width: '100%',
  padding: '10px 16px',
  background: 'none',
  border: 'none',
  textAlign: 'left',
  fontSize: 15,
  cursor: 'pointer',
  color: '#222',
  borderBottom: '1px solid #f0f0f0',
};

export default VenueManagement;