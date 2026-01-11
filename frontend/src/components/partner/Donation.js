import React, { useState, useEffect, useRef } from 'react';
import '../../styles/partner/Donation.css';
import { donationAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import {
  FiSearch,
  FiMoreVertical,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiUserCheck,
  FiFilter,
  FiRefreshCw
} from 'react-icons/fi';

const StatusBadge = ({ status }) => {
  const statusClean = status?.toLowerCase().replace(/_/g, '-').replace(/\s+/g, '-') || 'pending';
  const statusClass = `donation-status-${statusClean}`;
  return (
    <span className={`donation-status-badge ${statusClass}`}>
      {status?.replace(/_/g, ' ') || 'Pending'}
    </span>
  );
};

const StatusDropdown = ({ donation, onChange }) => {
  const currentStatus = donation.status?.toLowerCase() || "pending";

  // Define allowed transitions
  const allowedTransitions = {
    pending: ["pending", "confirmed", "cancelled"],
    confirmed: ["confirmed", "pickedup", "cancelled"],
    pickedup: ["pickedup", "delivered", "cancelled"],
    delivered: ["delivered"],
    cancelled: ["cancelled"],
    assigned_to_admin: ["assigned_to_admin", "confirmed", "cancelled"]
  };

  const options = allowedTransitions[currentStatus] || [currentStatus];

  if (options.length <= 1) {
    return null;
  }

  return (
    <select
      className="status-select"
      value={currentStatus}
      onChange={(e) => onChange(donation.donationId, e.target.value)}
    >
      {options.map((status) => (
        <option key={status} value={status}>
          {status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')}
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
  const [searchTerm, setSearchTerm] = useState('');
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
  const fetchDonations = async () => {
    setLoading(true);
    try {
      const response = await donationAPI.listDonations();
      setDonations(response);
      setError(null);
    } catch (err) {
      console.error("Error fetching donations:", err);
      setError('Failed to fetch donations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this donation?")) return;
    try {
      await donationAPI.deleteDonation(id);
      setDonations((prev) => prev.filter((d) => d.donationId !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete donation.");
    }
  };

  const handleStatusChange = async (donationId, newStatus) => {
    try {
      await donationAPI.updateDonationStatus(donationId, newStatus);
      setDonations((prev) =>
        prev.map((d) =>
          d.donationId === donationId ? { ...d, status: newStatus } : d
        )
      );
    } catch (err) {
      console.error("Status update failed:", err);
      alert("Failed to update status.");
    }
  };

  const handleAssignToAdmin = async (id) => {
    if (!window.confirm("Assign this donation pickup to Admin?")) return;
    try {
      await donationAPI.assignToAdmin(id);
      setDonations(prev => prev.map(d => d.donationId === id ? { ...d, status: 'assigned_to_admin' } : d));
    } catch (err) {
      console.error("Assign failed:", err);
      alert("Failed to assign.");
    }
  };

  const filteredDonations = donations.filter(d =>
    d.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: donations.length,
    pending: donations.filter(d => d.status === 'pending').length,
    confirmed: donations.filter(d => d.status === 'confirmed').length,
    delivered: donations.filter(d => d.status === 'delivered').length,
  };

  return (
    <div className="donation-management-container">
      <header className="donation-header">
        <div className="header-title">
          <h1>Donation Management</h1>
          <p>Review and manage all incoming donations for your programs</p>
        </div>
        <div className="donation-stats">
          <div className="stat-item">
            <span className="stat-label">Total</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Pending</span>
            <span className="stat-value" style={{ color: '#64748b' }}>{stats.pending}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Confirmed</span>
            <span className="stat-value" style={{ color: '#15803d' }}>{stats.confirmed}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Delivered</span>
            <span className="stat-value" style={{ color: '#7e22ce' }}>{stats.delivered}</span>
          </div>
        </div>
      </header>

      <div className="donation-controls">
        <div className="search-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, email or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          className="action-button"
          onClick={fetchDonations}
          title="Refresh Data"
        >
          <FiRefreshCw />
        </button>
      </div>

      <div className="donation-table-wrapper">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading donations...</div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>{error}</div>
        ) : filteredDonations.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>No donations found.</div>
        ) : (
          <table className="donation-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Donor Info</th>
                <th>Location</th>
                <th>Condition</th>
                <th>Items</th>
                <th>Pickup Date</th>
                <th>Status</th>
                <th>Update</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonations.map((donation) => (
                <tr key={donation.donationId}>
                  <td>#{donation.donationId}</td>
                  <td>
                    <div className="donor-info">
                      <span className="donor-name">{donation.fullName}</span>
                      <span className="donor-email">{donation.email}</span>
                      <span className="donor-phone" style={{ fontSize: '11px', color: '#888' }}>{donation.phoneNumber}</span>
                    </div>
                  </td>
                  <td>{donation.city}</td>
                  <td>{donation.overallCondition}</td>
                  <td>
                    <div className="clothing-details">
                      {[
                        donation.shirtsAndTops && "Shirts",
                        donation.dressesAndSkirts && "Dresses",
                        donation.shoes && "Shoes",
                        donation.pantsAndJeans && "Pants",
                        donation.jacketsAndCoats && "Jackets",
                        donation.accessories && "Accessories",
                        donation.childrensClothing && "Children",
                        donation.undergarments && "Undergarments",
                      ].filter(Boolean).map((tag, idx) => (
                        <span key={idx} className="clothing-tag">{tag}</span>
                      )) || '—'}
                    </div>
                  </td>
                  <td>
                    {donation.preferredPickupDate
                      ? new Date(donation.preferredPickupDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'N/A'}
                  </td>
                  <td>
                    <StatusBadge status={donation.status} />
                  </td>
                  <td>
                    <StatusDropdown
                      donation={donation}
                      onChange={handleStatusChange}
                    />
                  </td>
                  <td style={{ textAlign: 'center', position: 'relative' }}>
                    <button
                      className="action-button"
                      onClick={() => setMenuOpenId(menuOpenId === donation.donationId ? null : donation.donationId)}
                    >
                      <FiMoreVertical />
                    </button>

                    {menuOpenId === donation.donationId && (
                      <div className="dropdown-menu" ref={menuRef}>
                        <button className="menu-item" onClick={() => navigate(`/admin/donations/${donation.donationId}`)}>
                          <FiEye /> View Details
                        </button>
                        <button className="menu-item" onClick={() => navigate(`/admin/donations/edit/${donation.donationId}`)}>
                          <FiEdit2 /> Edit
                        </button>
                        <button className="menu-item" onClick={() => handleAssignToAdmin(donation.donationId)}>
                          <FiUserCheck /> Assign to Admin
                        </button>
                        <button className="menu-item delete" onClick={() => handleDelete(donation.donationId)}>
                          <FiTrash2 /> Delete
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
    </div>
  );
};

export default DonationManagement;
