import React, { useState, useEffect } from 'react';
import '../../styles/admin/PartnerManagement.css';
import { partnerService,venueService } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const PartnerManagement = () => {
  const [partnersData, setPartnersData] = useState([]);
  const [activeTab, setActiveTab] = useState('All Partners');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionMenu, setActionMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
 const fetchPartnersAndVenues = async () => {
  try {
    setLoading(true);
    // Fetch partners
    const partners = await partnerService.listPartners();
    // Fetch all venues
    const venues = await venueService.listVenue();

    // Add venues count to each partner
    const partnersWithVenueCount = (partners || []).map(partner => {
      // Corrected: access the partner object inside each venue
      const venueCount = venues.filter(v => v.partnerId === partner.user_id).length;
      console.log("Partner Data:", partners);
      console.log(`Partner ${partner.user_id} has ${venueCount} venues`);
      return { ...partner, venues: venueCount };
    });

    setPartnersData(partnersWithVenueCount);
    setError(null);
  } catch (err) {
    console.error('Error fetching PARTNERS or VENUES:', err);
    setError('Failed to load partners or venues. Please try again.');
    setPartnersData([]);
  } finally {
    setLoading(false);
  }
};

fetchPartnersAndVenues();
  }, []);

  const handleActionClick = (partnerId) => {
    setActionMenu(actionMenu === partnerId ? null : partnerId);
  };

  const pendingCount = partnersData.filter(p => p.status === 'Pending').length;

  const filteredPartners = partnersData.filter(partner => {
    const term = searchTerm?.toLowerCase() || '';

    const status = partner.status || '';
    const business = partner.company || '';
    const owner = partner.fullname || '';
    const email = partner.email || '';

    const statusMatch = activeTab === 'All Partners' || status === activeTab;
    const searchMatch =
      business.toLowerCase().includes(term) ||
      owner.toLowerCase().includes(term) ||
      email.toLowerCase().includes(term);

    return statusMatch && searchMatch;
  });

  const handleApprove = async (id) => {
    try {
      await partnerService.updatePartnerStatus(id, 'Verified');
      setPartnersData(partnersData.map(p => p.id === id ? { ...p, status: 'Verified' } : p));
    } catch (error) {
      console.error("Failed to approve partner:", error);
    }
  };

  const handleReject = async (id) => {
    try {
      await partnerService.updatePartnerStatus(id, 'Rejected');
      setPartnersData(partnersData.filter(p => p.id !== id)); // Or update status
    } catch (error) {
      console.error("Failed to reject partner:", error);
    }
  };

  const handleSuspend = async (id) => {
    try {
      await partnerService.updatePartnerStatus(id, 'Inactive');
      setPartnersData(partnersData.map(p => p.id === id ? { ...p, status: 'Inactive' } : p));
      setActionMenu(null); // Close menu
    } catch (error) {
      console.error("Failed to suspend partner:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this partner?')) {
      try {
        await partnerService.deletePartner(id);
        setPartnersData(partnersData.filter(p => p.user_id !== id));
      } catch (error) {
        console.error("Failed to delete partner:", error);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const handleAdd = () => {
    navigate('/admin/partners/new');
    setActionMenu(null);
  };

  const handleEditPartner = (partner) => {
    if (!partner?.user_id) {
      console.error("Invalid partner ID:", partner?.user_id);
      return;
    }
    navigate(`/admin/partners/edit/${partner.user_id}`);
  };

  const handleViewPartner = (partner) => {
    if (!partner?.user_id) {
      console.error("Invalid partner ID:", partner?.user_id);
      return;
    }
    navigate(`/admin/partners/${partner.user_id}`);
  };

  const StatusBadge = ({ status }) => {
    const statusClasses = `status-badge ${status === 'Active' ? 'status-active' : 'status-inactive'}`;
    return <span className={statusClasses}>{status}</span>;
  };


  return (
    <div className="partner-management">
      <div className="header">
        <div>
          <h1>Partner Management</h1>
          <p>Manage venue partner and verification requests</p>
        </div>
        <button
          onClick={handleAdd}
          style={{
            background: '#111',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '10px 22px',
            fontWeight: 600,
            fontSize: 16,
            cursor: 'pointer',
          }}
        >
          + Add New Partner
        </button>
      </div>

      <div className="user-list-container">
        <div className="user-list-header">
          <h2>All Partners</h2>
          <p>A list of all Partners registered on the platform</p>
        </div>
        <div className="search-bar-container">
          <span className="search-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search user by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="tabs">
          <button className={activeTab === 'All Partners' ? 'active' : ''} onClick={() => setActiveTab('All Partners')}>
            All Partners
          </button>
          <button className={activeTab === 'Verified' ? 'active' : ''} onClick={() => setActiveTab('Verified')}>
            Verified
          </button>
          <button className={activeTab === 'Pending' ? 'active' : ''} onClick={() => setActiveTab('Pending')}>
            Pending
            {pendingCount > 0 && <span className="pending-count">{pendingCount}</span>}
          </button>
        </div>
        {activeTab === 'Pending' ? (
          <div className="pending-requests-container">
            <div className="pending-requests-header">
              <h2>Pending verification requests</h2>
              <p>Review and approve new partner application</p>
            </div>
            <div className="pending-requests-list">
              {filteredPartners.map((partner) => (
                <div key={partner.user_id} className="pending-request-card">
                  <div className="partner-info">
                    <h3>{partner.businessName}</h3>
                    <p>Owner: {partner.owner}</p>
                    <p>Email: {partner.email}</p>
                    <p>Reg#: {partner.regNumber}</p>
                    <p>Submitted: {partner.submitted}</p>
                  </div>
                  <div className="partner-actions">
                    <div className="document-actions">
                      <button className="view-doc-btn">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-eye"
                          viewBox="0 0 16 16"
                        >
                          <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.816 1.097-2.074 2.157-3.668 2.843C9.879 11.832 8.12 12.5 8 12.5s-1.879-.668-3.168-1.457A13.133 13.133 0 0 1 1.172 8z" />
                          <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
                        </svg>
                        View Document
                      </button>
                      <button className="download-btn">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          className="bi bi-download"
                          viewBox="0 0 16 16"
                        >
                          <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                          <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
                        </svg>
                        Download
                      </button>
                    </div>
                    <div className="approval-actions">
                      <button className="reject-btn" onClick={() => handleReject(partner.user_id)}>Reject</button>
                      <button className="approve-btn" onClick={() => handleApprove(partner.user_id)}>Approve</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="partner-table-container">
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Business Name</th>
        <th>Owner</th>
        <th>Email</th>
        <th>Contact</th>
        <th>Venues</th>
        <th>Status</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      {filteredPartners.map((partner) => (
        <tr key={partner.user_id}>
          <td>{partner.user_id}</td>
          <td>{partner.company}</td>
          <td>{partner.fullname}</td>
          <td>{partner.email}</td>
          <td>{partner.phoneNumber}</td>
          <td>{partner.venues || 0}</td>
          <td>
                    <StatusBadge status={partner.status} />
                  </td>

                    <td className="action-cell">
                      <div
                        className={`action-menu-button ${actionMenu === partner.user_id ? 'active' : ''}`}
                        onClick={() => handleActionClick(partner.user_id)}
                      >
                        ...
                      </div>
                      {actionMenu === partner.user_id && (
                        <div className="action-menu">
                          <button onClick={() => handleViewPartner(partner)}>View Partner</button>
                          <button onClick={() => handleEditPartner(partner)}>Edit Partner</button>
                          {/* <button onClick={() => handleSuspend(partner.user_id)}>Suspend Partner</button> */}
                          <button onClick={() => handleDelete(partner.user_id)}>Delete Partner</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerManagement;