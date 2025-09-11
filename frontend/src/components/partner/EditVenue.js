import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { venueService } from '../../services/api'; 

const EditVenue = () => {
 const { id } = useParams(); 
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    venueName: '',
    location: '',
    capacity: '',
    price: '',
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
          capacity: dto.capacity?.toString() || '',
          price: dto.price?.toString() || '',
        });
      } catch (err) {
        setApiError('Failed to load venue details.');
      }
    })();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.venueName.trim()) errs.venueName = 'Name is required';
    if (!formData.location.trim()) errs.location = 'Location is required';
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
        capacity: Number(formData.capacity),
        price: Number(formData.price),
      };
      await venueService.editVenue(id, payload);
      alert('Venue updated successfully!');
      navigate('/partner/venues');
    } catch (err) {
      setApiError('Failed to update venue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h2>Edit Venue</h2>
      {apiError && <div style={{ color: 'red' }}>{apiError}</div>}
      <form onSubmit={handleSubmit}>
        {[
          { label: 'Venue Name', name: 'venueName', type: 'text' },
          { label: 'Location', name: 'location', type: 'text' },
          { label: 'Capacity', name: 'capacity', type: 'number' },
          { label: 'Price per Hour', name: 'price', type: 'number' },
        ].map(field => (
          <div key={field.name} style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>{field.label}</label>
            <input
              type={field.type}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              style={{ width: '100%', padding: 8, borderRadius: 4, border: errors[field.name] ? '1px solid red' : '1px solid #ccc' }}
            />
            {errors[field.name] && (
              <span style={{ color: 'red', fontSize: 12 }}>{errors[field.name]}</span>
            )}
          </div>
        ))}
        <div style={{ marginTop: 24 }}>
          <button type="button" onClick={() => navigate('/partner/venues')} style={{ marginRight: 8 }}>
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};
 
export default EditVenue; 