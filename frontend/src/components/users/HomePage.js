"use client";

import { useState, useEffect } from "react";
import Navbar from "./Header";
import { useCart } from "../../context/CartContext";
import { useUserSession } from "../../context/UserSessionContext";
import Footer from "./Footer";
import { venueService, imageService, programService } from "../../services/api";


import "../../styles/HomePage.css";

const HomePage = () => {
  const { addItem } = useCart();
  const { isUserLoggedIn } = useUserSession();
  const [venues, setVenues] = useState([]);
  const [programs, setPrograms] = useState([]);
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
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch venues
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

        // Fetch programs
        try {
          const programsData = await programService.listPrograms();
          const safePrograms = Array.isArray(programsData) 
            ? programsData.map((p) => ({
                programId: p.programId,
                programTitle: p.programTitle || "Untitled Program",
                name: p.name || "ThriftGood",
                description: p.description || "No description available",
                category: p.category || "Other",
                programImage: p.programImage || "/default-image.png",
                programLocation: p.programLocation || "Kathmandu",
                targetItemsToCollect: p.targetItemsToCollect || 1,
                estimatedBeneficiaries: p.estimatedBeneficiaries || 0,
                createdAt: p.createdAt,
              }))
            : [];
          // Sort by most recently added (by programId descending, or createdAt if available)
          const sortedPrograms = safePrograms.sort((a, b) => {
            if (a.createdAt && b.createdAt) {
              return new Date(b.createdAt) - new Date(a.createdAt);
            }
            // Fallback to sorting by programId (higher ID = more recent)
            return (b.programId || 0) - (a.programId || 0);
          });
          setPrograms(sortedPrograms.slice(0, 4)); // Show 4 most recently added programs
        } catch (programError) {
          console.error("Error fetching programs:", programError);
          // Don't set error state for programs, just log it
        }
      } catch (error) {
        console.error("Error fetching top venues:", error);
        setError("Failed to load venues. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
      <section className="hero">
        <div className="hero-content">
          <div className="hero-eyebrow">Curated Vintage · Every Purchase Helps</div>
          <h1 className="hero-title">
            Timeless <span className="accent-blue">Treasures</span><br/>for the <span className="accent-orange">Conscious</span>
          </h1>
          <p className="hero-subtitle">
            Discover curated vintage finds. Every piece tells a story. Every purchase makes a difference.
          </p>
          <div className="cta-group">
            <button className="btn btn-primary" onClick={() => (window.location.href = "/shop")}>Explore Now</button>
            <button className="btn btn-secondary" onClick={() => (window.location.href = "/donate")}>Donate Items</button>
          </div>
        </div>
      </section>

      {/* Latest Finds */}
      <section className="latest">
        <div className="latest-inner">
          <div className="section-head">
            <h2>Recent Added </h2>
          </div>
          <div className="card-grid">
            {venues.slice(0, 3).map((venue) => {
              const imageUrl = images[venue.venue_id];
              return (
                <div key={venue.venue_id} className="card">
                  <div className="card-media">
                    {imageUrl ? (
                      <img src={imageUrl} alt={venue.name || "Item"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : null}
                  </div>
                  <div className="card-body">
                    <div className="card-title">{venue.venueName || venue.title || "Item"}</div>
                    <div className="card-sub">{venue.subtitle || venue.description || "Good condition"}</div>
                    <div className="price-row">
                      <div className="price">{venue.price ? `NPR ${venue.price}` : "NPR --"}</div>
                      <button className="btn btn-secondary btn-small" onClick={() => (window.location.href = `/venues/${venue.venue_id}`)}>View</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="latest">
        <div className="latest-inner">
          <div className="section-head">
            <h2>Active Programs</h2>
          </div>
          {programs.length > 0 ? (
            <div className="card-grid">
              {programs.map((program) => (
                <div key={program.programId} className="card">
                  <div className="card-media">
                    {program.programImage && (
                      <img 
                        src={program.programImage} 
                        alt={program.programTitle} 
                        style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                      />
                    )}
                  </div>
                  <div className="card-body">
                    <div className="card-title">{program.programTitle}</div>
                    <div className="card-sub">{program.description.length > 80 ? program.description.substring(0, 80) + "..." : program.description}</div>
                    <div style={{ marginTop: "8px", fontSize: "12px", color: "#64748b" }}>
                      📍 {program.programLocation}
                    </div>
                    <div style={{ marginTop: "8px", fontSize: "12px", color: "#64748b" }}>
                      {program.name}
                    </div>
                    <div className="price-row" style={{ marginTop: "10px" }}>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>
                        Category: {program.category}
                      </div>
                      <button 
                        className="btn btn-secondary btn-small" 
                        onClick={() => (window.location.href = `/programs/${program.programId}`)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
              No programs available at the moment.
            </div>
          )}
        </div>
      </section>

      {/* Impact Section */}
      <section className="impact">
        <div className="impact-inner">
          {[{ label: "Items Donated", value: "12K+" }, { label: "People Helped", value: "8K+" }, { label: "Active Programs", value: "15" }, { label: "NGO Partners", value: "45" }].map((s, i) => (
            <div key={i}>
              <div className="impact-value">{s.value}</div>
              <div className="impact-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="cta-inner">
          <h2 className="cta-title">Ready to Shop with Purpose?</h2>
          <p className="cta-sub">Join our community and discover the beauty of sustainable fashion.</p>
          <button className="btn btn-primary" onClick={() => (window.location.href = "/shop")}>Start Shopping</button>
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