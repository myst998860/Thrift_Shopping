import React, { useState, useEffect, useRef } from 'react';
import '../../styles/admin/PartnerManagement.css';
import { donationAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const StatusBadge = ({ status }) => {
  const color = {
    confirmed: "#4caf50",
    pickedup: "#2196f3",
    delivered: "#9c27b0",
    cancelled: "#f44336",
    pending: "#999"
  }[status?.toLowerCase()] || "#999";

  return (
    <span
      style={{
        background: color,
        color: "white",
        padding: "4px 10px",
        borderRadius: 6,
        fontSize: 13,
      }}
    >
      {(status || "Pending").toUpperCase()}
    </span>
  );
};

const StatusDropdown = ({ donation, onChange }) => {
  const statuses = ["pending", "confirmed", "pickedup", "delivered", "cancelled"];

  return (
    <select
      style={{
        padding: 6,
        borderRadius: 6,
        border: "1px solid #ccc",
        cursor: "pointer",
      }}
      value={donation.status?.toLowerCase() || "pending"}
      onChange={(e) => onChange(donation.donationId, e.target.value)}
    >
      {statuses.map((status) => (
        <option key={status} value={status}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </option>
      ))}
    </select>
  );
};

const DonationManagement = () => {
  const [donations, setDonations] = useState([]);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const menuRef = useRef();
  const navigate = useNavigate();

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpenId(null);
      }
    };
    if (menuOpenId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpenId]);

  // Fetch donations
  useEffect(() => {
    const fetchDonations = async () => {
      setLoading(true);
      try {
        const response = await donationAPI.listDonations();
        setDonations(response);
      } catch (err) {
        console.error("Error fetching donations:", err);
        setError('Failed to fetch donations.');
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this donation?")) return;
    try {
      await donationAPI.deleteDonation(id);
      setDonations((prev) => prev.filter((d) => d.donationId !== id));
      alert("Donation deleted successfully!");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete donation.");
    }
  };

  const handleViewDonation = (donation) => {
    navigate(`/admin/donations/${donation.donationId}`);
  };

  const handleEditDonation = (donation) => {
    navigate(`/admin/donations/edit/${donation.donationId}`);
  };

  // Status Change Function
  const handleStatusChange = async (donationId, newStatus) => {
    try {
      await donationAPI.updateDonationStatus(donationId, newStatus);

      setDonations((prev) =>
        prev.map((d) =>
          d.donationId === donationId ? { ...d, status: newStatus } : d
        )
      );

      alert("Status updated successfully!");
    } catch (err) {
      console.error("Status update failed:", err);
      alert("Failed to update status.");
    }
  };

  if (!donations?.length && !loading) {
    return <p>No donations found.</p>;
  }

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 2px 8px #eee' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Donation Management</h1>
      <p style={{ color: '#888', marginBottom: 24 }}>Manage all donations from users</p>

      <input
        type="text"
        placeholder="Search donations..."
        style={{
          width: 320,
          padding: 8,
          borderRadius: 6,
          border: '1px solid #ddd',
          marginBottom: 16,
        }}
      />

      {loading ? (
        <p>Loading donations...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
          <thead>
            <tr style={{ background: '#f7f7f7', textAlign: 'left' }}>
              <th style={{ padding: 10 }}>ID</th>
              <th style={{ padding: 10 }}>Full Name</th>
              <th style={{ padding: 10 }}>Email</th>
              <th style={{ padding: 10 }}>Phone</th>
              <th style={{ padding: 10 }}>City</th>
              <th style={{ padding: 10 }}>Condition</th>
              <th style={{ padding: 10 }}>Quantity</th>
              <th style={{ padding: 10 }}>Pickup Date</th>
              <th style={{ padding: 10 }}>Clothing Items</th>
              <th style={{ padding: 10 }}>Status</th>
              <th style={{ padding: 10 }}>Change Status</th>
              <th style={{ padding: 10, textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {donations.map((donation) => (
              <tr key={donation.donationId} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 10 }}>{donation.donationId}</td>
                <td style={{ padding: 10 }}>{donation.fullName}</td>
                <td style={{ padding: 10 }}>{donation.email}</td>
                <td style={{ padding: 10 }}>{donation.phoneNumber}</td>
                <td style={{ padding: 10 }}>{donation.city}</td>
                <td style={{ padding: 10 }}>{donation.overallCondition}</td>
                <td style={{ padding: 10 }}>{donation.estimatedQuantity}</td>
                <td style={{ padding: 10 }}>
                  {donation.preferredPickupDate
                    ? new Date(donation.preferredPickupDate).toLocaleDateString()
                    : 'N/A'}
                </td>

                <td style={{ padding: 10 }}>
                  {[
                    donation.shirtsAndTops && "Shirts",
                    donation.dressesAndSkirts && "Dresses",
                    donation.shoes && "Shoes",
                    donation.pantsAndJeans && "Pants",
                    donation.jacketsAndCoats && "Jackets",
                    donation.accessories && "Accessories",
                    donation.childrensClothing && "Children",
                    donation.undergarments && "Undergarments",
                  ]
                    .filter(Boolean)
                    .join(', ') || '—'}
                </td>

                <td style={{ padding: 10 }}>
                  <StatusBadge status={donation.status} />
                </td>

                <td style={{ padding: 10 }}>
                  <StatusDropdown
                    donation={donation}
                    onChange={handleStatusChange}
                  />
                </td>

                <td style={{ padding: 10, position: 'relative', textAlign: 'center' }}>
                  <button
                    style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}
                    onClick={() =>
                      setMenuOpenId(menuOpenId === donation.donationId ? null : donation.donationId)
                    }
                  >
                    ⋮
                  </button>

                  {menuOpenId === donation.donationId && (
                    <div
                      ref={menuRef}
                      style={{
                        position: 'absolute',
                        top: 30,
                        right: 0,
                        background: '#fff',
                        border: '1px solid #eee',
                        borderRadius: 8,
                        boxShadow: '0 2px 8px #eee',
                        zIndex: 10,
                        minWidth: 180,
                      }}
                    >
                      <div
                        style={{
                          padding: '10px 16px',
                          fontWeight: 600,
                          color: '#888',
                          borderBottom: '1px solid #f0f0f0',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: 40,
                        }}
                      >
                        Actions
                      </div>

                      <button
                        style={menuBtnStyle}
                        onClick={() => {
                          setMenuOpenId(null);
                          handleViewDonation(donation);
                        }}
                      >
                        View Donation
                      </button>

                      <button
                        style={menuBtnStyle}
                        onClick={() => {
                          setMenuOpenId(null);
                          handleEditDonation(donation);
                        }}
                      >
                        Edit Donation
                      </button>

                      <button
                        style={{ ...menuBtnStyle, color: '#d9534f' }}
                        onClick={() => {
                          setMenuOpenId(null);
                          handleDelete(donation.donationId);
                        }}
                      >
                        Delete Donation
                      </button>
                    </div>
                  )}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const menuBtnStyle = {
  display: 'block',
  width: '100%',
  padding: '10px 16px',
  background: 'none',
  border: 'none',
  textAlign: 'left',
  fontSize: 15,
  cursor: 'pointer',
  color: '#222',
  borderBottom: '1px solid #f0f0f0',
};

export default DonationManagement;
