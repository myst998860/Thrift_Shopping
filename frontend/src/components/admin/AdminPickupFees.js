import React, { useState, useEffect } from "react";
import { donationAPI } from "../../services/api";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css"; // Reusing dashboard styles for consistency, or we can create a new one

const AdminPickupFees = () => {
    const [feeSummary, setFeeSummary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchFeeSummary();
    }, []);

    const fetchFeeSummary = async () => {
        try {
            setLoading(true);
            const summary = await donationAPI.getAdminFeeSummary();
            setFeeSummary(summary);
        } catch (err) {
            console.error("Failed to fetch fee summary:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestPayment = async (partnerId) => {
        try {
            setActionLoading(true);
            await donationAPI.requestPayment(partnerId);
            alert("Payment request sent to partner!");
            fetchFeeSummary();
        } catch (err) {
            alert("Failed to request payment: " + err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleSettlePayment = async (partnerId, action) => {
        try {
            setActionLoading(true);
            await donationAPI.settlePayment(partnerId, action);
            alert(`Payment ${action === 'accept' ? 'accepted' : 'rejected'} successfully!`);
            fetchFeeSummary();
        } catch (err) {
            alert("Failed to settle payment: " + err.message);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading fees...</div>;

    return (
        <div className="dashboard-container" style={{ padding: "32px" }}>
            <div className="dashboard-header" style={{ marginBottom: "32px" }}>
                <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#1e293b", marginBottom: "8px" }}>Pickup Fees Management</h1>
                <p style={{ color: "#64748b" }}>Monitor and manage pickup fee payments from NGO partners.</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-800">Partner Fee Status</h2>
                </div>

                <div className="fee-table-wrapper" style={{ padding: "0" }}>
                    <table className="fee-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead style={{ background: "#f8fafc" }}>
                            <tr>
                                <th style={{ padding: "16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", marginBottom: "0" }}>Partner</th>
                                <th style={{ padding: "16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>Unpaid Fees</th>
                                <th style={{ padding: "16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>Requested</th>
                                <th style={{ padding: "16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>Paid (Pending)</th>
                                <th style={{ padding: "16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>Total Due</th>
                                <th style={{ padding: "16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#64748b", textTransform: "uppercase" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {feeSummary.map(fee => (
                                <tr key={fee.partnerId} style={{ borderBottom: "1px solid #e2e8f0" }}>
                                    <td style={{ padding: "16px", color: "#334155", fontWeight: "500" }}>{fee.partnerName}</td>
                                    <td style={{ padding: "16px", color: "#64748b" }}>NPR {fee.unpaidAmount.toLocaleString()}</td>
                                    <td style={{ padding: "16px", color: "#64748b" }}>NPR {fee.requestedAmount.toLocaleString()}</td>
                                    <td style={{ padding: "16px", fontWeight: fee.paidAmount > 0 ? "700" : "400", color: fee.paidAmount > 0 ? "#16a34a" : "#64748b" }}>
                                        NPR {fee.paidAmount.toLocaleString()}
                                    </td>
                                    <td style={{ padding: "16px", color: "#0f172a", fontWeight: "600" }}>NPR {fee.totalDue.toLocaleString()}</td>
                                    <td style={{ padding: "16px" }}>
                                        <div className="flex gap-2">
                                            {fee.unpaidAmount > 0 && (
                                                <button
                                                    className="btn-request"
                                                    onClick={() => handleRequestPayment(fee.partnerId)}
                                                    disabled={actionLoading}
                                                    style={{
                                                        background: "#3b82f6", color: "white", padding: "6px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: "600", border: 'none', cursor: 'pointer', marginRight: '8px'
                                                    }}
                                                >
                                                    Request Pay
                                                </button>
                                            )}
                                            {fee.paidAmount > 0 && (
                                                <>
                                                    <button
                                                        className="btn-accept"
                                                        onClick={() => handleSettlePayment(fee.partnerId, 'accept')}
                                                        disabled={actionLoading}
                                                        style={{
                                                            background: "#16a34a", color: "white", padding: "6px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: "600", border: 'none', cursor: 'pointer', marginRight: '8px'
                                                        }}
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        className="btn-reject"
                                                        onClick={() => handleSettlePayment(fee.partnerId, 'reject')}
                                                        disabled={actionLoading}
                                                        style={{
                                                            background: "#ef4444", color: "white", padding: "6px 12px", borderRadius: "6px", fontSize: "13px", fontWeight: "600", border: 'none', cursor: 'pointer'
                                                        }}
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            {fee.unpaidAmount === 0 && fee.paidAmount === 0 && (
                                                <span className="text-slate-400 text-sm italic">Settled</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {feeSummary.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>No partner fees found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPickupFees;
