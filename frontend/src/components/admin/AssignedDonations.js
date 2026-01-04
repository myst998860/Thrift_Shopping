import React, { useState, useEffect } from 'react';
import { donationAPI } from '../../services/api';
// reuse styles or just inline for now

const StatusBadge = ({ status }) => {
    const color = {
        confirmed: "#4caf50",
        pickedup: "#2196f3",
        delivered: "#9c27b0",
        cancelled: "#f44336",
        assigned_to_admin: "#ff9800",
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

const AssignedDonations = () => {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDonations();
    }, []);

    const fetchDonations = async () => {
        try {
            const all = await donationAPI.listDonations();
            // Filter for Assigned Donations
            // We check for status 'assigned_to_admin' OR if it has a pickupFee
            const assigned = all.filter(d =>
                (d.status && d.status.toLowerCase() === 'assigned_to_admin') ||
                (d.pickupFee && d.pickupFee > 0)
            );
            setDonations(assigned);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const markAsPickedUp = async (id) => {
        if (!window.confirm("Mark as Picked Up?")) return;
        try {
            await donationAPI.updateDonationStatus(id, 'pickedup');
            fetchDonations(); // refresh
        } catch (e) {
            alert("Error updating status");
        }
    };

    if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

    return (
        <div style={{ background: '#fff', borderRadius: 12, padding: 32, margin: 20 }}>
            <h1>Assigned Donations (Pickups)</h1>
            <p style={{ marginBottom: 20, color: '#666' }}>Donations assigned to Admin for pickup. Fee: 150 NPR each.</p>

            {donations.length === 0 ? <p>No assigned donations found.</p> : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f9f9f9', textAlign: 'left' }}>
                            <th style={{ padding: 10 }}>ID</th>
                            <th style={{ padding: 10 }}>Donor</th>
                            <th style={{ padding: 10 }}>Address</th>
                            <th style={{ padding: 10 }}>Phone</th>
                            <th style={{ padding: 10 }}>Quantity</th>
                            <th style={{ padding: 10 }}>Fee</th>
                            <th style={{ padding: 10 }}>Status</th>
                            <th style={{ padding: 10 }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {donations.map(d => (
                            <tr key={d.donationId} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: 10 }}>#{d.donationId}</td>
                                <td style={{ padding: 10 }}>{d.fullName}</td>
                                <td style={{ padding: 10 }}>{d.streetAddress}, {d.city}</td>
                                <td style={{ padding: 10 }}>{d.phoneNumber}</td>
                                <td style={{ padding: 10 }}>{d.estimatedQuantity}</td>
                                <td style={{ padding: 10 }}>NPR {d.pickupFee || 150}</td>
                                <td style={{ padding: 10 }}><StatusBadge status={d.status} /></td>
                                <td style={{ padding: 10 }}>
                                    {d.status !== 'pickedup' && d.status !== 'delivered' && (
                                        <button
                                            onClick={() => markAsPickedUp(d.donationId)}
                                            style={{
                                                background: '#2196f3', color: 'white', border: 'none',
                                                padding: '6px 12px', borderRadius: 4, cursor: 'pointer'
                                            }}
                                        >
                                            Mark Picked Up
                                        </button>
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

export default AssignedDonations;
