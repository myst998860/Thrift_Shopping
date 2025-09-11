import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { partnerService } from '../../services/api';
import '../../styles/admin/EditPartner.css';

const EditPartner = () => {
  const { partnerId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phoneNumber: '',
    company: '',
    panCard: '',
    businessTranscripts: '',
    status: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const data = await partnerService.getPartner(partnerId);
        setFormData({
          fullname: data.fullname || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          company: data.company || '',
          panCard: data.panCard || '',
          businessTranscripts: data.businessTranscripts || '',
          status: data.status || '',
        });
      } catch {
        setApiError('Failed to load partner data');
      }
    };
    fetchPartner();
  }, [partnerId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.fullname.trim()) errs.fullname = 'Full name is required';
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errs.email = 'Valid email is required';
    if (!formData.phoneNumber.trim()) errs.phoneNumber = 'Phone number is required';
    if (!formData.company.trim()) errs.company = 'Company is required';
    if (!formData.panCard.trim()) errs.panCard = 'PAN Card is required';
    if (!formData.businessTranscripts.trim()) errs.businessTranscripts = 'Business transcripts are required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setApiError('');
    try {
      await partnerService.editPartner(partnerId, formData);
      navigate('/admin/partners');
    } catch {
      setApiError('Failed to update partner');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (apiError)
    return <div className="edit-partner-error" role="alert">{apiError}</div>;

  return (
    <div className="edit-partner-container">
      <div className="edit-partner-header">
        <h2>Edit Partner</h2>
      </div>
      <form onSubmit={handleSubmit} className="edit-partner-form" autoComplete="off" aria-label="Edit Partner Form">
        <fieldset className="edit-partner-fieldset">
          {/* <legend>Edit Partner</legend> */}

          {/* Full Name */}
          <div className="edit-partner-form-group">
            <label htmlFor="fullname">Full Name</label>
            <input
              id="fullname"
              name="fullname"
              type="text"
              value={formData.fullname}
              onChange={handleChange}
              placeholder="Enter full name"
              aria-invalid={!!errors.fullname}
              aria-describedby={errors.fullname ? 'fullname-error' : undefined}
              className={errors.fullname ? 'input-error' : ''}
            />
            {errors.fullname && <span className="edit-partner-error" id="fullname-error">{errors.fullname}</span>}
          </div>

          {/* Email */}
          <div className="edit-partner-form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="edit-partner-error" id="email-error">{errors.email}</span>}
          </div>

          {/* Phone Number */}
          <div className="edit-partner-form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter phone number"
              aria-invalid={!!errors.phoneNumber}
              aria-describedby={errors.phoneNumber ? 'phoneNumber-error' : undefined}
              className={errors.phoneNumber ? 'input-error' : ''}
            />
            {errors.phoneNumber && <span className="edit-partner-error" id="phoneNumber-error">{errors.phoneNumber}</span>}
          </div>

          {/* Company */}
          <div className="edit-partner-form-group">
            <label htmlFor="company">Company</label>
            <input
              id="company"
              name="company"
              type="text"
              value={formData.company}
              onChange={handleChange}
              placeholder="Enter company name"
              aria-invalid={!!errors.company}
              aria-describedby={errors.company ? 'company-error' : undefined}
              className={errors.company ? 'input-error' : ''}
            />
            {errors.company && <span className="edit-partner-error" id="company-error">{errors.company}</span>}
          </div>

          {/* PAN Card */}
          <div className="edit-partner-form-group">
            <label htmlFor="panCard">PAN Card</label>
            <input
              id="panCard"
              name="panCard"
              type="text"
              value={formData.panCard}
              onChange={handleChange}
              placeholder="Enter PAN card number"
              aria-invalid={!!errors.panCard}
              aria-describedby={errors.panCard ? 'panCard-error' : undefined}
              className={errors.panCard ? 'input-error' : ''}
            />
            {errors.panCard && <span className="edit-partner-error" id="panCard-error">{errors.panCard}</span>}
          </div>

          {/* Business Transcripts */}
          <div className="edit-partner-form-group">
            <label htmlFor="businessTranscripts">Business Transcripts</label>
            <input
              id="businessTranscripts"
              name="businessTranscripts"
              type="text"
              value={formData.businessTranscripts}
              onChange={handleChange}
              placeholder="Enter business transcripts"
              aria-invalid={!!errors.businessTranscripts}
              aria-describedby={errors.businessTranscripts ? 'businessTranscripts-error' : undefined}
              className={errors.businessTranscripts ? 'input-error' : ''}
            />
            {errors.businessTranscripts && <span className="edit-partner-error" id="businessTranscripts-error">{errors.businessTranscripts}</span>}
          </div>

          {/* Status */}
          <div className="edit-partner-form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              aria-invalid={!!errors.status}
              className={errors.status ? 'input-error' : ''}
            >
              <option value="">Select Status</option>
              <option value="Pending">Pending</option>
              <option value="Verified">Verified</option>
              <option value="Inactive">Inactive</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <button type="submit" className="edit-partner-submit-btn" disabled={isSubmitting} aria-busy={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="loading-spinner"></span>
                Saving...
              </>
            ) : (
              <>
                <span className="success-checkmark"></span>
                Save Changes
              </>
            )}
          </button>
        </fieldset>
      </form>
    </div>
  );
};

export default EditPartner;
