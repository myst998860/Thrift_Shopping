
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { donationAPI } from "../../services/api";
import { FiArrowLeft, FiSave } from "react-icons/fi";
import "../../styles/admin/FormStyles.css";

const EditDonation = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
        streetAddress: "",
        city: "",
        zipCode: "",
        preferredPickupDate: "",
        pickupInstructions: "",
        estimatedQuantity: "",
        overallCondition: "",
        description: "",
        status: "",
        shirtsAndTops: false,
        dressesAndSkirts: false,
        shoes: false,
        pantsAndJeans: false,
        jacketsAndCoats: false,
        accessories: false,
        childrensClothing: false,
        undergarments: false
    });

    useEffect(() => {
        const fetchDonation = async () => {
            try {
                const data = await donationAPI.getDonation(id);
                setFormData({
                    fullName: data.fullName || "",
                    email: data.email || "",
                    phoneNumber: data.phoneNumber || "",
                    streetAddress: data.streetAddress || "",
                    city: data.city || "",
                    zipCode: data.zipCode || "",
                    preferredPickupDate: data.preferredPickupDate || "",
                    pickupInstructions: data.pickupInstructions || "",
                    estimatedQuantity: data.estimatedQuantity || "",
                    overallCondition: data.overallCondition || "",
                    description: data.description || "",
                    status: data.status || "pending",
                    shirtsAndTops: data.shirtsAndTops || false,
                    dressesAndSkirts: data.dressesAndSkirts || false,
                    shoes: data.shoes || false,
                    pantsAndJeans: data.pantsAndJeans || false,
                    jacketsAndCoats: data.jacketsAndCoats || false,
                    accessories: data.accessories || false,
                    childrensClothing: data.childrensClothing || false,
                    undergarments: data.undergarments || false
                });
            } catch (err) {
                console.error("Error loading donation:", err);
                setError("Failed to load donation details.");
            } finally {
                setLoading(false);
            }
        };
        fetchDonation();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await donationAPI.updateDonation(id, formData);
            alert("Donation updated successfully!");
            navigate('/partner/donations');
        } catch (err) {
            console.error("Update failed:", err);
            alert("Failed to update donation. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="admin-form-container fade-in">
            <div className="form-header">
                <button className="back-button" onClick={() => navigate('/partner/donations')}>
                    <FiArrowLeft /> Cancel
                </button>
                <h1>Edit Donation #{id}</h1>
            </div>

            <form onSubmit={handleSubmit} className="form-content">
                {/* Status Section */}
                <div className="form-section full-width">
                    <h3 className="section-title">Status Management</h3>
                    <div className="form-group">
                        <label>Current Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="form-input"
                        >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="pickedup">Picked Up</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="assigned_to_admin">Assigned to Admin</option>
                        </select>
                    </div>
                </div>

                {/* Logistics */}
                <div className="form-section">
                    <h3 className="section-title">Logistics & Contact</h3>
                    <div className="form-group">
                        <label>Address</label>
                        <input type="text" name="streetAddress" value={formData.streetAddress} onChange={handleChange} className="form-input" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label>City</label>
                            <input type="text" name="city" value={formData.city} onChange={handleChange} className="form-input" required />
                        </div>
                        <div className="form-group">
                            <label>Zip Code</label>
                            <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} className="form-input" />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Pickup Date</label>
                        <input type="date" name="preferredPickupDate" value={formData.preferredPickupDate} onChange={handleChange} className="form-input" />
                    </div>
                    <div className="form-group">
                        <label>Contact Phone</label>
                        <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="form-input" required />
                    </div>
                </div>

                {/* Items */}
                <div className="form-section">
                    <h3 className="section-title">Donation Details</h3>
                    <div className="form-group">
                        <label>Estimated Quantity</label>
                        <select name="estimatedQuantity" value={formData.estimatedQuantity} onChange={handleChange} className="form-input">
                            <option value="">Select Quantity</option>
                            <option value="1-5 Items">1-5 Items</option>
                            <option value="6-15 Items">6-15 Items</option>
                            <option value="16-30 Items">16-30 Items</option>
                            <option value="30+ Items">30+ Items</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Condition</label>
                        <select name="overallCondition" value={formData.overallCondition} onChange={handleChange} className="form-input">
                            <option value="">Select Condition</option>
                            <option value="New">New</option>
                            <option value="Like New">Like New</option>
                            <option value="Good">Good</option>
                            <option value="Fair">Fair</option>
                        </select>
                    </div>

                    <div className="form-group mt-4">
                        <label className="mb-2 block font-medium">Items Included</label>
                        <div className="grid grid-cols-2 gap-2">
                            <label className="flex items-center gap-2"><input type="checkbox" name="shirtsAndTops" checked={formData.shirtsAndTops} onChange={handleChange} /> Shirts & Tops</label>
                            <label className="flex items-center gap-2"><input type="checkbox" name="dressesAndSkirts" checked={formData.dressesAndSkirts} onChange={handleChange} /> Dresses</label>
                            <label className="flex items-center gap-2"><input type="checkbox" name="pantsAndJeans" checked={formData.pantsAndJeans} onChange={handleChange} /> Pants & Jeans</label>
                            <label className="flex items-center gap-2"><input type="checkbox" name="shoes" checked={formData.shoes} onChange={handleChange} /> Shoes</label>
                            <label className="flex items-center gap-2"><input type="checkbox" name="jacketsAndCoats" checked={formData.jacketsAndCoats} onChange={handleChange} /> Jackets</label>
                            <label className="flex items-center gap-2"><input type="checkbox" name="childrensClothing" checked={formData.childrensClothing} onChange={handleChange} /> Children's</label>
                        </div>
                    </div>
                </div>

                <div className="form-actions full-width">
                    <button type="submit" className="btn-submit" disabled={saving}>
                        <FiSave /> {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditDonation;
