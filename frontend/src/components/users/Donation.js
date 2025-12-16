import { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { donationAPI } from "../../services/api"; // adjust path if needed

import { venueService, imageService } from "../../services/api";

export default function Donation() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    zip: "",
    types: {
      tops: false,
      dresses: false,
      shoes: false,
      undergarments: false,
      pants: false,
      jackets: false,
      accessories: false,
      children: false,
    },
    quantity: "6-15 Items",
    condition: "Good",
    description: "",
    pickupDate: "",
    pickupNotes: "",
  });

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const updateType = (key) => setForm((f) => ({ ...f, types: { ...f.types, [key]: !f.types[key] } }));

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    await donationAPI.addDonation(form);
    alert("Donation request submitted successfully. Our NGO partner will contact you within 24 hours.");
    setForm({
      fullName: "",
      email: "",
      phone: "",
      street: "",
      city: "",
      zip: "",
      types: { tops: false, dresses: false, shoes: false, undergarments: false, pants: false, jackets: false, accessories: false, children: false },
      quantity: "6-15 Items",
      condition: "Good",
      description: "",
      pickupDate: "",
      pickupNotes: "",
    });
  } catch (error) {
    console.error("Error submitting donation:", error);
    alert("There was an error submitting your donation. Please try again later.");
  }
};
  return (
    <div>
      <Header />

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

      {/* Steps */}
      <section style={{ padding: "16px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", color: "#0f172a", fontSize: 20, marginBottom: 16 }}>How Donation Works</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {[
              { n: 1, title: "Fill Request Form", desc: "Provide details about your clothing donation and pickup preferences" },
              { n: 2, title: "Schedule Pickup", desc: "Our NGO partners will schedule a convenient pickup time" },
              { n: 3, title: "Make Impact", desc: "Your clothes help support community programs and those in need" },
            ].map((s) => (
              <div key={s.n} style={{ background: "#f8fffa", border: "1px solid #e2f7ea", borderRadius: 12, padding: 16, textAlign: "center" }}>
                <div style={{ width: 32, height: 32, borderRadius: 999, background: "#e6f7eb", color: "#16a34a", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 800, marginBottom: 8 }}>{s.n}</div>
                <div style={{ fontWeight: 700, color: "#0f172a" }}>{s.title}</div>
                <div style={{ color: "#64748b", fontSize: 13, marginTop: 6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section style={{ padding: "16px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <form onSubmit={handleSubmit} style={{ background: "#f8fffa", border: "1px solid #e2f7ea", borderRadius: 12, padding: 16 }}>
            <div style={{ fontWeight: 800, marginBottom: 6, color: "#0f172a" }}>Donation Request Form</div>
            <div style={{ color: "#64748b", fontSize: 13, marginBottom: 12 }}>
              Fill out this form to schedule a clothing pickup. Our NGO partners will contact you within 24 hours.
            </div>

            {/* Personal Information */}
            <div style={{ fontWeight: 700, color: "#0f172a", margin: "8px 0" }}>Personal Information</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input label="Full Name *" value={form.fullName} onChange={(v) => update("fullName", v)} />
              <Input type="email" label="Email *" value={form.email} onChange={(v) => update("email", v)} />
              <Input label="Phone Number *" value={form.phone} onChange={(v) => update("phone", v)} />
            </div>

            {/* Address */}
            <div style={{ fontWeight: 700, color: "#0f172a", margin: "8px 0" }}>Pickup Address</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
              <Input label="Street Address *" value={form.street} onChange={(v) => update("street", v)} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Input label="City *" value={form.city} onChange={(v) => update("city", v)} />
                <Input label="ZIP Code *" value={form.zip} onChange={(v) => update("zip", v)} />
              </div>
            </div>

            {/* Clothing Details */}
            <div style={{ fontWeight: 700, color: "#0f172a", margin: "8px 0" }}>Clothing Details</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <Checkbox label="Shirts & Tops" checked={form.types.tops} onChange={() => updateType("tops")} />
                <Checkbox label="Dresses & Skirts" checked={form.types.dresses} onChange={() => updateType("dresses")} />
                <Checkbox label="Shoes" checked={form.types.shoes} onChange={() => updateType("shoes")} />
                <Checkbox label="Undergarments" checked={form.types.undergarments} onChange={() => updateType("undergarments")} />
              </div>
              <div>
                <Checkbox label="Pants & Jeans" checked={form.types.pants} onChange={() => updateType("pants")} />
                <Checkbox label="Jackets & Coats" checked={form.types.jackets} onChange={() => updateType("jackets")} />
                <Checkbox label="Accessories" checked={form.types.accessories} onChange={() => updateType("accessories")} />
                <Checkbox label="Children's Clothing" checked={form.types.children} onChange={() => updateType("children")} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
              <Select label="Estimated Quantity *" value={form.quantity} onChange={(v) => update("quantity", v)} options={["1-5 Items", "6-15 Items", "16-30 Items", "30+ Items"]} />
              <Select label="Overall Condition *" value={form.condition} onChange={(v) => update("condition", v)} options={["Like New", "Good", "Fair"]} />
            </div>

            <Textarea label="Description (Optional)" placeholder="Any additional details about the clothing..." value={form.description} onChange={(v) => update("description", v)} />

            {/* Pickup Details */}
            <div style={{ fontWeight: 700, color: "#0f172a", margin: "8px 0" }}>Pickup Details</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
              <Input type="date" label="Preferred Pickup Date *" value={form.pickupDate} onChange={(v) => update("pickupDate", v)} />
              <Textarea label="Pickup Instructions (Optional)" placeholder="Any special instructions for pickup (e.g., gate code, best time to call, etc.)" value={form.pickupNotes} onChange={(v) => update("pickupNotes", v)} />
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
              <button type="submit" style={primaryBtnStyle}>Submit Donation Request</button>
            </div>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Input, Textarea, Checkbox, Select, and primaryBtnStyle remain unchanged
function Input({ label, value, onChange, type = "text" }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ color: "#0f172a", fontSize: 13 }}>{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} style={{ border: "1px solid #e2e8f0", background: "#fff", padding: "10px 12px", borderRadius: 8 }} required={label.includes("*")} />
    </label>
  );
}

function Textarea({ label, value, onChange, placeholder }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ color: "#0f172a", fontSize: 13 }}>{label}</span>
      <textarea value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} rows={3} style={{ border: "1px solid #e2e8f0", background: "#fff", padding: "10px 12px", borderRadius: 8, resize: "vertical" }} />
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
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{ border: "1px solid #e2e8f0", background: "#fff", padding: "10px 12px", borderRadius: 8 }}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
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

