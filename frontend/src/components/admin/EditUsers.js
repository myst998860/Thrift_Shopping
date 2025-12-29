import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { userService } from '../../services/api';
import '../../styles/admin/EditUsers.css';
const EditUser = () => {

  const { userId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    role: '',
    phoneNumber:'',
    company: '',
    panCard: '',
    businessTranscripts: ''
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1️⃣ Load user (including potential partner fields)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const dto = await userService.getUser(userId);
        setFormData({
          fullname: dto.fullname || '',
          email: dto.email || '',
          role: dto.role || '',
          phoneNumber: dto.phoneNumber || '',
          company: dto.company || '',
          panCard: dto.panCard || '',
          businessTranscripts: dto.businessTranscripts || ''
        });
      } catch {
        setApiError('Failed to load user data');
      }
    };
    fetchUser();
  }, [userId]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.fullname.trim()) errs.fullname = 'Required';
     if (!formData.phoneNumber.trim()) errs.phoneNumber = 'Required';
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errs.email = 'Valid email required';
    if (!formData.role.trim()) errs.role = 'Required';
    if (formData.role === 'PARTNER') {
      if (!formData.company.trim()) errs.company = 'Required';
      if (!formData.panCard.trim()) errs.panCard = 'Required';
      if (!formData.businessTranscripts.trim())
        errs.businessTranscripts = 'Required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError('');

    try {
      // Trimmed payload
      const payload = {
        fullname: formData.fullname,
        email: formData.email,
         phoneNumber: formData.phoneNumber,
        role: formData.role,
        ...(formData.role === 'PARTNER' && {
          company: formData.company,
          panCard: formData.panCard,
          businessTranscripts: formData.businessTranscripts
        })
      };

      await userService.editUser(userId, payload);
      navigate('/admin/users');
    } catch {
      setApiError('Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (apiError) return <div className="edit-user-error" role="alert">{apiError}</div>;

  return (
    <div className="edit-user-container">
      <div className="edit-user-header">
        <h2>Edit User</h2>
      </div>
      <form onSubmit={handleSubmit} className="edit-user-form" autoComplete="off" aria-label="Edit User Form">
        <fieldset className="edit-user-fieldset">
          {/* <legend>Edit User</legend> */}

          {/* fullname, email, phoneNumber */}
          {[{name:'fullname', label:'Full Name', type:'text', placeholder:'Enter full name'},
            {name:'email', label:'Email', type:'email', placeholder:'Enter email address'},
            {name:'phoneNumber', label:'Phone Number', type:'tel', placeholder:'Enter phone number'}].map(field => (
            <div className="edit-user-form-group" key={field.name}>
              <label htmlFor={field.name}>{field.label}</label>
              <input
                id={field.name}
                name={field.name}
                type={field.type}
                value={formData[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                aria-invalid={!!errors[field.name]}
                aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
                className={errors[field.name] ? 'input-error' : ''}
              />
              {errors[field.name] && <span className="edit-user-error" id={`${field.name}-error`}>{errors[field.name]}</span>}
            </div>
          ))}

          <div className="edit-user-form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              aria-invalid={!!errors.role}
              aria-describedby={errors.role ? 'role-error' : undefined}
              className={errors.role ? 'input-error' : ''}
            >
              <option value="">Select role</option>
              <option value="ADMIN">Admin</option>
              <option value="ATTENDEE">Attendee</option>
              <option value="PARTNER">Partner</option>
            </select>
            {errors.role && <span className="edit-user-error" id="role-error">{errors.role}</span>}
          </div>

          {/* Show partner-specific fields */}
          {formData.role === 'PARTNER' && (
            <>
              {[{name:'company', label:'Company', placeholder:'Enter company name'},
                {name:'panCard', label:'PAN Card', placeholder:'Enter PAN card number'},
                {name:'businessTranscripts', label:'Business Transcripts', placeholder:'Enter business transcripts'}].map(field => (
                <div className="edit-user-form-group" key={field.name}>
                  <label htmlFor={field.name}>{field.label}</label>
                  <input
                    id={field.name}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    aria-invalid={!!errors[field.name]}
                    aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
                    className={errors[field.name] ? 'input-error' : ''}
                  />
                  {errors[field.name] && (
                    <span className="edit-user-error" id={`${field.name}-error`}>
                      {errors[field.name]}
                    </span>
                  )}
                </div>
              ))}
            </>
          )}
.
          <img src={formData.businessTranscripts} alt="User Image" width={100} height={100} style={{borderRadius: '10px'}} />

          <button type="submit" className="edit-user-submit-btn" disabled={isSubmitting} aria-busy={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="loading-spinner"></span>
                Saving...
              </>
            ) : (
              <>
                <span className="success-checkmark"></span>
                Save Updates
              </>
            )}
          </button>
        </fieldset>
      </form>
    </div>
  );
};

export default EditUser;

