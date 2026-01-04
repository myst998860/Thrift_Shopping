import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { donationAPI } from "../../services/api";

// ------------------- Helper Components -------------------
function Input({ label, value, onChange, type = "text" }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ color: "#0f172a", fontSize: 13 }}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ border: "1px solid #e2e8f0", background: "#fff", padding: "10px 12px", borderRadius: 8 }}
        required={label.includes("*")}
      />
    </label>
  );
}

function Textarea({ label, value, onChange, placeholder }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ color: "#0f172a", fontSize: 13 }}>{label}</span>
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        style={{ border: "1px solid #e2e8f0", background: "#fff", padding: "10px 12px", borderRadius: 8, resize: "vertical" }}
      />
    </label>
  );
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", color: "#0f172a" }}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ color: "#0f172a", fontSize: 13 }}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ border: "1px solid #e2e8f0", background: "#fff", padding: "10px 12px", borderRadius: 8 }}
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

const primaryBtnStyle = {
  background: "#16a34a",
  color: "#fff",
  border: 0,
  padding: "10px 16px",
  borderRadius: 8,
  fontWeight: 700,
  cursor: "pointer",
};

// ------------------- Main Donation Component -------------------
export default function Donation() {
  const location = useLocation();
  const navigate = useNavigate();

  // If redirected from a program, the programId will be in location.state
  const programId = location.state?.programId || null;

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    streetAddress: "",
    city: "",
    zipCode: "",
    types: {
      shirtsAndTops: false,
      dressesAndSkirts: false,
      shoes: false,
      undergarments: false,
      pantsAndJeans: false,
      jacketsAndCoats: false,
      accessories: false,
      childrensClothing: false,
    },
    estimatedQuantity: "6-15 Items",
    overallCondition: "Good",
    description: "",
    preferredPickupDate: "",
    pickupInstructions: "",
    programId: programId, // optional
  });

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const updateType = (key) => setForm((f) => ({ ...f, types: { ...f.types, [key]: !f.types[key] } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const payload = {
            ...form,
            ...form.types, // Flatten nested types object
        };
        delete payload.types; // Remove the nested object

      await donationAPI.addDonation(payload);
      alert("Donation request submitted successfully. Our NGO partner will contact you within 24 hours.");
      setForm({
        fullName: "",
        email: "",
        phoneNumber: "",
        streetAddress: "",
        city: "",
        zipCode: "",
        types: {
          shirtsAndTops: false,
          dressesAndSkirts: false,
          shoes: false,
          undergarments: false,
          pantsAndJeans: false,
          jacketsAndCoats: false,
          accessories: false,
          childrensClothing: false,
        },
        estimatedQuantity: "6-15 Items",
        overallCondition: "Good",
        description: "",
        preferredPickupDate: "",
        pickupInstructions: "",
        programId: null,
      });
      navigate("/"); // Redirect to home or thank you page
    } catch (error) {
      console.error("Error submitting donation:", error);
      alert("There was an error submitting your donation. Please try again later.");
    }
  };

  return (
    <div style={{ paddingTop: "96px" }}>
        {/* Hero */}
        <section style={{ background: "linear-gradient(180deg, #f6fbf7 0%, #ffffff 100%)", padding: "72px 16px 32px", textAlign: "center" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={{ width: 48, height: 48, borderRadius: 999, background: "#e6f7eb", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#16a34a", fontSize: 24, marginBottom: 12 }}>♡</div>
            <h1 style={{ fontSize: 32, margin: 0, color: "#0f172a" }}>Donate Your Clothes</h1>
            <p style={{ color: "#64748b", marginTop: 8 }}>
              Give your unused clothes a second life and support communities in need through our NGO partners
            </p>
          </div>
        </section>

        {/* Donation Form */}
        <section style={{ padding: "16px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <form onSubmit={handleSubmit} style={{ background: "#f8fffa", border: "1px solid #e2f7ea", borderRadius: 12, padding: 16 }}>
              <h2 style={{ fontWeight: 800, marginBottom: 12, color: "#0f172a" }}>Donation Request Form</h2>

              {/* Personal Info */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Input label="Full Name *" value={form.fullName} onChange={(v) => update("fullName", v)} />
                <Input type="email" label="Email *" value={form.email} onChange={(v) => update("email", v)} />
                <Input label="Phone Number *" value={form.phoneNumber} onChange={(v) => update("phoneNumber", v)} />
              </div>

              {/* Address */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
                <Input label="Street Address *" value={form.streetAddress} onChange={(v) => update("streetAddress", v)} />
                <Input label="City *" value={form.city} onChange={(v) => update("city", v)} />
                <Input label="ZIP Code *" value={form.zipCode} onChange={(v) => update("zipCode", v)} />
              </div>

              {/* Clothing Types */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
                <div>
                  <Checkbox label="Shirts & Tops" checked={form.types.shirtsAndTops} onChange={() => updateType("shirtsAndTops")} />
                  <Checkbox label="Dresses & Skirts" checked={form.types.dressesAndSkirts} onChange={() => updateType("dressesAndSkirts")} />
                  <Checkbox label="Shoes" checked={form.types.shoes} onChange={() => updateType("shoes")} />
                  <Checkbox label="Undergarments" checked={form.types.undergarments} onChange={() => updateType("undergarments")} />
                </div>
                <div>
                  <Checkbox label="Pants & Jeans" checked={form.types.pantsAndJeans} onChange={() => updateType("pantsAndJeans")} />
                  <Checkbox label="Jackets & Coats" checked={form.types.jacketsAndCoats} onChange={() => updateType("jacketsAndCoats")} />
                  <Checkbox label="Accessories" checked={form.types.accessories} onChange={() => updateType("accessories")} />
                  <Checkbox label="Children's Clothing" checked={form.types.childrensClothing} onChange={() => updateType("childrensClothing")} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
                <Select label="Estimated Quantity *" value={form.estimatedQuantity} onChange={(v) => update("estimatedQuantity", v)} options={["1-5 Items", "6-15 Items", "16-30 Items", "30+ Items"]} />
                <Select label="Overall Condition *" value={form.overallCondition} onChange={(v) => update("overallCondition", v)} options={["Like New", "Good", "Fair"]} />
              </div>

              <Textarea label="Description (Optional)" placeholder="Any additional details about the clothing..." value={form.description} onChange={(v) => update("description", v)} />

              {/* Pickup Details */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
                <Input type="date" label="Preferred Pickup Date *" value={form.preferredPickupDate} onChange={(v) => update("preferredPickupDate", v)} />
                <Textarea label="Pickup Instructions (Optional)" placeholder="Any special instructions..." value={form.pickupInstructions} onChange={(v) => update("pickupInstructions", v)} />
              </div>

            <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
              <button type="submit" style={primaryBtnStyle}>Submit Donation Request</button>
            </div>
          </form>
        </div>
      </section>

    
    </div>
  );
}
