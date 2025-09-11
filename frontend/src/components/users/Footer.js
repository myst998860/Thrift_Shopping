"use client"

import { motion } from "framer-motion"
import "../../styles/Footer.css"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{ background: "#ffffff", borderTop: "1px solid #e2e8f0" }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 16px" }}>
        {/* Top Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 24,
          alignItems: "start"
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 999, background: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800 }}>♡</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>ThriftGood</div>
            </div>
            <p style={{ color: "#475569", marginTop: 12 }}>
              Connecting sustainable fashion with social impact. Every purchase and donation makes a difference.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>Quick Links</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "#475569" }}>
              <li style={{ marginBottom: 8 }}><a href="#shop" style={{ color: "inherit", textDecoration: "none" }}>Shop</a></li>
              <li style={{ marginBottom: 8 }}><a href="#donate" style={{ color: "inherit", textDecoration: "none" }}>Donate Clothes</a></li>
              <li style={{ marginBottom: 8 }}><a href="#programs" style={{ color: "inherit", textDecoration: "none" }}>Programs</a></li>
              <li><a href="#about" style={{ color: "inherit", textDecoration: "none" }}>About Us</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>Support</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "#475569" }}>
              <li style={{ marginBottom: 8 }}><a href="#help" style={{ color: "inherit", textDecoration: "none" }}>Help Center</a></li>
              <li style={{ marginBottom: 8 }}><a href="#shipping" style={{ color: "inherit", textDecoration: "none" }}>Shipping Info</a></li>
              <li style={{ marginBottom: 8 }}><a href="#returns" style={{ color: "inherit", textDecoration: "none" }}>Returns</a></li>
              <li><a href="#contact" style={{ color: "inherit", textDecoration: "none" }}>Contact Us</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>Contact</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#475569", marginBottom: 10 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>
              <span>hello@thriftgood.com</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#475569", marginBottom: 10 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.4 21 3 13.6 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.24.19 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
              <span>+1 (555) 123-4567</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#475569" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>
              <span>123 Sustainable St, Green City</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: "1px solid #e2e8f0", marginTop: 28, paddingTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ color: "#475569" }}>© {currentYear} ThriftGood. All rights reserved.</div>
          <div style={{ display: "flex", gap: 16 }}>
            <a href="#privacy" style={{ color: "#475569", textDecoration: "none" }}>Privacy Policy</a>
            <a href="#terms" style={{ color: "#475569", textDecoration: "none" }}>Terms of Service</a>
          </div>
        </div>
      </div>
    </motion.footer>
  )
}

export default Footer
