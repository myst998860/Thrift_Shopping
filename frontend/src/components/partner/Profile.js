import React, { useState, useEffect } from 'react';
import { userService, partnerService, venueService,profileService } from '../../services/api';
import { useNavigate, useParams } from 'react-router-dom';

const Profile = () => {
  const { userId } = useParams(); // Optional: only exists when viewing another user
  const [profile, setProfile] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [apiError, setApiError] = useState('');

  // Sync form with profile whenever profile changes
  useEffect(() => {
    setForm(profile);
  }, [profile]);

  useEffect(() => {
    const savedToken = localStorage.getItem('jwtToken');
    setToken(savedToken);

    async function fetchProfile() {
      try {
        const data = userId
          ? await partnerService.getPartner(userId) // Fetch partner by ID
          : await profileService.getProfile();   // Fetch logged-in user profile
        setProfile(data);
      } catch (err) {
        console.error('Profile fetch error:', err);
        setApiError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    }

    async function fetchStats() {
      try {
        const response = await fetch('http://localhost:8080/api/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setStats([
          { label: 'Venues Listed', value: data.venues, icon: '📍', color: '#a855f7' },
          { label: 'Ongoing Bookings', value: data.bookings, icon: '📅', color: '#f59e42' },
        ]);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    }

    fetchProfile();
    fetchStats();
  }, [userId]);

  const handleEdit = () => {
    setEditMode(true);
    setForm(profile);
  };

  const handleCancel = () => setEditMode(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {
      const payload = {
        fullname: form.fullname || '',
        email: form.email || '',
        phoneNumber: form.phoneNumber || '',
        company: form.company || ''
      };

      // ✅ Optimistic update
      setProfile({ ...profile, ...payload });

      const updatedUser = await profileService.updateProfile(payload);
      setProfile(updatedUser); // ✅ Update profile from API response
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: 50 }}>Loading profile...</div>;
  if (!profile || Object.keys(profile).length === 0) return <div style={{ textAlign: 'center', marginTop: 50 }}>{apiError || 'Profile not found.'}</div>;

  return (
    <div style={{ maxWidth: 1200, margin: '32px auto', padding: 24 }}>
      {/* Breadcrumb */}
      <div style={{ color: '#888', fontSize: 15, marginBottom: 8 }}>
        <span>Partner</span> <span style={{ margin: '0 8px' }}>/</span>{' '}
        <span style={{ color: '#222', fontWeight: 500 }}>Dashboard</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: 0 }}>Partner Profile</h1>
          <div style={{ color: '#888', fontSize: 18, marginTop: 4 }}>
            Manage your personal and professional information
          </div>
        </div>
        {!editMode && (
          <button
            style={{
              background: '#111',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px 28px',
              fontWeight: 600,
              fontSize: 17,
              cursor: 'pointer',
            }}
            onClick={handleEdit}
          >
            <span style={{ marginRight: 8, fontSize: 18 }}>✏️</span> Edit Profile
          </button>
        )}
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', gap: 32, marginBottom: 32, flexWrap: 'wrap' }}>
        {/* Left Card */}
        <div
          style={{
            flex: 1,
            minWidth: 320,
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #eee',
            padding: 36,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: '50%',
              background: '#f3f3f3',
              marginBottom: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 48,
              color: '#bbb',
            }}
          >
            <span role="img" aria-label="avatar">
              👤
            </span>
          </div>
          <div style={{ fontWeight: 700, fontSize: 24, marginBottom: 6 }}>{profile.fullname}</div>
          <div
            style={{
              background: '#f5f5f5',
              color: '#222',
              fontWeight: 600,
              fontSize: 13,
              borderRadius: 16,
              padding: '4px 16px',
              marginBottom: 18,
              display: 'inline-block',
            }}
          >
            {profile.role || 'N/A'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: 280 }}>
            <InfoRow icon="✉️" text={profile.email} />
            <InfoRow icon="📞" text={profile.phoneNumber} />
            <InfoRow icon="🏢" text={profile.company || 'N/A'} />
          </div>
        </div>

        {/* Right Card */}
        <div style={{ flex: 2, minWidth: 340, background: '#fff', borderRadius: 12, border: '1px solid #eee', padding: 36 }}>
          <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Personal & Professional Information</div>
          <div style={{ color: '#888', fontSize: 16, marginBottom: 24 }}>
            Update your personal details and business information
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
            <FormField label="Full Name" name="fullname" value={form.fullname} userValue={profile.fullname} editMode={editMode} handleChange={handleChange} />
            <FormField label="Phone Number" name="phoneNumber" value={form.phoneNumber} userValue={profile.phoneNumber} editMode={editMode} handleChange={handleChange} />
            <FormField label="Email Address" name="email" value={form.email} userValue={profile.email} editMode={editMode} handleChange={handleChange} />
            <FormField label="Company" name="company" value={form.company} userValue={profile.company} editMode={editMode} handleChange={handleChange} />
          </div>

          {editMode && (
            <div style={{ marginTop: 32, display: 'flex', gap: 16 }}>
              <button
                onClick={handleSave}
                style={{
                  background: '#111',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 32px',
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: 'pointer',
                }}
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                style={{
                  background: '#fff',
                  color: '#111',
                  border: '1px solid #bbb',
                  borderRadius: 8,
                  padding: '10px 32px',
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Activity Summary */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #eee', padding: 32, marginTop: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Activity Summary</div>
        <div style={{ color: '#888', fontSize: 16, marginBottom: 24 }}>Your administrative activity and performance metrics</div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {stats.map((stat) => (
            <div
              key={stat.label}
              style={{
                flex: 1,
                minWidth: 180,
                background: '#fafbfc',
                borderRadius: 12,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                border: '1px solid #f0f0f0',
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>{stat.icon}</div>
              <div className="stat-value">{stat.value}</div>
              <div style={{ color: '#888', fontSize: 15, marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ icon, text }) => (
  <div style={{ color: '#555', fontSize: 16, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
    <span style={{ fontSize: 18 }}>{icon}</span> {text}
  </div>
);

const FormField = ({ label, name, value, userValue, editMode, handleChange }) => (
  <div style={{ flex: 1, minWidth: 220 }}>
    <div style={{ fontWeight: 600, marginBottom: 2 }}>{label}</div>
    {editMode ? (
      <input name={name} value={value || ''} onChange={handleChange} style={inputStyle} />
    ) : (
      <div style={infoStyle}>{userValue || 'N/A'}</div>
    )}
  </div>
);

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  fontSize: 15,
  border: '1px solid #ddd',
  borderRadius: 6,
  marginBottom: 2,
  marginTop: 2,
  background: '#fafbfc',
  fontFamily: 'inherit',
};

const infoStyle = {
  fontSize: 16,
  color: '#222',
  marginBottom: 2,
  marginTop: 2,
  fontWeight: 500,
};

export default Profile;