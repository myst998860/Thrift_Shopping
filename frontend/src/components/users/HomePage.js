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
  const [categories, setCategories] = useState([]);

  // Carousel states - track current index for each section
  const [curatedIndex, setCuratedIndex] = useState(0);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [programsIndex, setProgramsIndex] = useState(0);

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

        // Fetch ALL venues (not just 8)
        const response = await venueService.listVenue();
        const allFetchedVenues = Array.isArray(response) ? response : [];

        // ✅ Filter only active venues
        const allVenues = allFetchedVenues.filter(v =>
          v.status?.toLowerCase() === 'active'
        );

        setVenues(allVenues);
        setError(null);

        // Extract unique categories from ALL venues
        const uniqueCategories = [...new Set(
          allVenues
            .map(v => v.category)
            .filter(cat => cat && cat.trim() !== "")
        )];
        setCategories(uniqueCategories);

        // Fetch images for ALL venues
        const imagePromises = allVenues.map(async (venue) => {
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
          setPrograms(sortedPrograms); // Store ALL programs
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

  // Brand names for display
  const brands = ["Adidas", "Nike", "Puma", "Levi's", "Zara", "H&M", "Calvin Klein",];
  // const categories = ["Vintage", "Classic", "Retro", "Brand", "EcoFriendly", "Vintage", "EcoStyle", "ReFashion", "GreenWear", "SecondLife", "UpCycle", "Retro"];

  // Helper function to get current items for carousel
  const getCurrentItems = (items, currentIndex, itemsPerPage = 4) => {
    const start = currentIndex * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  };

  // Navigation handlers
  const handleCuratedNext = () => {
    const maxIndex = Math.ceil(categories.length / 4) - 1;
    setCuratedIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handleCuratedPrev = () => {
    const maxIndex = Math.ceil(categories.length / 4) - 1;
    setCuratedIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleFeaturedNext = () => {
    const maxIndex = Math.ceil(venues.length / 3) - 1;
    setFeaturedIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handleFeaturedPrev = () => {
    const maxIndex = Math.ceil(venues.length / 3) - 1;
    setFeaturedIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleProgramsNext = () => {
    const maxIndex = Math.ceil(programs.length / 3) - 1;
    setProgramsIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handleProgramsPrev = () => {
    const maxIndex = Math.ceil(programs.length / 3) - 1;
    setProgramsIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  // Get current items for display (4 for categories, 3 for venues and programs)
  const currentCategories = getCurrentItems(categories, curatedIndex, 4);
  const currentVenues = getCurrentItems(venues, featuredIndex, 3);
  const currentPrograms = getCurrentItems(programs, programsIndex, 3);

  return (
    <div className="homepage">
      <Navbar />

      {/* Hero Section with Image Background */}
      <section className="hero-nostra">
        <div className="hero-nostra-content">
          {/* <h1 className="hero-nostra-title">Level up your style with our summer collections</h1> */}
          <button className="btn-nostra-primary" onClick={() => (window.location.href = "/venues")}>
            Shop now →
          </button>
        </div>
      </section>

      {/* Brands Section */}
      <section className="brands-section">
        <div className="brands-container">
          <h2 className="brands-title">Brands</h2>
          <div className="brands-grid">
            {brands.map((brand, idx) => (
              <div key={idx} className="brand-logo">
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Experience Section */}
      <section className="customer-experience">
        <div className="customer-experience-inner">
          <h2 className="customer-experience-title">We provide best customer experiences</h2>
          <p className="customer-experience-subtitle">We ensure our customers have the best shopping experience</p>
          <div className="experience-grid">
            <div className="experience-item">
              <div className="experience-icon">🔄</div>
              <h3>Original Products</h3>
            </div>
            <div className="experience-item">
              <div className="experience-icon">✓</div>
              <h3>Satisfaction Guarantee</h3>
            </div>
            <div className="experience-item">
              <div className="experience-icon">🏷️</div>
              <h3>New Arrival Everyday</h3>
            </div>
            <div className="experience-item">
              <div className="experience-icon">🚚</div>
              <h3>Fast & Free Shipping</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Curated Picks - Categories */}
      <section className="curated-picks">
        <div className="curated-picks-inner">
          <div className="curated-header">
            <h2 className="section-title-nostra">Curated picks</h2>
            {categories.length > 4 && (
              <div className="curated-nav">
                <button className="nav-arrow" onClick={handleCuratedPrev}>←</button>
                <button className="nav-arrow" onClick={handleCuratedNext}>→</button>
              </div>
            )}
          </div>
          <div className="curated-grid">
            {currentCategories.length > 0 ? (
              currentCategories.map((category, idx) => {
                // Get a sample venue image for this category
                const categoryVenue = venues.find(v => v.category === category);
                const categoryImage = categoryVenue ? images[categoryVenue.venue_id] : null;
                return (
                  <div key={`${category}-${idx}`} className="curated-card">
                    {categoryImage && (
                      <img src={categoryImage} alt={category} className="curated-image" />
                    )}
                    <button
                      className="curated-btn"
                      onClick={() => (window.location.href = `/venues?category=${encodeURIComponent(category)}`)}
                    >
                      Shop {category} →
                    </button>
                  </div>
                );
              })
            ) : (
              // Fallback categories if none found
              ["Best Seller", "Shop Men", "Shop Women", "Shop Casual"].map((cat, idx) => (
                <div key={idx} className="curated-card">
                  <button
                    className="curated-btn"
                    onClick={() => (window.location.href = "/shop")}
                  >
                    {cat} →
                  </button>
                </div>
              ))
            )}
            {/* Fill empty slots to maintain 4 columns */}
            {currentCategories.length < 4 && Array.from({ length: 4 - currentCategories.length }).map((_, idx) => (
              <div key={`empty-${idx}`} className="curated-card" style={{ visibility: 'hidden' }}></div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products - Venues */}
      <section className="featured-products">
        <div className="featured-products-inner">
          <div className="featured-header">
            <h2 className="section-title-nostra">Featured products</h2>
            {venues.length > 3 && (
              <div className="featured-nav">
                <button className="nav-arrow" onClick={handleFeaturedPrev}>←</button>
                <button className="nav-arrow" onClick={handleFeaturedNext}>→</button>
              </div>
            )}
          </div>
          <div className="featured-grid">
            {currentVenues.map((venue) => {
              const imageUrl = images[venue.venue_id];
              return (
                <div key={venue.venue_id} className="featured-card">
                  {imageUrl && (
                    <img src={imageUrl} alt={venue.venueName || "Item"} className="featured-image" />
                  )}
                  <div className="featured-badge">SALE</div>
                  <div className="featured-info">
                    <h3 className="featured-name">{venue.venueName || venue.title || "Item"}</h3>
                    <div className="featured-price-row">
                      <span className="featured-price">NPR {venue.price || "--"}</span>
                      {venue.originalPrice && venue.originalPrice > venue.price && (
                        <span className="featured-price-old">NPR {venue.originalPrice}</span>
                      )}
                    </div>
                    <button
                      className="featured-cart-btn"
                      onClick={() => addItem({ venueId: venue.venue_id, quantity: 1 })}
                    >
                      🛒
                    </button>
                  </div>
                </div>
              );
            })}
            {/* Fill empty slots to maintain 3 columns */}
            {currentVenues.length < 3 && Array.from({ length: 3 - currentVenues.length }).map((_, idx) => (
              <div key={`empty-venue-${idx}`} className="featured-card" style={{ visibility: 'hidden' }}></div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      {programs.length > 0 && (
        <section className="programs-section-nostra">
          <div className="programs-nostra-inner">
            <div className="programs-header">
              <h2 className="section-title-nostra">Active Programs</h2>
              {programs.length > 3 && (
                <div className="programs-nav">
                  <button className="nav-arrow" onClick={handleProgramsPrev}>←</button>
                  <button className="nav-arrow" onClick={handleProgramsNext}>→</button>
                </div>
              )}
            </div>
            <div className="programs-nostra-grid">
              {currentPrograms.map((program) => (
                <div key={program.programId} className="program-nostra-card">
                  {program.programImage && (
                    <img
                      src={program.programImage}
                      alt={program.programTitle}
                      className="program-nostra-image"
                    />
                  )}
                  <div className="program-nostra-body">
                    <h3 className="program-nostra-title">{program.programTitle}</h3>
                    <p className="program-nostra-desc">
                      {program.description.length > 80
                        ? program.description.substring(0, 80) + "..."
                        : program.description}
                    </p>
                    <button
                      className="program-nostra-btn"
                      onClick={() => (window.location.href = `/programs/${program.programId}`)}
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              ))}
              {/* Fill empty slots to maintain 3 columns */}
              {currentPrograms.length < 3 && Array.from({ length: 3 - currentPrograms.length }).map((_, idx) => (
                <div key={`empty-program-${idx}`} className="program-nostra-card" style={{ visibility: 'hidden' }}></div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <section className="newsletter-nostra">
        <div className="newsletter-nostra-inner">
          <h2 className="newsletter-nostra-title">Subscribe to our newsletter to get updates to our latest collections</h2>
          <p className="newsletter-nostra-subtitle">Get 20% off on your first order just by subscribing to our newsletter</p>
          <div className="newsletter-nostra-form">
            <input
              type="email"
              placeholder="Enter your email"
              className="newsletter-nostra-input"
            />
            <button className="newsletter-nostra-btn">Subscribe</button>
          </div>
          <p className="newsletter-nostra-privacy">
            You can unsubscribe at any time. <a href="/privacy">Privacy Policy</a>
          </p>
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
