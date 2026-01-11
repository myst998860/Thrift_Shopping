import React, { useState, useEffect } from 'react';
import { donationAPI } from '../../services/api';
import {
    FiTruck,
    FiMapPin,
    FiPhone,
    FiUser,
    FiPackage,
    FiSearch,
    FiFilter,
    FiMoreHorizontal,
    FiArrowRight,
    FiCheckCircle,
    FiCreditCard
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import '../../styles/admin/AssignedDonations.css';

const statusOptions = ["assigned_to_admin", "pickedup", "delivered", "cancelled"];

const premiumStatusStyles = {
    assigned_to_admin: { bg: '#FFF9E5', text: '#B7791F', dot: '#F6AD55', label: 'Assigned' },
    pickedup: { bg: '#EBF8FF', text: '#2B6CB0', dot: '#4299E1', label: 'Picked Up' },
    delivered: { bg: '#F0F5FF', text: '#1E3A8A', dot: '#3B82F6', label: 'Delivered' }, // Success Blue
    cancelled: { bg: '#FFF5F5', text: '#C53030', dot: '#F56565', label: 'Cancelled' },
    Default: { bg: '#F7FAFC', text: '#4A5568', dot: '#CBD5E0', label: 'Pending' }
};

const AssignedDonations = () => {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("all");

    useEffect(() => {
        fetchDonations();
    }, []);

    const fetchDonations = async () => {
        setLoading(true);
        try {
            const all = await donationAPI.listDonations();
            const assigned = all.filter(d =>
                (d.status && d.status.toLowerCase() === 'assigned_to_admin') ||
                (d.pickupFee && d.pickupFee > 0)
            );

            assigned.sort((a, b) => (b.donationId || 0) - (a.donationId || 0));
            setDonations(assigned);
        } catch (e) {
            console.error(e);
            toast.error("Critical: Sync with donation ledger failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await donationAPI.updateDonationStatus(id, newStatus);
            setDonations(prev => prev.map(d => d.donationId === id ? { ...d, status: newStatus } : d));
            toast.info(`Donation #${id} ritual status: ${newStatus.replace(/_/g, ' ')}`);
        } catch (e) {
            toast.error("System override failed. Status locked.");
        }
    };

    const getFilteredDonations = () => {
        let filtered = donations;

        if (activeTab === "pending") {
            filtered = filtered.filter(d => d.status === "assigned_to_admin");
        } else if (activeTab === "pickedup") {
            filtered = filtered.filter(d => d.status === "pickedup");
        }

        if (searchTerm) {
            const s = searchTerm.toLowerCase();
            filtered = filtered.filter(d =>
                d.donationId?.toString().includes(s) ||
                d.fullName?.toLowerCase().includes(s) ||
                d.phoneNumber?.includes(s) ||
                d.city?.toLowerCase().includes(s)
            );
        }

        return filtered;
    };

    const filteredList = getFilteredDonations();
    const getStatusStyle = (status) => premiumStatusStyles[status?.toLowerCase()] || premiumStatusStyles.Default;

    if (loading && donations.length === 0) {
        return (
            <div className="donation-modern-loader">
                <div className="premium-spinner"></div>
                <p>Establishing secure connection to logistics node...</p>
            </div>
        );
    }

    return (
        <div className="donations-modern-container">
            <header className="donations-header-premium">
                <div className="header-left">
                    <h1>Logistics Protocol</h1>
                    <p>Oversee assigned donation pickups and transit verification</p>
                </div>
                <div className="header-right">
                    <button className="refresh-btn-modern" onClick={fetchDonations}>
                        <FiMoreHorizontal /> Synchronize
                    </button>
                </div>
            </header>

            <section className="donations-stats-grid">
                <div className="stat-card-modern">
                    <div className="stat-icon-wrapper blue"><FiTruck /></div>
                    <div className="stat-content">
                        <label>Assigned Pickups</label>
                        <h3>{donations.length}</h3>
                    </div>
                </div>
                <div className="stat-card-modern">
                    <div className="stat-icon-wrapper amber"><FiPackage /></div>
                    <div className="stat-content">
                        <label>Pending Action</label>
                        <h3>{donations.filter(d => d.status === 'assigned_to_admin').length}</h3>
                    </div>
                </div>
                <div className="stat-card-modern">
                    <div className="stat-icon-wrapper purple"><FiCreditCard /></div>
                    <div className="stat-content">
                        <label>Estimated Fees</label>
                        <h3>NPR {(donations.length * 150).toLocaleString()}</h3>
                    </div>
                </div>
            </section>

            <div className="donations-table-actions">
                <div className="tab-switcher-modern">
                    <button className={activeTab === "all" ? "active" : ""} onClick={() => setActiveTab("all")}>All Records</button>
                    <button className={activeTab === "pending" ? "active" : ""} onClick={() => setActiveTab("pending")}>To Pickup</button>
                    <button className={activeTab === "pickedup" ? "active" : ""} onClick={() => setActiveTab("pickedup")}>In Transit</button>
                </div>

                <div className="table-controls-modern">
                    <div className="search-bar-modern">
                        <FiSearch />
                        <input
                            placeholder="Search by ID, Donor, or Phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="premium-table-wrapper">
                <table className="donations-modern-table">
                    <thead>
                        <tr>
                            <th>Manifest ID</th>
                            <th>Donor Profile</th>
                            <th>Coordinates</th>
                            <th>Volume</th>
                            <th>Logistics Fee</th>
                            <th>Operational Status</th>
                            <th>Protocol Override</th>
                            <th width="80">Audit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredList.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="empty-table-state">
                                    <FiPackage size={48} />
                                    <p>No active manifests found in current parameters.</p>
                                </td>
                            </tr>
                        ) : (
                            filteredList.map(d => {
                                const style = getStatusStyle(d.status);
                                return (
                                    <tr key={d.donationId} className="main-row">
                                        <td className="id-cell">
                                            <span className="manifest-id-chip">#{d.donationId}</span>
                                        </td>
                                        <td className="donor-cell">
                                            <div className="donor-info-modern">
                                                <div className="donor-avatar-mini">{d.fullName?.[0]}</div>
                                                <div className="donor-text">
                                                    <span className="name">{d.fullName}</span>
                                                    <span className="phone"><FiPhone size={12} /> {d.phoneNumber}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="coord-cell">
                                            <div className="coord-info">
                                                <FiMapPin className="icon" />
                                                <span className="addr">{d.streetAddress}, {d.city}</span>
                                            </div>
                                        </td>
                                        <td className="volume-cell">
                                            <span className="val">{d.estimatedQuantity}</span>
                                            <span className="unit">items</span>
                                        </td>
                                        <td className="fee-cell">
                                            <span className="currency">NPR</span>
                                            <span className="value">{(d.pickupFee || 150).toLocaleString()}</span>
                                        </td>
                                        <td className="status-cell">
                                            <div className="status-badge-modern" style={{ backgroundColor: style.bg, color: style.text }}>
                                                <span className="status-dot" style={{ backgroundColor: style.dot }}></span>
                                                {style.label}
                                            </div>
                                        </td>
                                        <td className="override-cell">
                                            <select
                                                className="modern-protocol-select"
                                                value={d.status?.toLowerCase() || 'pending'}
                                                onChange={(e) => handleStatusUpdate(d.donationId, e.target.value)}
                                                disabled={d.status === 'cancelled' || d.status === 'delivered'}
                                            >
                                                {statusOptions.map(opt => (
                                                    <option key={opt} value={opt}>
                                                        {opt.replace(/_/g, ' ').toUpperCase()}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="actions-cell">
                                            <button className="audit-btn-circle" title="View Full Report">
                                                <FiArrowRight />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AssignedDonations;
