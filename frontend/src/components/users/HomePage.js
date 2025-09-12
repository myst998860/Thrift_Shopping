"use client";

import { useState, useEffect } from "react";
import Navbar from "./Header";
import { useCart } from "../../context/CartContext";
import { useUserSession } from "../../context/UserSessionContext";
import Footer from "./Footer";
import { venueService, imageService } from "../../services/api";
import "../../styles/HomePage.css";

const HomePage = () => {
  const { addItem } = useCart();
  const { isUserLoggedIn } = useUserSession();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
const [images, setImages] = useState({});
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    window.clearTimeout(window.__thriftgood_toast_timer);
    window.__thriftgood_toast_timer = window.setTimeout(() => setShowToast(false), 2000);
  };

  useEffect(() => {
   const fetchTopVenues = async () => {
    try {
      setLoading(true);
      const response = await venueService.listVenue();
      const topVenues = Array.isArray(response) ? response.slice(0, 8) : [];
      setVenues(topVenues);
      setError(null);

      // Fetch images for each venue
      const imagePromises = topVenues.map(async (venue) => {
        try {
          const imageBlob = await imageService.getImage(venue.venue_id);
          return { venue_id: venue.venue_id, imageUrl: URL.createObjectURL(imageBlob) };
        } catch {
          return { venue_id: venue.venue_id, imageUrl: null };
        }
      });

      const imagesArray = await Promise.all(imagePromises);
      const imageMap = {};
      imagesArray.forEach(({ venue_id, imageUrl }) => {
        imageMap[venue_id] = imageUrl;
      });

      setImages(imageMap);
    } catch (error) {
      console.error("Error fetching top venues:", error);
      setError("Failed to load venues. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  fetchTopVenues();
}, []);

  if (loading) {
    return (
      <div className="homepage">
        <Navbar />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          fontSize: '18px',
          color: '#666'
        }}>
          Loading..
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="homepage">
        <Navbar />
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          fontSize: '18px',
          color: '#e74c3c',
          textAlign: 'center',
          padding: '20px'
        }}>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#ffc107',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="homepage">
      <Navbar />

      {/* Hero */}
      <section style={{
        background: "linear-gradient(180deg, #f6fbf7 0%, #ffffff 100%)",
        padding: "109px 16px 48px",
        textAlign: "center"
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{
            display: "inline-block",
            background: "#e6f7eb",
            color: "#2f855a",
            padding: "6px 10px",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 18
          }}>Sustainable Fashion · Social Impact</div>
          <h1 style={{
            fontSize: 48,
            lineHeight: 1.1,
            margin: 0,
            fontWeight: 700,
            color: "#0f172a"
          }}>
            Fashion That Makes a <span style={{ color: "#16a34a" }}>Difference</span>
          </h1>
          <p style={{
            color: "#475569",
            marginTop: 14,
            fontSize: 16
          }}>
            Shop unique thrift finds and donate clothes to support NGO programs. Every purchase and donation creates positive social impact.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20, flexWrap: "wrap" }}>
            <button style={{
              backgroundColor: "#16a34a",
              color: "white",
              border: "none",
              padding: "12px 18px",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600
            }}>Shop Now</button>
            <button style={{
              backgroundColor: "#f1f5f9",
              color: "#0f172a",
              border: "1px solid #e2e8f0",
              padding: "12px 18px",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600
            }}>Donate Clothes</button>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section style={{ padding: "32px 16px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", color: "#0f172a", marginBottom: 8 }}>How ThriftGood Works</h2>
          <p style={{ textAlign: "center", color: "#64748b", marginTop: 0 }}>A simple platform connecting sustainable fashion with social impact</p>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
            marginTop: 20
          }}>
            {[{
              title: "Shop Thrift Items",
              desc: "Browse unique, pre-loved clothing at affordable prices"
            }, {
              title: "Donate Clothes",
              desc: "Give your unused clothes a second life through NGO programs"
            }, {
              title: "Support Communities",
              desc: "Every transaction supports NGO programs and social initiatives"
            }].map((card, idx) => (
              <div key={idx} style={{
                background: "#f8fffa",
                border: "1px solid #e2f7ea",
                borderRadius: 12,
                padding: 18
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 999,
                  background: "#e6f7eb",
                  marginBottom: 12
                }} />
                <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>{card.title}</div>
                <div style={{ color: "#64748b", fontSize: 14 }}>{card.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Items */}
      <section style={{ padding: "24px 16px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ color: "#0f172a", margin: 0 }}>Featured Items</h2>
            <button style={{
              background: "#f1f5f9",
              border: "1px solid #e2e8f0",
              padding: "8px 12px",
              borderRadius: 8,
              cursor: "pointer"
            }}>View All</button>
          </div>
          <p style={{ color: "#64748b", marginTop: 6 }}>Discover unique finds from our thrift collection</p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: 16,
            marginTop: 12
          }}>
            {venues.slice(0, 4).map((venue) => {
              const imageUrl = images[venue.venue_id];
              return (
                <div key={venue.venue_id} style={{
                  background: "#f8fffa",
                  border: "1px solid #e2f7ea",
                  borderRadius: 12,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column"
                }}>
                  <div style={{ background: "#eef2f7", height: 180 }}>
                    {imageUrl ? (
                      <img src={imageUrl} alt={venue.name || "Featured item"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : null}
                  </div>
                  <div style={{ padding: 12, background: "#f0fff4" }}>
                    <div style={{ fontWeight: 700, color: "#0f172a" }}>{venue.name || venue.title || "Item"}</div>
                    <div style={{ color: "#64748b", fontSize: 13 }}>{venue.subtitle || venue.location || "Good condition"}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                      <div style={{ fontWeight: 700, color: "#0f172a" }}>{venue.price ? `NPR${venue.price}` : "NPR--"}</div>
                      <button onClick={() => {
                        if (!isUserLoggedIn) {
                          triggerToast("Please sign in to add items to your cart");
                          setTimeout(() => (window.location.href = "/login"), 500);
                          return;
                        }
                        addItem({ id: venue.venue_id, title: venue.name || venue.title || "Item", price: Number(venue.price || 0), imageUrl: images[venue.venue_id], meta: venue.location || venue.subtitle });
                        triggerToast(`${venue.name || venue.title || "Item"} added to cart`);
                      }} style={{
                        background: "#16a34a",
                        color: "white",
                        border: "none",
                        padding: "8px 10px",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontWeight: 600
                      }}>Add to Cart</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Active Programs */}
      <section style={{ padding: "24px 16px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ color: "#0f172a", marginTop: 0 }}>Active Programs</h2>
          <p style={{ color: "#64748b", marginTop: 6 }}>See how your donations are making a difference in communities</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            <div style={{ background: "#f8fffa", border: "1px solid #e2f7ea", borderRadius: 12, padding: 16 }}>
              <div style={{ display: "inline-block", background: "#e6f7eb", color: "#2f855a", padding: "4px 8px", borderRadius: 999, fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Ongoing</div>
              <div style={{ fontWeight: 700, color: "#0f172a" }}>Winter Clothing Drive</div>
              <div style={{ color: "#64748b", fontSize: 14, marginTop: 6 }}>Providing warm clothes to homeless shelters across the city</div>
              <div style={{ marginTop: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b" }}>
                  <span>Progress: 75% complete</span>
                  <span>Goal: 500 items</span>
                </div>
                <div style={{ height: 8, background: "#e6f7eb", borderRadius: 999, marginTop: 6 }}>
                  <div style={{ width: "75%", height: "100%", background: "#16a34a", borderRadius: 999 }} />
                </div>
              </div>
            </div>
            <div style={{ background: "#f8fffa", border: "1px solid #e2f7ea", borderRadius: 12, padding: 16 }}>
              <div style={{ display: "inline-block", background: "#e6f7eb", color: "#2f855a", padding: "4px 8px", borderRadius: 999, fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Starting Soon</div>
              <div style={{ fontWeight: 700, color: "#0f172a" }}>School Uniform Program</div>
              <div style={{ color: "#64748b", fontSize: 14, marginTop: 6 }}>Supporting students with quality school uniforms and supplies</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b", marginTop: 12 }}>
                <span>Starts: March 15, 2024</span>
                <span>Target: 200 students</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={{ background: "#0b5e2b", color: "white", padding: "28px 16px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, textAlign: "center" }}>
          {[{ label: "Items Donated", value: "12,450" }, { label: "People Helped", value: "8,230" }, { label: "NGO Partners", value: "45" }, { label: "Programs Completed", value: "156" }].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{s.value}</div>
              <div style={{ opacity: 0.9 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <Footer />

      {showToast && (
        <div style={{ position: "fixed", right: 16, bottom: 16, background: "#16a34a", color: "white", padding: "10px 14px", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.18)", zIndex: 1000 }}>
          {toastMessage || "Added to cart"}
        </div>
      )}
    </div>
  );
};

export default HomePage;