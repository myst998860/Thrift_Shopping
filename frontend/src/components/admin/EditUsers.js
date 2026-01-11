import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { userService } from '../../services/api';
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiShield, FiBriefcase, FiFileText, FiCheckCircle, FiInfo } from 'react-icons/fi';
import { toast } from 'react-toastify';
import '../../styles/admin/EditUsers.css';

const EditUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    role: '',
    phoneNumber: '',
    company: '',
    panCard: '',
    businessTranscripts: ''
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
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
      } catch (err) {
        setApiError('Failed to load user data');
        toast.error('Could not load user profile');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
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
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) {
      toast.warning('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    try {
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
      toast.success('User updated successfully');
      navigate('/admin/users');
    } catch {
      toast.error('Failed to save updates');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="edit-user-loading">
      <div className="spinner"></div>
      <p>Synchronizing profile data...</p>
    </div>
  );

  return (
    <div className="edit-user-modern-container">
      <div className="edit-user-navigation">
        <button className="back-link-btn" onClick={() => navigate('/admin/users')}>
          <FiArrowLeft /> Back to Directory
        </button>
      </div>

      <div className="edit-user-card-layout">
        <div className="edit-user-sidebar">
          <div className="profile-preview-card">
            <div className="avatar-preview">
              {formData.fullname ? formData.fullname.charAt(0).toUpperCase() : <FiUser />}
            </div>
            <h3>{formData.fullname || 'Anonymous User'}</h3>
            <span className="role-chip">{formData.role || 'Attendee'}</span>
            <div className="profile-mini-meta">
              <span><FiMail /> {formData.email}</span>
              <span><FiPhone /> {formData.phoneNumber || 'No phone'}</span>
            </div>
          </div>

          <div className="edit-guidelines">
            <h4><FiInfo /> Update Notice</h4>
            <p>Modify user roles with caution. Promoting a user to ADMIN grants full system access.</p>
          </div>
        </div>

        <div className="edit-user-main">
          <header className="form-header">
            <h1>Modify Account</h1>
            <p>Update authentication and profile details for ID: #{userId}</p>
          </header>

          <form onSubmit={handleSubmit} className="modern-form">
            <section className="form-section">
              <div className="section-title">
                <FiUser /> <span>Identity Details</span>
              </div>
              <div className="form-grid">
                <div className="form-group-modern">
                  <label><FiUser /> Full Name</label>
                  <input
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleChange}
                    className={errors.fullname ? 'error' : ''}
                    placeholder="e.g. John Doe"
                  />
                  {errors.fullname && <span className="error-text">{errors.fullname}</span>}
                </div>

                <div className="form-group-modern">
                  <label><FiMail /> Email Address</label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'error' : ''}
                    placeholder="name@example.com"
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>

                <div className="form-group-modern">
                  <label><FiPhone /> Phone Number</label>
                  <input
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className={errors.phoneNumber ? 'error' : ''}
                    placeholder="+977-XXXXXXXXXX"
                  />
                  {errors.phoneNumber && <span className="error-text">{errors.phoneNumber}</span>}
                </div>

                <div className="form-group-modern">
                  <label><FiShield /> System Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className={errors.role ? 'error' : ''}
                  >
                    <option value="ATTENDEE">Attendee (User)</option>
                    <option value="ADMIN">Administrator</option>
                    <option value="PARTNER">Business Partner</option>
                  </select>
                </div>
              </div>
            </section>

            {formData.role === 'PARTNER' && (
              <section className="form-section partner-section">
                <div className="section-title">
                  <FiBriefcase /> <span>Partner Credentials</span>
                </div>
                <div className="form-grid">
                  <div className="form-group-modern">
                    <label><FiBriefcase /> Company Name</label>
                    <input
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className={errors.company ? 'error' : ''}
                    />
                  </div>
                  <div className="form-group-modern">
                    <label><FiFileText /> PAN Card Number / ID</label>
                    <input
                      name="panCard"
                      value={formData.panCard}
                      onChange={handleChange}
                      className={errors.panCard ? 'error' : ''}
                    />
                  </div>
                </div>

                <div className="document-previews">
                  {formData.panCard && (formData.panCard.startsWith('http')) && (
                    <div className="doc-preview-card">
                      <label>PAN Card Image</label>
                      <div className="image-wrapper">
                        <img src={formData.panCard} alt="PAN Card" />
                        <a href={formData.panCard} target="_blank" rel="noopener noreferrer" className="view-full-link">View Full</a>
                      </div>
                    </div>
                  )}
                  {formData.businessTranscripts && (formData.businessTranscripts.startsWith('http')) && (
                    <div className="doc-preview-card">
                      <label>Business Transcripts</label>
                      <div className="image-wrapper">
                        <img src={formData.businessTranscripts} alt="Business Transcripts" />
                        <a href={formData.businessTranscripts} target="_blank" rel="noopener noreferrer" className="view-full-link">View Full</a>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            <div className="form-actions-modern">
              <button
                type="submit"
                className="save-changes-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <><div className="btn-spinner"></div> Saving...</>
                ) : (
                  <><FiCheckCircle /> Commit Updates</>
                )}
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate('/admin/users')}
              >
                Discard
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUser;
