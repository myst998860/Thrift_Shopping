import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import axios from "axios";

import { partnerService, venueService } from '../../services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FiHome,
  FiUsers,
  FiBriefcase,
  FiMapPin,
  FiCalendar,
  FiBell,
  FiSettings,
  FiUser,
  FiLogOut
} from 'react-icons/fi';
import '../../styles/admin/AdminPanel.css';



const VenueAddTest = () => {
  const navigate = useNavigate();
  const [partners, setPartners] = useState([]);
  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState({
    venueName: '',
    partnerId: '',
    location: '',
     category:'',
    mapLocation: '',
    price: '',
    minBookingHours: '',
    openingTime: '',
    closingTime: '',
    capacity: '',
    imageUrl: '',
    description: '',
    amenities: [],
    agree: false,
    status: 'active',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await partnerService.listPartners();
        setPartners(response);
      } catch (err) {
        console.error('Failed to fetch partners:', err);
        setPartners([]);
      }


      
    };
    fetchPartners();
  }, []);

  useEffect(() => {
  console.log("Form values changed:", formData);
}, [formData]);

useEffect(() => {
  console.log("Form errors:", errors);
}, [errors]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const fieldsPage1 = ['venueName', 'partnerId', 'location', 'mapLocation', 'category' ,'pricePerHour', 'minBookingHours'];
  const fieldsPage2 = ['openingTime', 'closingTime', 'imageUrl', 'description', 'amenities', 'agree'];

  const validate = (fieldsToValidate = null) => {
    const newErrors = {};
    const fields = fieldsToValidate || Object.keys(formData);

    fields.forEach((key) => {
      const value = formData[key];

      if (key === 'agree' && value !== true) {
        newErrors[key] = 'You must agree to the terms';
      } else if (
        (typeof value === 'string' && value.trim() === '') ||
        (Array.isArray(value) && value.length === 0)
      ) {
        newErrors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate(fieldsPage1)) setPage(2);
  };

  const handleBack = () => setPage(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError('');

    try {
      const submitData = {
        ...formData,
       partnerId: formData.partnerId ? Number(formData.partnerId) : null,
      venueName: formData.venueName.trim(),
      category: formData.category.trim(),
      location: formData.location.trim(),
      capacity: formData.capacity ? Number(formData.capacity) : 0,
      price: formData.price ? Number(formData.price) : 0,
      minBookingHours: formData.minBookingHours ? Number(formData.minBookingHours) : 1,
      imageUrl: formData.imageUrl.trim(),
      status: 'active',
      };

      console.log('Submitting:', submitData);
      await venueService.addVenueA(submitData);

      toast.success('Venue added successfully!');
      setTimeout(() => {
        navigate('/admin/venues');
      }, 1500);
      setFormData({
        venueName: '',
        partnerId: '',
        category:'',
        location: '',
        mapLocation: '',
        price: '',
        minBookingHours: '',
        openingTime: '',
        closingTime: '',
        capacity: '',
        imageUrl: '',
        description: '',
        amenities: [],
        agree: false,
        status: '',
      });
    } catch (error) {
      console.error('Venue add failed:', error);
      if (error.response) {
        if (error.response.status === 409) {
          setApiError('Venue with this name already exists.');
        } else if (error.response.data?.message) {
          setApiError(error.response.data.message);
        } else {
          setApiError('Venue add failed. Please try again later.');
        }
      } else {
        setApiError('Unable to connect to the server. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = (field) => ({
    width: '100%',
    padding: '16px 20px',
    fontSize: 18,
    borderRadius: 6,
    border: errors[field] ? '2px solid #e74c3c' : '1.5px solid #ccc',
    outline: 'none',
    marginBottom: 12,
  });

  const labelStyle = {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    display: 'block',
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: 600,
          margin: '3rem auto',
          padding: '3rem',
          background: '#f9f9f9',
          borderRadius: 12,
          boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
        noValidate
      >
        <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#2c3e50' }}>Add New Venue</h1>

        {page === 1 && (
          <>
            <label htmlFor="venueName" style={labelStyle}>
              Venue Name:
            </label>
            <input
              id="venueName"
              name="venueName"
              type="text"
              value={formData.venueName}
              onChange={handleChange}
              style={inputStyle('venueName')}
              placeholder="Enter venue name"
            />
            {errors.venueName && <div style={{ color: '#e74c3c' }}>{errors.venueName}</div>}

            <label htmlFor="partnerId" style={labelStyle}>
              Partner:
            </label>
            <select
              id="partnerId"
              name="partnerId"
              value={formData.partnerId}
              onChange={handleChange}
              style={inputStyle('partnerId')}
            >
              <option value="">Select Partner</option>
              {partners.map((partner) => (
                <option key={partner.user_id} value={partner.user_id.toString()}>
                  {partner.fullname}
                </option>
              ))}
            </select>
            {errors.partnerId && <div style={{ color: '#e74c3c' }}>{errors.partnerId}</div>}

            <label htmlFor="location" style={labelStyle}>
              Location:
            </label>
            <input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              style={inputStyle('location')}
              placeholder="123 Main St, City, State, ZIP"
            />
            {errors.location && <div style={{ color: '#e74c3c' }}>{errors.location}</div>}

{/* Category */}
            <label style={labelStyle} htmlFor="category">Category:</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={inputStyle('category')}
            >
              <option value="">Select Category</option>
              <option value="Wedding Venues">Wedding Venues</option>
              <option value="Corporate Events">Corporate Events</option>
              <option value="Birthday Parties">Birthday Parties</option>
              <option value="Conferences">Conferences</option>
            </select>
            {errors.category && <div style={{ color: '#e74c3c' }}>{errors.category}</div>}
            
            <label htmlFor="mapLocation" style={labelStyle}>
              Map Location URL:
            </label>
            <input
              id="mapLocation"
              name="mapLocation"
              type="url"
              value={formData.mapLocation}
              onChange={handleChange}
              style={inputStyle('mapLocation')}
              placeholder="https://maps.google.com/..."
            />
            {errors.mapLocation && <div style={{ color: '#e74c3c' }}>{errors.mapLocation}</div>}

            <label htmlFor="pricePerHour" style={labelStyle}>
              Price Per Hour ($):
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              value={formData.price}
              onChange={handleChange}
              style={inputStyle('price')}
              placeholder="Enter price per hour"
            />
            {errors.pricePerHour && <div style={{ color: '#e74c3c' }}>{errors.pricePerHour}</div>}

            <label htmlFor="minBookingHours" style={labelStyle}>
              Minimum Booking Hours:
            </label>
            <input
              id="minBookingHours"
              name="minBookingHours"
              type="number"
              min="1"
              value={formData.minBookingHours}
              onChange={handleChange}
              style={inputStyle('minBookingHours')}
              placeholder="Enter minimum booking hours"
            />
            {errors.minBookingHours && <div style={{ color: '#e74c3c' }}>{errors.minBookingHours}</div>}

            <label htmlFor="capacity" style={labelStyle}>
              Capacity:
            </label>
            <input
              id="capacity"
              name="capacity"
              type="number"
              min="0"
              value={formData.capacity}
              onChange={handleChange}
              style={inputStyle('capacity')}
              placeholder="Enter venue capacity"
            />
            {errors.capacity && <div style={{ color: '#e74c3c' }}>{errors.capacity}</div>}

            <button
              type="button"
              onClick={handleNext}
              style={{
                width: '100%',
                padding: '18px',
                fontSize: 20,
                fontWeight: '700',
                backgroundColor: '#000000ff',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                marginTop: 24,
              }}
            >
              Next
            </button>
          </>
        )}

        {page === 2 && (
          <>
            <label htmlFor="openingTime" style={labelStyle}>
              Opening Time:
            </label>
            <input
              id="openingTime"
              name="openingTime"
              type="time"
              value={formData.openingTime}
              onChange={handleChange}
              style={inputStyle('openingTime')}
            />
            {errors.openingTime && <div style={{ color: '#e74c3c' }}>{errors.openingTime}</div>}

            <label htmlFor="closingTime" style={labelStyle}>
              Closing Time:
            </label>
            <input
              id="closingTime"
              name="closingTime"
              type="time"
              value={formData.closingTime}
              onChange={handleChange}
              style={inputStyle('closingTime')}
            />
            {errors.closingTime && <div style={{ color: '#e74c3c' }}>{errors.closingTime}</div>}

            <label htmlFor="imageUrl" style={labelStyle}>
              Main Photo URL:
            </label>
            <input
              id="imageUrl"
              name="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={handleChange}
              style={inputStyle('imageUrl')}
              placeholder="https://example.com/image.jpg"
            />
            {errors.imageUrl && <div style={{ color: '#e74c3c' }}>{errors.imageUrl}</div>}

            <label htmlFor="description" style={labelStyle}>
              Description:
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              style={{ ...inputStyle('description'), height: 100 }}
              placeholder="Describe the venue"
            />
            {errors.description && <div style={{ color: '#e74c3c' }}>{errors.description}</div>}

            <label htmlFor="amenities" style={labelStyle}>
              Amenities (comma separated):
            </label>
            <input
              id="amenities"
              name="amenities"
              type="text"
              value={formData.amenities.join(', ')}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  amenities: e.target.value
                    .split(',')
                    .map((a) => a.trim())
                    .filter((a) => a !== ''),
                }))
              }
              style={inputStyle('amenities')}
              placeholder="WiFi, Parking, Projector, ..."
            />
            {errors.amenities && <div style={{ color: '#e74c3c' }}>{errors.amenities}</div>}

            <label htmlFor="agree" style={{ display: 'flex', alignItems: 'center', marginTop: 16 }}>
              <input
                id="agree"
                name="agree"
                type="checkbox"
                checked={formData.agree}
                onChange={handleChange}
                style={{ marginRight: 8 }}
              />
              I agree to the terms and conditions
            </label>
            {errors.agree && <div style={{ color: '#e74c3c' }}>{errors.agree}</div>}

            <div style={{ marginTop: 24, display: 'flex', gap: '1rem' }}>
              <button
                type="button"
                onClick={handleBack}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  fontSize: 18,
                  borderRadius: 6,
                  border: '1px solid #ccc',
                  cursor: 'pointer',
                  backgroundColor: '#f0f0f0',
                }}
              >
                Back
              </button>

             <button
  type="submit"
  disabled={isSubmitting}
  style={{
    flex: 1,
    padding: '14px 20px',
    fontSize: 18,
    backgroundColor: '#000000ff',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
  }}
>
  {isSubmitting ? 'Submitting...' : 'Submit'}
</button>
            </div>
          </>
        )}

        {apiError && (
          <div
            style={{
              marginTop: 24,
              padding: 12,
              backgroundColor: '#fce4e4',
              color: '#e74c3c',
              borderRadius: 6,
              fontWeight: '600',
            }}
          >
            {apiError}
          </div>
        )}
      </form>
      <ToastContainer />
    </>
  );
};

export default VenueAddTest;
