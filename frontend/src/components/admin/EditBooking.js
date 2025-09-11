import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { venueService,bookingService} from '../../services/api';
import '../../styles/admin/EditBooking.css'; 

const EditBooking = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    status: '',
    bookedTime: '',
    duration: '',
    guests: '',
    specialRequests: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const dto = await bookingService.getBookingById(bookingId);
        setFormData({
          status: dto.status || '',
          bookedTime: dto.bookedTime ? new Date(dto.bookedTime).toISOString().slice(0, 16) : '',
          duration: dto.duration?.toString() || '',
          guests: dto.guests?.toString() || '',
          specialRequests: dto.specialRequests || '',
        });
      } catch {
        setApiError('Failed to load booking details.');
      }
    };
    fetchBooking();
  }, [bookingId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.status.trim()) errs.status = 'Status is required';
    if (!formData.bookedTime.trim()) errs.bookedTime = 'Booked time is required';
    if (!formData.duration.trim() || isNaN(Number(formData.duration)) || Number(formData.duration) <= 0)
      errs.duration = 'Valid duration required';
    if (!formData.guests.trim() || isNaN(Number(formData.guests)) || Number(formData.guests) <= 0)
      errs.guests = 'Valid number of guests required';
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
        status: formData.status,
        bookedTime: new Date(formData.bookedTime).toISOString(),
        duration: Number(formData.duration),
        guests: Number(formData.guests),
        specialRequests: formData.specialRequests,
      };

      await bookingService.editBooking(bookingId, payload);

      alert('Booking updated successfully!');
      navigate('/admin/bookings');
    } catch {
      setApiError('Failed to update booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="edit-booking-container">
      <div className="edit-booking-header">
        <h2>Edit Booking</h2>
      </div>
      {apiError && <div className="api-error">{apiError}</div>}

      <form onSubmit={handleSubmit} className="edit-booking-form">
        <div className="form-fields-container">
          {[
            { label: 'Status', name: 'status', type: 'text' },
            { label: 'Booked Time', name: 'bookedTime', type: 'datetime-local' },
            { label: 'Duration (hours)', name: 'duration', type: 'number' },
            { label: 'Guests', name: 'guests', type: 'number' },
            { label: 'Special Requests', name: 'specialRequests', type: 'text' },
          ].map(({ label, name, type }) => (
            <div key={name} className="form-field">
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
          ))}
        </div>

        <div className="button-group">
          <button 
            type="button" 
            onClick={() => navigate('/admin/bookings')} 
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

export default EditBooking;
