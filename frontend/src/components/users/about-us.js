"use client"

import { useState, useEffect } from "react"
import Header from "./Header"
import Footer from "./Footer"
import "../../styles/about-us.css"

const AboutUs = () => {
  const [activeProcessTab, setActiveProcessTab] = useState("story")
  const [statsVisible, setStatsVisible] = useState(false)
  const [expandedMember, setExpandedMember] = useState(null)

  // Intersection Observer for stats animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setStatsVisible(true)
          }
        })
      },
      { threshold: 0.5 },
    )

    const statsSection = document.querySelector(".about-statistics-section")
    if (statsSection) {
      observer.observe(statsSection)
    }

    return () => observer.disconnect()
  }, [])

  const teamMembers = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Founder & Lead Wedding Planner",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      bio: "With over 10 years of experience in wedding planning, Sarah brings creativity and attention to detail to every celebration.",
      fullBio:
        "Sarah founded the company in 2014 with a vision to create extraordinary wedding experiences. Her background in event management and passion for design has helped over 500 couples celebrate their special day. She specializes in luxury weddings and destination planning, ensuring every detail reflects the couple's unique story.",
      specialties: ["Luxury Weddings", "Destination Planning", "Cultural Ceremonies"],
      email: "sarah@company.com",
      linkedin: "#",
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Creative Director",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      bio: "Michael's artistic vision and innovative design concepts have transformed countless venues into magical wedding destinations.",
      fullBio:
        "Michael joined our team in 2016, bringing his expertise in floral design and venue styling. His creative approach has won multiple industry awards and his work has been featured in top wedding magazines. He believes every wedding should be a work of art.",
      specialties: ["Floral Design", "Venue Styling", "Theme Development"],
      email: "michael@company.com",
      linkedin: "#",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Coordination Specialist",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      bio: "Emily ensures every wedding day runs seamlessly, coordinating vendors and managing timelines with precision.",
      fullBio:
        "Emily's organizational skills and calm demeanor make her the perfect day-of coordinator. She has successfully managed over 200 weddings and is known for her ability to handle any situation with grace and professionalism.",
      specialties: ["Day-of Coordination", "Vendor Management", "Timeline Planning"],
      email: "emily@company.com",
      linkedin: "#",
    },
  ]

  const statisticsData = [
    { number: "500+", label: "Weddings Planned", description: "Successfully planned and executed" },
    { number: "10+", label: "Years Experience", description: "In the wedding industry" },
    { number: "50+", label: "Vendor Partners", description: "Trusted professionals" },
    { number: "98%", label: "Client Satisfaction", description: "Happy couples" },
  ]

  const companyValues = [
    {
      title: "Personalized Service",
      description: "Every couple is unique, and we tailor our services to reflect your individual style and vision.",
      icon: "💝",
      details:
        "We take time to understand your story, preferences, and dreams to create a truly personalized experience.",
    },
    {
      title: "Attention to Detail",
      description: "From the grandest gestures to the smallest touches, we ensure every element is perfect.",
      icon: "✨",
      details:
        "Our meticulous planning process ensures nothing is overlooked, from timeline coordination to final touches.",
    },
    {
      title: "Stress-Free Planning",
      description: "We handle the logistics so you can focus on what matters most - celebrating your love.",
      icon: "🌸",
      details: "Our comprehensive planning approach removes the stress, allowing you to enjoy your engagement period.",
    },
    {
      title: "Lasting Relationships",
      description: "We build meaningful connections with our couples that extend beyond the wedding day.",
      icon: "💕",
      details:
        "Many of our couples become lifelong friends, and we love celebrating anniversaries and milestones together.",
    },
  ]

  const toggleMemberDetails = (memberId) => {
    setExpandedMember(expandedMember === memberId ? null : memberId)
  }

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="about-page-wrapper">
      <Header />

      {/* Hero Section */}
      <div className="about-hero-section">
        <div className="about-hero-overlay"></div>
        <div className="about-hero-content">
          <h1>About Our Story</h1>
          <p>Creating unforgettable moments, one wedding at a time</p>
          <div className="about-hero-actions">
            <button
              className="about-hero-btn about-hero-btn-primary"
              onClick={() => scrollToSection("company-story-section")}
            >
              Our Journey
            </button>
            <button
              className="about-hero-btn about-hero-btn-secondary"
              onClick={() => scrollToSection("team-members-section")}
            >
              Meet the Team
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Breadcrumb */}
      <div className="about-breadcrumb-nav">
        <div className="about-breadcrumb-container">
          <button onClick={() => scrollToSection("company-story-section")}>Our Story</button>
          <button onClick={() => scrollToSection("about-statistics-section")}>Our Impact</button>
          <button onClick={() => scrollToSection("company-values-section")}>Our Values</button>
          <button onClick={() => scrollToSection("team-members-section")}>Our Team</button>
          <button onClick={() => scrollToSection("planning-process-section")}>Our Process</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="about-main-container">
        {/* Story Section */}
        <section className="company-story-section" id="company-story-section">
          <div className="about-section-content">
            <div className="company-story-grid">
              <div className="company-story-text">
                <div className="about-section-header">
                  <h2>Our Journey</h2>
                  <div className="about-section-subtitle">From dream to reality</div>
                </div>
                <div className="company-story-content">
                  <p>
                    Founded in 2014, &lt;Company Name&gt; began as a dream to create extraordinary wedding experiences
                    that reflect each couple's unique love story. What started as a small passion project has grown into
                    a full-service wedding planning company trusted by couples across the region.
                  </p>
                  <p>
                    We believe that your wedding day should be a perfect reflection of your love, personality, and
                    dreams. Our team of dedicated professionals works tirelessly to bring your vision to life, handling
                    every detail so you can focus on what truly matters - celebrating your love.
                  </p>
                  <p>
                    From intimate garden ceremonies to grand ballroom celebrations, we've had the privilege of planning
                    over 500 weddings, each one as unique and special as the couple at its heart.
                  </p>
                </div>
                <div className="company-story-highlights">
                  <div className="story-highlight-item">
                    <span className="story-highlight-icon">🎯</span>
                    <div>
                      <strong>Our Mission</strong>
                      <p>To create unforgettable wedding experiences that celebrate love in all its forms.</p>
                    </div>
                  </div>
                  <div className="story-highlight-item">
                    <span className="story-highlight-icon">👁️</span>
                    <div>
                      <strong>Our Vision</strong>
                      <p>To be the most trusted wedding planning partner, known for excellence and innovation.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="company-story-image">
                <img
                  src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                  alt="Wedding planning process"
                  loading="lazy"
                />
                <div className="story-image-caption">Behind the scenes of creating your perfect day</div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Stats Section */}
        <section className="about-statistics-section" id="about-statistics-section">
          <div className="about-section-content">
            <div className="about-section-header about-section-header-centered">
              <h2>Our Impact</h2>
              <div className="about-section-subtitle">The numbers that tell our story of success</div>
            </div>

            <div className="statistics-container">
              <div className="statistics-grid">
                {statisticsData.map((stat, index) => (
                  <div
                    key={index}
                    className={`statistics-item ${statsVisible ? "statistics-item-animate" : ""}`}
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <div className="statistics-content">
                      <div className="statistics-number">{stat.number}</div>
                      <div className="statistics-label">{stat.label}</div>
                      <div className="statistics-description">{stat.description}</div>
                    </div>
                    <div className="statistics-decoration"></div>
                  </div>
                ))}
              </div>

              <div className="statistics-highlight">
                <div className="statistics-highlight-content">
                  <h3>Why These Numbers Matter</h3>
                  <p>
                    Each statistic represents real couples whose dreams we've helped bring to life. Our decade of
                    experience has taught us that every wedding is unique, and our growing network of trusted vendors
                    ensures we can handle any vision, any style, any budget.
                  </p>
                  <div className="statistics-highlight-features">
                    <div className="statistics-feature-item">
                      <span className="statistics-feature-icon">🏆</span>
                      <span>Award-winning service</span>
                    </div>
                    <div className="statistics-feature-item">
                      <span className="statistics-feature-icon">⭐</span>
                      <span>5-star average rating</span>
                    </div>
                    <div className="statistics-feature-item">
                      <span className="statistics-feature-icon">🌟</span>
                      <span>Industry recognition</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="company-values-section" id="company-values-section">
          <div className="about-section-content">
            <div className="about-section-header about-section-header-centered">
              <h2>What We Stand For</h2>
              <div className="about-section-subtitle">The principles that guide everything we do</div>
            </div>
            <div className="company-values-grid">
              {companyValues.map((value, index) => (
                <div key={index} className="company-value-item">
                  <div className="company-value-icon">{value.icon}</div>
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                  <div className="company-value-details">{value.details}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="team-members-section" id="team-members-section">
          <div className="about-section-content">
            <div className="about-section-header about-section-header-centered">
              <h2>Meet Our Team</h2>
              <div className="about-section-subtitle">
                Our passionate team of wedding professionals is dedicated to making your special day perfect.
              </div>
            </div>
            <div className="team-members-grid">
              {teamMembers.map((member) => (
                <div key={member.id} className="team-member-card">
                  <div className="team-member-image">
                    <img src={member.image || "/placeholder.svg"} alt={member.name} loading="lazy" />
                    <div className="team-member-overlay">
                      <button
                        className="team-member-contact-btn"
                        onClick={() => (window.location.href = `mailto:${member.email}`)}
                      >
                        Contact
                      </button>
                    </div>
                  </div>
                  <div className="team-member-info">
                    <h3>{member.name}</h3>
                    <h4>{member.role}</h4>
                    <p>{expandedMember === member.id ? member.fullBio : member.bio}</p>

                    <button
                      className="team-member-read-more-btn"
                      onClick={() => toggleMemberDetails(member.id)}
                      aria-expanded={expandedMember === member.id}
                    >
                      {expandedMember === member.id ? "Read Less" : "Read More"}
                    </button>

                    <div className="team-member-specialties">
                      <strong>Specialties:</strong>
                      <div className="team-member-specialty-tags">
                        {member.specialties.map((specialty, index) => (
                          <span key={index} className="team-member-specialty-tag">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="team-member-contact">
                      <a href={`mailto:${member.email}`} className="team-member-contact-link">
                        📧 {member.email}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="planning-process-section" id="planning-process-section">
          <div className="about-section-content">
            <div className="about-section-header about-section-header-centered">
              <h2>Our Process</h2>
              <div className="about-section-subtitle">How we bring your dream wedding to life</div>
            </div>

            <div className="planning-process-tabs">
              <button
                className={`planning-process-tab-btn ${activeProcessTab === "story" ? "planning-process-tab-btn-active" : ""}`}
                onClick={() => setActiveProcessTab("story")}
                aria-pressed={activeProcessTab === "story"}
              >
                <span className="planning-process-tab-icon">🔍</span>
                Discovery
              </button>
              <button
                className={`planning-process-tab-btn ${activeProcessTab === "planning" ? "planning-process-tab-btn-active" : ""}`}
                onClick={() => setActiveProcessTab("planning")}
                aria-pressed={activeProcessTab === "planning"}
              >
                <span className="planning-process-tab-icon">📋</span>
                Planning
              </button>
              <button
                className={`planning-process-tab-btn ${activeProcessTab === "execution" ? "planning-process-tab-btn-active" : ""}`}
                onClick={() => setActiveProcessTab("execution")}
                aria-pressed={activeProcessTab === "execution"}
              >
                <span className="planning-process-tab-icon">✨</span>
                Execution
              </button>
            </div>

            <div className="planning-process-tab-content">
              {activeProcessTab === "story" && (
                <div className="planning-process-step">
                  <div className="planning-process-step-header">
                    <h3>Discovery & Vision</h3>
                    <span className="planning-process-step-number">01</span>
                  </div>
                  <p>
                    We start by getting to know you as a couple. Through detailed consultations, we learn about your
                    love story, style preferences, budget, and dreams for your special day. This foundation helps us
                    create a personalized plan that's uniquely yours.
                  </p>
                  <div className="planning-process-step-features">
                    <div className="planning-process-feature">
                      <span className="planning-process-feature-icon">💬</span>
                      <div>
                        <strong>Initial consultation and vision session</strong>
                        <p>In-depth discussion about your dreams and expectations</p>
                      </div>
                    </div>
                    <div className="planning-process-feature">
                      <span className="planning-process-feature-icon">🎨</span>
                      <div>
                        <strong>Style and preference assessment</strong>
                        <p>Understanding your aesthetic and personal style</p>
                      </div>
                    </div>
                    <div className="planning-process-feature">
                      <span className="planning-process-feature-icon">💰</span>
                      <div>
                        <strong>Budget planning and allocation</strong>
                        <p>Strategic budget distribution for maximum impact</p>
                      </div>
                    </div>
                    <div className="planning-process-feature">
                      <span className="planning-process-feature-icon">📅</span>
                      <div>
                        <strong>Timeline development</strong>
                        <p>Comprehensive planning schedule from engagement to wedding day</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeProcessTab === "planning" && (
                <div className="planning-process-step">
                  <div className="planning-process-step-header">
                    <h3>Design & Planning</h3>
                    <span className="planning-process-step-number">02</span>
                  </div>
                  <p>
                    With your vision in mind, we begin the detailed planning process. From venue selection to vendor
                    coordination, we handle every aspect of your wedding planning while keeping you informed and
                    involved in all major decisions.
                  </p>
                  <div className="planning-process-step-features">
                    <div className="planning-process-feature">
                      <span className="planning-process-feature-icon">🏛️</span>
                      <div>
                        <strong>Venue selection and booking</strong>
                        <p>Finding and securing the perfect location for your celebration</p>
                      </div>
                    </div>
                    <div className="planning-process-feature">
                      <span className="planning-process-feature-icon">🤝</span>
                      <div>
                        <strong>Vendor sourcing and management</strong>
                        <p>Connecting you with trusted professionals in our network</p>
                      </div>
                    </div>
                    <div className="planning-process-feature">
                      <span className="planning-process-feature-icon">🎭</span>
                      <div>
                        <strong>Design concept development</strong>
                        <p>Creating cohesive visual themes and styling concepts</p>
                      </div>
                    </div>
                    <div className="planning-process-feature">
                      <span className="planning-process-feature-icon">📄</span>
                      <div>
                        <strong>Contract negotiations and reviews</strong>
                        <p>Ensuring fair terms and protecting your interests</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeProcessTab === "execution" && (
                <div className="planning-process-step">
                  <div className="planning-process-step-header">
                    <h3>Flawless Execution</h3>
                    <span className="planning-process-step-number">03</span>
                  </div>
                  <p>
                    On your wedding day, our team ensures everything runs smoothly. We coordinate with all vendors,
                    manage the timeline, and handle any unexpected situations so you can relax and enjoy every moment of
                    your celebration.
                  </p>
                  <div className="planning-process-step-features">
                    <div className="planning-process-feature">
                      <span className="planning-process-feature-icon">⏰</span>
                      <div>
                        <strong>Day-of coordination and management</strong>
                        <p>Seamless execution of your wedding day timeline</p>
                      </div>
                    </div>
                    <div className="planning-process-feature">
                      <span className="planning-process-feature-icon">👥</span>
                      <div>
                        <strong>Vendor supervision and timeline management</strong>
                        <p>Coordinating all service providers for perfect timing</p>
                      </div>
                    </div>
                    <div className="planning-process-feature">
                      <span className="planning-process-feature-icon">🎉</span>
                      <div>
                        <strong>Guest assistance and support</strong>
                        <p>Ensuring your guests have everything they need</p>
                      </div>
                    </div>
                    <div className="planning-process-feature">
                      <span className="planning-process-feature-icon">🚨</span>
                      <div>
                        <strong>Emergency problem-solving</strong>
                        <p>Quick resolution of any unexpected issues</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {/* <section className="about-cta-section">
          <div className="about-section-content">
            <div className="about-cta-content">
              <h2>Ready to Start Planning?</h2>
              <p>Let's create something beautiful together. Contact us today to begin your wedding journey.</p>
              <div className="about-cta-buttons">
                <button
                  className="about-cta-btn about-cta-btn-primary"
                  onClick={() => (window.location.href = "/contact")}
                >
                  Schedule Consultation
                </button>
                <button
                  className="about-cta-btn about-cta-btn-secondary"
                  onClick={() => (window.location.href = "/portfolio")}
                >
                  View Our Portfolio
                </button>
              </div>
              <div className="about-cta-contact-info">
                <div className="about-cta-contact-item">
                  <span>📞</span>
                  <a href="tel:+1234567890">+1 (234) 567-8900</a>
                </div>
                <div className="about-cta-contact-item">
                  <span>📧</span>
                  <a href="mailto:hello@company.com">hello@company.com</a>
                </div>
              </div>
            </div>
          </div>
        </section> */}
      </div>

      {/* TODO: Add Footer component here */}
      <Footer /> 
    </div>
  )
}

export default AboutUs
