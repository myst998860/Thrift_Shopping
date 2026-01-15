
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { donationAPI } from "../../services/api";
import { FiArrowLeft, FiCalendar, FiMapPin, FiPackage, FiUser, FiMail, FiPhone, FiEdit2 } from "react-icons/fi";
import "../../styles/admin/FormStyles.css"; // Reuse valid form styles

const ViewDonation = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [donation, setDonation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDonation = async () => {
            try {
                const data = await donationAPI.getDonation(id);
                setDonation(data);
            } catch (err) {
                console.error("Error fetching donation:", err);
                setError("Failed to load donation details.");
            } finally {
                setLoading(false);
            }
        };
        fetchDonation();
    }, [id]);

    if (loading) return <div className="p-8 text-center text-slate-500">Loading details...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!donation) return <div className="p-8 text-center text-slate-500">Donation not found.</div>;

    const StatusBadge = ({ status }) => {
        const statusClean = status?.toLowerCase().replace(/_/g, '-') || 'pending';
        let bg = 'bg-slate-100 text-slate-700';
        if (statusClean === 'confirmed') bg = 'bg-green-100 text-green-700';
        if (statusClean === 'pickedup') bg = 'bg-blue-100 text-blue-700';
        if (statusClean === 'delivered') bg = 'bg-purple-100 text-purple-700';
        if (statusClean === 'cancelled') bg = 'bg-red-100 text-red-700';

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${bg}`}>
                {status?.replace(/_/g, ' ') || 'Pending'}
            </span>
        );
    };

    return (
        <div className="admin-form-container fade-in">
            <div className="form-header">
                <button
                    className="back-button"
                    onClick={() => navigate('/partner/donations')}
                >
                    <FiArrowLeft /> Back
                </button>
                <div className="flex justify-between items-center w-full mt-4">
                    <div>
                        <h1>Donation #{donation.donationId}</h1>
                        <p className="subtitle">View complete donation details</p>
                    </div>
                    <button
                        className="btn-primary flex items-center gap-2"
                        onClick={() => navigate(`/partner/donations/edit/${donation.donationId}`)}
                    >
                        <FiEdit2 /> Edit
                    </button>
                </div>
            </div>

            <div className="form-content grid col-2">
                {/* Donor Info */}
                <div className="form-section">
                    <h3 className="section-title"><FiUser className="inline mr-2" /> Donor Information</h3>
                    <div className="detail-row">
                        <label>Full Name</label>
                        <p>{donation.fullName}</p>
                    </div>
                    <div className="detail-row">
                        <label>Email</label>
                        <p className="flex items-center gap-2"><FiMail className="text-slate-400" /> {donation.email}</p>
                    </div>
                    <div className="detail-row">
                        <label>Phone</label>
                        <p className="flex items-center gap-2"><FiPhone className="text-slate-400" /> {donation.phoneNumber}</p>
                    </div>
                </div>

                {/* Logistics */}
                <div className="form-section">
                    <h3 className="section-title"><FiMapPin className="inline mr-2" /> Logistics</h3>
                    <div className="detail-row">
                        <label>Status</label>
                        <div className="mt-1"><StatusBadge status={donation.status} /></div>
                    </div>
                    <div className="detail-row">
                        <label>Address</label>
                        <p>{donation.streetAddress}, {donation.city} {donation.zipCode}</p>
                    </div>
                    <div className="detail-row">
                        <label>Preferred Date</label>
                        <p className="flex items-center gap-2"><FiCalendar className="text-slate-400" /> {donation.preferredPickupDate}</p>
                    </div>
                </div>

                {/* Items */}
                <div className="form-section full-width">
                    <h3 className="section-title"><FiPackage className="inline mr-2" /> Donation Contents</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="detail-row">
                            <label>Estimated Quantity</label>
                            <p>{donation.estimatedQuantity}</p>
                        </div>
                        <div className="detail-row">
                            <label>Condition</label>
                            <p>{donation.overallCondition}</p>
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-slate-500 mb-2">Items Included</label>
                        <div className="flex flex-wrap gap-2">
                            {[
                                donation.shirtsAndTops && "Shirts & Tops",
                                donation.dressesAndSkirts && "Dresses & Skirts",
                                donation.shoes && "Shoes",
                                donation.pantsAndJeans && "Pants & Jeans",
                                donation.jacketsAndCoats && "Jackets & Coats",
                                donation.accessories && "Accessories",
                                donation.childrensClothing && "Children's Clothing",
                                donation.undergarments && "Undergarments",
                            ].filter(Boolean).map((item, i) => (
                                <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-sm border border-slate-200">
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>

                    {donation.description && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <label className="block text-sm font-medium text-slate-500 mb-1">Description / Notes</label>
                            <p className="text-slate-700 italic">"{donation.description}"</p>
                        </div>
                    )}

                    {donation.pickupInstructions && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <label className="block text-sm font-medium text-slate-500 mb-1">Pickup Instructions</label>
                            <p className="text-slate-700">"{donation.pickupInstructions}"</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ViewDonation;
