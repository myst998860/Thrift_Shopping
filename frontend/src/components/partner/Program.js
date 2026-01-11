import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { programService } from '../../services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Move components outside to prevent recreation on each render
const SectionCard = ({ title, children }) => (
  <div style={{ background: '#fffaf6', border: '1px solid #f2eae2', borderRadius: 12, padding: 20, boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
    <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>{title}</div>
    <div style={{ color: '#64748b', marginBottom: 12 }}> </div>
    {children}
  </div>
);

const Tabs = ({ page, onTabClick }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, background: '#f6f3ee', borderRadius: 10, overflow: 'hidden', border: '1px solid #eee' }}>
    {[
      { idx: 1, label: 'Basic Info' },
      { idx: 2, label: 'Program Details' },
      { idx: 3, label: 'Team & Goals' },
    ].map(t => (
      <button
        key={t.idx}
        type="button"
        onClick={() => onTabClick(t.idx)}
        style={{
          padding: '14px 16px',
          fontWeight: 700,
          background: page === t.idx ? '#ffffff' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: page === t.idx ? '#0f172a' : '#475569',
        }}
      >
        {t.label}
      </button>
    ))}
  </div>
);

const ProgramAdd = () => {
  const { id } = useParams(); // Get program ID from URL
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState({
    programTitle: '',
    description: '',
    category: '',
    programImageFile: '',
    startDate: '',
    endDate: '',
    programLocation: '',
    targetItemsToCollect: '',
    estimatedBeneficiaries: '',
    programGoal: '',
    name: '',
    role: '',
    objective: '',
    agree: false,
    status: 'ACTIVE',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchProgramDetails(id);
    }
  }, [id]);

  const fetchProgramDetails = async (programId) => {
    try {
      const data = await programService.getProgram(programId);
      // Map backend data to form structure
      // Note: programImageFile cannot be set from URL, handled separately if needed
      // Ensure dates are in YYYY-MM-DD format for input type="date"
      const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      setFormData({
        programTitle: data.programTitle || '',
        description: data.description || '',
        category: data.category || '',
        programImageFile: '', // Keep empty, only update if user selects new
        startDate: formatDate(data.startDate),
        endDate: formatDate(data.endDate),
        programLocation: data.programLocation || '',
        targetItemsToCollect: data.targetItemsToCollect || '',
        estimatedBeneficiaries: data.estimatedBeneficiaries || '',
        programGoal: data.programGoal || '',
        name: data.name || '',
        role: data.role || '',
        objective: data.objective || '',
        agree: true, // Assume agreed if editing
        status: data.status || 'ACTIVE',
      });
    } catch (err) {
      console.error("Failed to fetch program:", err);
      toast.error("Failed to load program details");
    }
  };

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'programImageFile') {
      setFormData((prev) => ({
        ...prev,
        [name]: e.target.files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  }, []);

  const fieldsPage1 = [
    'programTitle',
    'description',
    'category',
  ];
  const fieldsPage2 = [
    'startDate',
    'endDate',
    'programLocation',
    'targetItemsToCollect',
  ];

  const validate = (fieldsToValidate = null) => {
    const newErrors = {};
    const fields = fieldsToValidate || Object.keys(formData);
    // Fields that are optional and should not be validated
    const optionalFields = ['programImage', 'estimatedBeneficiaries', 'programGoal', 'name', 'role', 'objective', 'agree', 'status', 'programImageFile'];

    fields.forEach((key) => {
      // Skip optional fields
      if (optionalFields.includes(key)) {
        return;
      }

      const val = formData[key];
      if (key === 'agree' && val !== true) {
        newErrors[key] = 'You must agree to the terms';
      } else if (
        (typeof val === 'string' && val.trim() === '') ||
        (Array.isArray(val) && val.length === 0)
      ) {
        newErrors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required`;
      }
    });
    setErrors(newErrors);
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
  };

  const handleNext = () => {
    const result = validate(fieldsPage1);
    if (result.isValid) setPage(2);
  };
  const handleBack = () => setPage(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = validate();
    if (!result.isValid) {
      console.log('Validation failed:', result.errors);
      // Scroll to first error
      const firstErrorField = Object.keys(result.errors)[0];
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }
      return;
    }
    setIsSubmitting(true);
    setApiError('');

    try {
      // Assume formData is your object containing all fields and the file
      // e.g., formData.programImageFile is a File object from an <input type="file" />

      const data = new FormData();

      data.append("programTitle", formData.programTitle.trim());
      data.append("description", formData.description.trim());
      data.append("category", formData.category.trim());

      // For the uploaded file
      if (formData.programImageFile) {
        data.append("file", formData.programImageFile); // match backend @RequestParam("file")
      }

      data.append("startDate", formData.startDate);
      data.append("endDate", formData.endDate);
      data.append("programLocation", formData.programLocation.trim());
      data.append("targetItemsToCollect", formData.targetItemsToCollect.trim());
      data.append("estimatedBeneficiaries", Number(formData.estimatedBeneficiaries || 0));
      data.append("programGoal", formData.programGoal.trim());
      data.append("name", formData.name.trim());
      data.append("role", formData.role.trim());
      data.append("objective", formData.objective.trim());
      data.append("status", formData.status || 'ACTIVE');

      // Partner info (nested object)
      data.append("partner.user_id", sessionStorage.getItem("userId")); // make sure backend can parse nested field


      if (isEditMode && id) {
        await programService.updateProgram(id, data);
        toast.success('Program updated successfully!');
      } else {
        await programService.addProgram(data);
        toast.success('Program added successfully!');
      }

      setTimeout(() => navigate('/partner/programs'), 1500);


    } catch (err) {
      console.error('Program save failed:', err);
      if (err.response?.status === 409) {
        setApiError('Program with this title already exists.');
      } else if (err.response?.data?.message) {
        setApiError(err.response.data.message);
      } else {
        setApiError('Program save failed. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = (field) => ({
    width: '100%',
    padding: '14px 16px',
    fontSize: 16,
    borderRadius: 8,
    border: errors[field] ? '2px solid #e74c3c' : '1px solid #e5e7eb',
    outline: 'none',
    marginBottom: 12,
    background: '#fff',
  });
  const labelStyle = {
    fontSize: 16,
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: 8,
    display: 'block',
  };

  const handleTabClick = useCallback((tabIdx) => {
    if (tabIdx === 2 && page === 1) {
      const result = validate(fieldsPage1);
      if (!result.isValid) return;
    }
    if (tabIdx === 3 && page !== 3) {
      if (page === 1) {
        const result = validate(fieldsPage1);
        if (!result.isValid) return;
      }
      if (page === 2) {
        const result = validate(fieldsPage2);
        if (!result.isValid) return;
      }
    }
    setPage(tabIdx);
  }, [page, formData]);

  return (
    <>
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ maxWidth: 1100, margin: '32px auto 48px', padding: '0 16px' }}>
          {/* Top bar with back and title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <button type="button" onClick={() => navigate(-1)} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}>←</button>
            <div>
              <div style={{ fontSize: 34, fontWeight: 800, color: '#0f172a' }}>Create New Program</div>
              <div style={{ color: '#64748b' }}>Set up a new donation program to collect and distribute items</div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ marginBottom: 14 }}>
            <Tabs page={page} onTabClick={handleTabClick} />
          </div>

          {/* Card */}
          {page === 1 && (
            <SectionCard title="Program Basics">
              <div style={{ color: '#64748b', marginBottom: 12 }}>Enter the fundamental information about your program</div>
              <div>
                <label style={labelStyle} htmlFor="programTitle">Program Title *</label>
                <input id="programTitle" name="programTitle" type="text" value={formData.programTitle} onChange={handleChange} style={inputStyle('programTitle')} placeholder="e.g., Winter Clothing Drive" />
                {errors.programTitle && <div style={{ color: '#e74c3c' }}>{errors.programTitle}</div>}

                <label style={labelStyle} htmlFor="description">Description *</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} style={{ ...inputStyle('description'), height: 110 }} placeholder="Describe what your program aims to do and its significance..." />
                {errors.description && <div style={{ color: '#e74c3c' }}>{errors.description}</div>}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle} htmlFor="category">Program Category *</label>
                    <select id="category" name="category" value={formData.category} onChange={handleChange} style={inputStyle('category')}>
                      <option value="">Select category</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Emergency Relief">Emergency Relief</option>
                      <option value="Education">Education</option>
                      <option value="Seasonal">Seasonal</option>
                      <option value="Community">Community</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.category && <div style={{ color: '#e74c3c' }}>{errors.category}</div>}
                  </div>
                  <div>
                    <label style={labelStyle} htmlFor="programImageFile">Program Image</label>
                    <input id="programImageFile" name="programImageFile" type="file" onChange={handleChange} style={inputStyle('programImageFile')} />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                <button type="button" onClick={handleNext} style={{ padding: '12px 18px', fontWeight: 800, backgroundColor: '#153c67', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                  Next: Program Details
                </button>
              </div>
            </SectionCard>
          )}

          {page === 2 && (
            <SectionCard title="Program Details">
              <div style={{ color: '#64748b', marginBottom: 12 }}>Set the timeline, location, and targets for your program</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle} htmlFor="startDate">Start Date *</label>
                  <input id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleChange} style={inputStyle('startDate')} />
                  {errors.startDate && <div style={{ color: '#e74c3c' }}>{errors.startDate}</div>}
                </div>
                <div>
                  <label style={labelStyle} htmlFor="endDate">End Date *</label>
                  <input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleChange} style={inputStyle('endDate')} />
                  {errors.endDate && <div style={{ color: '#e74c3c' }}>{errors.endDate}</div>}
                </div>
              </div>

              <label style={labelStyle} htmlFor="programLocation">Program Location *</label>
              <input id="programLocation" name="programLocation" type="text" value={formData.programLocation} onChange={handleChange} style={inputStyle('programLocation')} placeholder="e.g., Downtown Shelter District" />
              {errors.programLocation && <div style={{ color: '#e74c3c' }}>{errors.programLocation}</div>}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle} htmlFor="targetItemsToCollect">Target Items to Collect *</label>
                  <input id="targetItemsToCollect" name="targetItemsToCollect" type="text" value={formData.targetItemsToCollect} onChange={handleChange} style={inputStyle('targetItemsToCollect')} placeholder="e.g., 500" />
                  {errors.targetItemsToCollect && <div style={{ color: '#e74c3c' }}>{errors.targetItemsToCollect}</div>}
                </div>
                <div>
                  <label style={labelStyle} htmlFor="estimatedBeneficiaries">Estimated Beneficiaries</label>
                  <input id="estimatedBeneficiaries" name="estimatedBeneficiaries" type="number" value={formData.estimatedBeneficiaries} onChange={handleChange} style={inputStyle('estimatedBeneficiaries')} placeholder="e.g., 150" />
                </div>
              </div>

              <label style={labelStyle} htmlFor="programGoal">Program Goals</label>
              <textarea id="programGoal" name="programGoal" value={formData.programGoal} onChange={handleChange} style={{ ...inputStyle('programGoal'), height: 110 }} placeholder="List the specific goals and outcomes you want to achieve..." />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                <button type="button" onClick={() => setPage(1)} style={{ padding: '12px 16px', fontWeight: 700, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}>
                  Back
                </button>
                <button type="button" onClick={() => { const result = validate(fieldsPage2); if (result.isValid) setPage(3); }} style={{ padding: '12px 18px', fontWeight: 800, backgroundColor: '#153c67', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                  Next: Team & Goals
                </button>
              </div>
            </SectionCard>
          )}

          {page === 3 && (
            <>
              <SectionCard title="Team Members">
                <div style={{ color: '#64748b', marginBottom: 12 }}>Add the people who will be leading this program</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle} htmlFor="name">Name</label>
                    <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} style={inputStyle('name')} placeholder="Team member name" />
                  </div>
                  <div>
                    <label style={labelStyle} htmlFor="role">Role</label>
                    <input id="role" name="role" type="text" value={formData.role} onChange={handleChange} style={inputStyle('role')} placeholder="e.g., Coordinator" />
                  </div>
                </div>
                <div style={{ marginTop: 8, borderTop: '1px dashed #e6e2dc', paddingTop: 8, color: '#94a3b8', fontSize: 14 }}>+ Add Team Member</div>
              </SectionCard>

              <div style={{ height: 16 }} />

              <SectionCard title="Program Objectives">
                <div style={{ color: '#64748b', marginBottom: 12 }}>What are the key objectives and outcomes?</div>
                <input type="text" value={formData.objective} name="objective" onChange={handleChange} style={inputStyle('objective')} placeholder="Objective 1" />
                <div style={{ marginTop: 8, borderTop: '1px dashed #e6e2dc', paddingTop: 8, color: '#94a3b8', fontSize: 14 }}>+ Add Objective</div>
              </SectionCard>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                <button type="button" onClick={() => setPage(2)} style={{ padding: '12px 16px', fontWeight: 700, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}>
                  Back
                </button>
                <button type="submit" disabled={isSubmitting} style={{ padding: '12px 18px', fontWeight: 800, backgroundColor: '#153c67', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
                  {isSubmitting ? 'Creating...' : 'Create Program'}
                </button>
              </div>
            </>
          )}

          {apiError && (
            <div style={{ marginTop: 16, padding: 12, backgroundColor: '#fce4e4', color: '#e74c3c', borderRadius: 8, fontWeight: 600 }}>
              {apiError}
            </div>
          )}
        </div>
      </form>

      <ToastContainer />
    </>
  );
};

export default ProgramAdd;
