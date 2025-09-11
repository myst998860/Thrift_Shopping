import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { partnerService } from '../../services/api';

const ViewPartner = () => {
  const { partnerId } = useParams();
  const navigate = useNavigate();

  const [partner, setPartner] = useState(null);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const data = await partnerService.getPartner(partnerId);
        setPartner(data);
      } catch {
        setApiError('Failed to load partner data');
      } finally {
        setLoading(false);
      }
    };
    fetchPartner();
  }, [partnerId]);

  if (loading) return <p>Loading partner details...</p>;
  if (apiError) return <p style={{ color: 'red' }}>{apiError}</p>;
  if (!partner) return <p>Partner not found.</p>;

  return (
    <div
      style={{
        maxWidth: 600,
        margin: 'auto',
        padding: 20,
        border: '1px solid #ddd',
        borderRadius: 8,
        backgroundColor: '#fafafa',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <h2>Partner Details</h2>

      <Detail label="Full Name" value={partner.fullname} />
      <Detail label="Email" value={partner.email} />
      <Detail label="Phone Number" value={partner.phoneNumber} />
      <Detail label="Company" value={partner.company} />
      <Detail label="PAN Card" value={partner.panCard} />
      <Detail label="Business Transcripts" value={partner.businessTranscripts} />
      <Detail label="Status" value={partner.status} />

      <button
        onClick={() => navigate('/admin/partners')}
        style={{
          marginTop: 20,
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          fontWeight: '600',
        }}
      >
        Back to Partners
      </button>
    </div>
  );
};

const Detail = ({ label, value }) => (
  <div style={{ marginBottom: 12, display: 'flex' }}>
    <strong style={{ width: 160 }}>{label}:</strong>
    <span>{value || '-'}</span>
  </div>
);

export default ViewPartner;
