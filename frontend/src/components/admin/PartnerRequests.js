import { useEffect, useState } from "react";
import { partnerService } from "../../services/api";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const showSuccessToast = (message) => {
  toast.success(message, {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
};

const showErrorToast = (message) => {
  toast.error(message, {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
};

const PartnerRequests = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await partnerService.listPartners();
        const pendingPartners = response.filter(
          (partner) => partner.status.toLowerCase() === 'pending'
        );
        setPartners(pendingPartners);
      } catch (err) {
        console.error('Error loading partners:', err);
        setError('Failed to load partner requests.');
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

 const handleApprove = async (id) => {
  try {
    await partnerService.approvePartner(id);
    setPartners((prev) => prev.filter((partner) => partner.user_id !== id));
    showSuccessToast('Partner has been approved');
  } catch (err) {
    console.error('Error approving partner:', err);
    showErrorToast('Failed to approve partner');
  }
};

const handleReject = async (id) => {
  try {
    await partnerService.deletePartner(id);
    setPartners((prev) => prev.filter((partner) => partner.user_id !== id));
    showSuccessToast('Partner has been rejected');
  } catch (err) {
    console.error('Error rejecting partner:', err);
    showErrorToast('Failed to reject partner');
  }
};
  return (
    <>
      <ToastContainer />
      <section className="partner-requests">
        <h2>Partner Verification Requests</h2>
        <p>Review and approve new partner applications</p>

        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && partners.length === 0 && <p>No pending requests.</p>}

        {partners.map((partner) => (
          <div key={partner.user_id} className="request-card">
            <strong>{partner.fullname}</strong>
            <div>Email: {partner.email}</div>
            <div>Phone: {partner.phoneNumber}</div>
            <div>Company: {partner.company}</div>
            <div>Requested: {new Date(partner.joinDate).toLocaleDateString()}</div>
            <div>Status: {partner.status}</div>
            <div className="request-actions">
              <button
                className="approve"
                onClick={() => handleApprove(partner.user_id)}
              >
                Approve
              </button>
              <button
                className="reject"
                onClick={() => handleReject(partner.user_id)}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </section>
    </>
  );
};

export default PartnerRequests;