import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { venueService } from '../../services/api';
import '../../styles/admin/EditVenue.css'; 

const EditVenue = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    venueName: '',
    location: '',
    imageUrl: '',
    capacity: '',
    price: '',
    minBookingHours: '',
    openingTime: '',
    closingTime: '',
    bookings: '',
    status: '',
    description: '',
    amenities: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const dto = await venueService.getVenue(id);
        setFormData({
          venueName: dto.venueName || '',
          location: dto.location || '',
          imageUrl: dto.imageUrl || '',
          capacity: dto.capacity?.toString() || '',
          price: dto.price?.toString() || '',
          minBookingHours: dto.minBookingHours?.toString() || '',
          openingTime: dto.openingTime || '',
          closingTime: dto.closingTime || '',
          bookings: dto.bookings?.toString() || '',
          status: dto.status || '',
          description: dto.description || '',
          amenities: dto.amenities ? dto.amenities.join(', ') : '',
        });
      } catch (err) {
        setApiError('Failed to load venue details.');
      }
    })();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.venueName.trim()) errs.venueName = 'Name is required';
    if (!formData.location.trim()) errs.location = 'Location is required';
    if (!formData.imageUrl.trim()) errs.imageUrl = 'Image URL is required';
    if (!formData.capacity.trim() || isNaN(Number(formData.capacity)))
      errs.capacity = 'Valid capacity required';
    if (!formData.price.trim() || isNaN(Number(formData.price)))
      errs.price = 'Valid price required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError('');
    try {
      const payload = {
        venueName: formData.venueName,
        location: formData.location,
        imageUrl: formData.imageUrl,
        capacity: Number(formData.capacity),
        price: Number(formData.price),
        minBookingHours: Number(formData.minBookingHours),
        openingTime: formData.openingTime,
        closingTime: formData.closingTime,
        bookings: Number(formData.bookings),
        status: formData.status,
        description: formData.description,
        amenities: formData.amenities.split(',').map((a) => a.trim()),
      };

      await venueService.editVenue(id, payload);
      alert('Venue updated successfully!');
      navigate('/admin/venues');
    } catch (err) {
      console.error(err);
      setApiError('Failed to update venue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (label, name, type = 'text') => (
    <div className="form-field">
      <label>{label}</label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        className={errors[name] ? 'error' : ''}
      />
      {errors[name] && (
        <span className="error-message">{errors[name]}</span>
      )}
    </div>
  );

  return (
    <div className="edit-venue-container">
      <div className="edit-venue-header">
        <h2>Edit Venue</h2>
      </div>
      {apiError && <div className="api-error">{apiError}</div>}
      <form onSubmit={handleSubmit} className="edit-venue-form">
        <div className="form-grid">
          {/* Left Section: Basic Details */}
          <div className="form-section">
            <h3>Basic Details</h3>
            {renderField('Venue Name', 'venueName')}
            {renderField('Location', 'location')}
            {renderField('Image URL', 'imageUrl')}
            {renderField('Description', 'description')}
            {renderField('Status', 'status')}
          </div>

          {/* Right Section: Booking & Pricing */}
          <div className="form-section">
            <h3>Booking & Pricing</h3>
            {renderField('Capacity', 'capacity', 'number')}
            {renderField('Price per Hour', 'price', 'number')}
            {renderField('Min Booking Hours', 'minBookingHours', 'number')}
            {renderField('Opening Time', 'openingTime')}
            {renderField('Closing Time', 'closingTime')}
            {renderField('Amenities (comma separated)', 'amenities')}
          </div>
        </div>

        {/* Buttons */}
        <div className="button-group">
          <button
            type="button"
            onClick={() => navigate('/admin/venues')}
            className="btn btn-cancel"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="btn btn-save"
          >
            {isSubmitting ? (
              <>
                <span className="loading-spinner"></span>
                Saving...
              </>
            ) : (
              <>
                <span className="success-checkmark">✓</span>
                Save
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditVenue;