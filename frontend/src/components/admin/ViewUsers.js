import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { userService } from '../../services/api';

const ViewUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const dto = await userService.getUser(userId);
        setUser(dto);
      } catch {
        setApiError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  if (loading) return <p>Loading user details...</p>;
  if (apiError) return <p style={{ color: 'red' }}>{apiError}</p>;
  if (!user) return <p>User not found.</p>;

  return (
    <div style={{
      maxWidth: 600,
      margin: 'auto',
      padding: 20,
      border: '1px solid #ddd',
      borderRadius: 8,
      backgroundColor: '#fafafa',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h2>User Details</h2>

      <UserDetail label="Full Name" value={user.fullname} />
      <UserDetail label="Email" value={user.email} />
      <UserDetail label="Phone Number" value={user.phoneNumber} />
      <UserDetail label="Role" value={user.role} />

      {user.role === 'PARTNER' && (
        <>
          <UserDetail label="Company" value={user.company} />
          <UserDetail label="PAN Card" value={user.panCard} />
          <UserDetail label="Business Transcripts" value={user.businessTranscripts} />
        </>
      )}

      <button
        onClick={() => navigate('/admin/users')}
        style={{
          marginTop: 20,
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          fontWeight: '600'
        }}
      >
        Back to Users
      </button>
    </div>
  );
};

const UserDetail = ({ label, value }) => (
  <div style={{ marginBottom: 12, display: 'flex' }}>
    <strong style={{ width: 150 }}>{label}:</strong>
    <span>{value || '-'}</span>
  </div>
);

export default ViewUser;
