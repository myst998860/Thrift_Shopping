import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import RecentBookings from "./RecentBookings";
import { useNavigate } from "react-router-dom";
import { programService, donationAPI } from "../../services/api";

const numberFormatter = new Intl.NumberFormat();

const normalizeProgramsResponse = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (typeof payload !== "object") return [];

  const arrayLikeKeys = [
    "programs",
    "data",
    "items",
    "results",
    "programList",
    "content"
  ];

  for (const key of arrayLikeKeys) {
    const value = payload[key];
    if (Array.isArray(value)) return value;
  }

  return [payload];
};

const normalizeOwnerToken = (value) => {
  if (value === undefined || value === null) return null;
  const token = String(value).trim();
  if (!token || token.toLowerCase() === "null" || token.toLowerCase() === "undefined") {
    return null;
  }
  return token.length > 0 ? token : null;
};

const extractOwnerFromObject = (value) => {
  if (!value || typeof value !== "object") return null;
  const candidateKeys = [
    "id",
    "userId",
    "partnerId",
    "ownerId",
    "createdBy",
    "ngoId",
    "user_id",
    "partner_id",
    "owner_id"
  ];
  for (const key of candidateKeys) {
    if (key in value) {
      const token = normalizeOwnerToken(value[key]);
      if (token !== null) return token;
    }
  }
  return null;
};

const getProgramOwnerToken = (program) => {
  if (!program || typeof program !== 'object') return null;
  // Try common ownership keys used across payload variants
  const candidateKeys = [
    "partnerId",
    "userId",
    "ownerId",
    "createdBy",
    "ngoId",
    "programOwnerId",
    "created_by",
    "partner_id",
    "user_id"
  ];
  for (const key of candidateKeys) {
    if (key in program && program[key] !== undefined && program[key] !== null && program[key] !== "") {
      const rawValue = program[key];
      const token = typeof rawValue === "object" ? extractOwnerFromObject(rawValue) : normalizeOwnerToken(rawValue);
      if (token !== null) return token;
    }
  }

  const nestedKeys = [
    "partner",
    "owner",
    "createdByUser",
    "createdBy",
    "ngo",
    "user",
    "creator"
  ];
  for (const key of nestedKeys) {
    if (key in program) {
      const token = extractOwnerFromObject(program[key]);
      if (token !== null) return token;
    }
  }
  return null;
};

const parseQuantityToNumber = (value) => {
  if (!value) return 0;
  const rangeMatch = String(value).match(/(\d+)\s*-\s*(\d+)/);
  if (rangeMatch) {
    const low = Number(rangeMatch[1]);
    const high = Number(rangeMatch[2]);
    if (!Number.isNaN(low) && !Number.isNaN(high)) {
      return Math.round((low + high) / 2);
    }
  }
  const plusMatch = String(value).match(/(\d+)\s*\+/);
  if (plusMatch) {
    const base = Number(plusMatch[1]);
    return Number.isNaN(base) ? 0 : base;
  }
  const digitsMatch = String(value).match(/(\d+)/);
  return digitsMatch ? Number(digitsMatch[1]) : 0;
};

const safeDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value) => {
  const date = safeDate(value);
  return date ? date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date TBD';
};

const decodeJwtPayload = (token) => {
  if (!token) return null;
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch (error) {
    console.warn("Failed to decode JWT payload", error);
    return null;
  }
};

const getCurrentPartnerToken = () => {
  const directKeys = [
    "userId",
    "id",
    "partnerId",
    "partner_id",
    "user_id",
    "ownerId",
    "owner_id",
  ];

  for (const key of directKeys) {
    const token = normalizeOwnerToken(localStorage.getItem(key));
    if (token !== null) return token;
  }

  const jwtToken = localStorage.getItem("jwtToken");
  const payload = decodeJwtPayload(jwtToken);
  if (payload && typeof payload === "object") {
    const payloadKeys = [
      "userId",
      "id",
      "partnerId",
      "ownerId",
      "sub"
    ];
    for (const key of payloadKeys) {
      if (key in payload) {
        const token = normalizeOwnerToken(payload[key]);
        if (token !== null) return token;
      }
    }
  }

  return null;
};

const formatNumber = (value) => numberFormatter.format(Number(value) || 0);

const isProgramActive = (program) => {
  const status = String(program?.status || '').toLowerCase();
  if (status) {
    if (["inactive", "completed", "ended", "archived", "cancelled", "canceled"].includes(status)) {
      return false;
    }
    return true;
  }
  const endDate = safeDate(program?.endDate);
  if (endDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return endDate >= today;
  }
  return true;
};

const isProgramStartingSoon = (program) => {
  const startDate = safeDate(program?.startDate);
  if (!startDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const twoWeeksLater = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
  return startDate >= today && startDate <= twoWeeksLater;
};

const isUpcomingPickup = (donation) => {
  const pickupDate = safeDate(donation?.preferredPickupDate || donation?.pickupDate || donation?.createdAt);
  if (!pickupDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return pickupDate >= today;
};

const Dashboard = () => {
  const [programs, setPrograms] = useState([]);
  const [donations, setDonations] = useState([]);
  const [chartData, setChartData] = useState({
    venues: [],
    bookings: []
  });
  const [selectedChart, setSelectedChart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [programCountAdded, setProgramCountAdded] = useState(null); // new: partner's program count
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");

    if (!token) {
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        let fetchedPrograms = [];
        let fetchedDonations = [];

        try {
          const programResponse = await programService.listPrograms();
          fetchedPrograms = normalizeProgramsResponse(programResponse);
        } catch (error) {
          console.error("Error fetching programs:", error);
        }

        try {
          const donationResponse = await donationAPI.listDonations();
          fetchedDonations = Array.isArray(donationResponse) ? donationResponse : [];
        } catch (error) {
          console.error("Error fetching donations:", error);
        }

        setPrograms(fetchedPrograms);
        setDonations(fetchedDonations);

        try {
          const chartResponse = await fetch("http://localhost:8080/api/chart-data", {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });

          if (chartResponse.ok) {
            const chartJson = await chartResponse.json();
            setChartData(chartJson);
          }
        } catch (error) {
          console.error("Error fetching chart data:", error);
        }

        // NEW: fetch partner-specific program count for logged-in partner (if we can extract id)
        try {
          const partnerToken = getCurrentPartnerToken();
          // partnerToken may be a string; try to coerce to number if numeric
          const partnerId = partnerToken ? (Number.isNaN(Number(partnerToken)) ? partnerToken : Number(partnerToken)) : null;
          if (partnerId) {
            const countResp = await fetch(`http://localhost:8080/programs/partner/${partnerId}/count`, {
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
              }
            });
            if (countResp.ok) {
              const json = await countResp.json();
              setProgramCountAdded(Number(json?.count) || 0);
            } else {
              setProgramCountAdded(null);
            }
          } else {
            setProgramCountAdded(null);
          }
        } catch (error) {
          console.error("Error fetching program count for partner:", error);
          setProgramCountAdded(null);
        }

      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = useMemo(() => {
    // Removed partner-only filtering: use ALL programs for stats
    const totalDonations = donations.length;
    const upcomingPickupCount = donations.filter(isUpcomingPickup).length;

    const totalPrograms = programs.length; // all programs
    const activeProgramCount = programs.filter(isProgramActive).length;
    const startingSoonCount = programs.filter(isProgramStartingSoon).length;

    const peopleHelped = programs.reduce((sum, program) => {
      const value = Number(program?.peopleHelped ?? program?.estimatedBeneficiaries ?? 0);
      return sum + (Number.isNaN(value) ? 0 : value);
    }, 0);

    const itemsCollected = donations.reduce((sum, donation) => sum + parseQuantityToNumber(donation?.estimatedQuantity), 0);

    // Build base stats array
    const baseStats = [
      {
        label: "Assigned Donations",
        value: formatNumber(totalDonations),
        subtitle: totalDonations
          ? `${upcomingPickupCount || '0'} pickups scheduled`
          : "No donations yet",
        clickable: false,
      },
      {
        label: "Active Programs",
        value: formatNumber(activeProgramCount),
        subtitle: totalPrograms
          ? startingSoonCount
            ? `${startingSoonCount} starting soon`
            : `${totalPrograms} total programs`
          : "No programs created",
        clickable: false,
      },
      {
        label: "People Helped",
        value: formatNumber(peopleHelped),
        subtitle: peopleHelped ? "Across all programs" : "Awaiting impact",
        clickable: false,
      },
      {
        label: "Items Collected",
        value: formatNumber(itemsCollected),
        subtitle: itemsCollected ? "Estimated from donations" : "No items collected yet",
        clickable: false,
      },
    ];

    // Insert Programs Added stat (partner-specific) as the first card
    const programsAddedCard = {
      label: "Programs Added",
      value: programCountAdded == null ? "—" : formatNumber(programCountAdded),
      subtitle: programCountAdded == null ? "Not available" : `${programCountAdded} programs by you`,
      clickable: false,
    };

    return [programsAddedCard, ...baseStats];
  }, [programs, donations, programCountAdded]);

  const upcomingPickups = useMemo(() => {
    const sorted = [...donations].sort((a, b) => {
      const dateA = safeDate(a?.preferredPickupDate || a?.pickupDate || a?.createdAt) || new Date(8640000000000000);
      const dateB = safeDate(b?.preferredPickupDate || b?.pickupDate || b?.createdAt) || new Date(8640000000000000000);
      return dateA - dateB;
    });
    return sorted.slice(0, 3);
  }, [donations]);

  const activeProgramList = useMemo(() => {
    // Show top active programs across ALL programs (since partner filtering removed)
    const owned = programs; // previously filtered by owner, now it's all programs
    const filtered = owned.filter(isProgramActive);
    const sorted = filtered.sort((a, b) => {
      const percentA = (() => {
        const target = Number(a?.targetItems ?? a?.targetItemsToCollect ?? 0) || 0;
        const collected = Number(a?.itemsCollected ?? a?.collectedItems ?? a?.estimatedBeneficiaries ?? 0) || 0;
        return target > 0 ? collected / target : 0;
      })();
      const percentB = (() => {
        const target = Number(b?.targetItems ?? b?.targetItemsToCollect ?? 0) || 0;
        const collected = Number(b?.itemsCollected ?? b?.collectedItems ?? b?.estimatedBeneficiaries ?? 0) || 0;
        return target > 0 ? collected / target : 0;
      })();
      return percentB - percentA;
    });
    return sorted.slice(0, 3);
  }, [programs]);

  const handleStatClick = (statType) => {
    if (!statType) return;
    setSelectedChart(statType);
  };

  const handleCloseChart = () => {
    setSelectedChart(null);
  };

  const renderChart = (type) => {
    const data = chartData[type] || [];
    
    switch (type) {
      case 'venues':
        return (
          <div className="chart-container">
            <h3>Venue Growth Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="venues" stroke="#ff7300" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      
      case 'bookings':
        return (
          <div className="chart-container">
            <h3>Booking & Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="bookings" stroke="#8884d8" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <main className="dashboard" style={{ flex: 1 }}>
        <div className="breadcrumb">Partner Dashboard</div>
        <h1>Partner Dashboard</h1>
        <p>Loading dashboard insights...</p>
      </main>
    );
  }

  return (
    <main className="dashboard" style={{ flex: 1 }}>
      <div className="breadcrumb">Partner Dashboard</div>
      <div className="dashboard-top-row">
        <div>
          <h1>Partner Dashboard</h1>
          <p style={{ color: '#6b7280' }}>City Relief NGO · Making a difference together</p>
        </div>
        <div className="dashboard-actions">
          <button
            className="dashboard-primary-btn"
            onClick={() => navigate('/partner/program')}
          >
            Create Program
          </button>
          <button
            className="dashboard-secondary-btn"
            onClick={() => alert('Upload media feature coming soon!')}
          >
            Upload Media
          </button>
        </div>
      </div>
      
      <div className="stats-row">
        {stats.map((stat, index) => {
          const isClickable = Boolean(stat.clickable && stat.type);
          return (
            <div 
              className={`stat-card ${isClickable ? 'clickable' : ''}`} 
              key={stat.label || index}
              onClick={() => isClickable && handleStatClick(stat.type)}
              style={{ cursor: isClickable ? 'pointer' : 'default' }}
            >
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
              {stat.subtitle && <div className="stat-subtitle">{stat.subtitle}</div>}
            </div>
          );
        })}
      </div>

      {selectedChart && (
        <div className="chart-modal-overlay" onClick={handleCloseChart}>
          <div className="chart-modal" onClick={(e) => e.stopPropagation()}>
            <div className="chart-modal-header">
              <h2>{selectedChart.charAt(0).toUpperCase() + selectedChart.slice(1)} Analytics</h2>
              <button className="chart-close-btn" onClick={handleCloseChart}>×</button>
            </div>
            <div className="chart-modal-body">
              {renderChart(selectedChart)}
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="dashboard-column">
          <section className="dashboard-card">
            <div className="dashboard-card-header">
              <div>
                <h2>Upcoming Pickups</h2>
                <p className="dashboard-card-subtitle">Scheduled donation collections</p>
              </div>
              <button className="panel-link" onClick={() => navigate('/partner/donations')}>
                View All
              </button>
            </div>
            <div className="pickup-list">
              {upcomingPickups.length ? (
                upcomingPickups.map((donation) => {
                  const quantity = parseQuantityToNumber(donation?.estimatedQuantity);
                  const status = String(donation?.status || 'scheduled').toLowerCase();
                  const statusClass = ['pending', 'scheduled', 'completed'].includes(status) ? status : 'scheduled';
                  return (
                    <div className="pickup-item" key={donation?.donationId || donation?.id || donation?.fullName}>
                      <div className="pickup-item-left">
                        <div className="pickup-header">
                          <span className="pickup-name">{donation?.fullName || 'Donor'}</span>
                          <span className={`status-pill ${statusClass}`}>{statusClass}</span>
                        </div>
                        <p className="pickup-meta">{[donation?.streetAddress || donation?.street, donation?.city].filter(Boolean).join(', ') || 'Address pending'}</p>
                        <p className="pickup-meta">{quantity ? `${quantity} items` : 'Quantity pending'}</p>
                      </div>
                      <div className="pickup-item-right">
                        <div className="pickup-date">{formatDate(donation?.preferredPickupDate || donation?.pickupDate || donation?.createdAt)}</div>
                        <button className="link-button" onClick={() => navigate('/partner/donations')}>
                          Update
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="dashboard-card-empty">No upcoming pickups scheduled.</p>
              )}
            </div>
          </section>

          <section className="dashboard-card">
            <RecentBookings />
          </section>

          <section className="dashboard-card">
            <div className="dashboard-card-header">
              <div>
                <h2>Quick Actions</h2>
                <p className="dashboard-card-subtitle">Common NGO tasks and operations</p>
              </div>
            </div>
            <div className="quick-actions-grid">
              <button className="quick-action-btn" onClick={() => navigate('/partner/donations')}>
                Manage Pickups
              </button>
              <button className="quick-action-btn" onClick={() => navigate('/partner/programs')}>
                View Programs
              </button>
              <button className="quick-action-btn" onClick={() => alert('Upload media feature coming soon!')}>
                Upload Media
              </button>
              <button className="quick-action-btn" onClick={() => alert('Report generation coming soon!')}>
                Generate Report
              </button>
            </div>
          </section>
        </div>

        <div className="dashboard-column">
          <section className="dashboard-card">
            <div className="dashboard-card-header">
              <div>
                <h2>Active Programs</h2>
                <p className="dashboard-card-subtitle">Current donation programs</p>
              </div>
              <button className="panel-link" onClick={() => navigate('/partner/programs')}>
                View All
              </button>
            </div>
            <div className="program-list">
              {activeProgramList.length ? (
                activeProgramList.map((program) => {
                  const targetItems = Number(program?.targetItems ?? program?.targetItemsToCollect ?? 0) || 0;
                  const collectedItems = Number(program?.itemsCollected ?? program?.collectedItems ?? program?.estimatedBeneficiaries ?? 0) || 0;
                  const progress = targetItems > 0 ? Math.min(100, Math.round((collectedItems / targetItems) * 100)) : 0;
                  return (
                    <div className="program-list-item" key={program?.programId || program?.id || program?.programTitle}>
                      <div className="program-list-header">
                        <div>
                          <h3>{program?.programTitle || 'Program'}</h3>
                          <p>{program?.description || 'No description provided.'}</p>
                        </div>
                        <span className={`status-pill ${String(program?.status || 'active').toLowerCase()}`}>{program?.status || 'Active'}</span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                      </div>
                      <div className="program-meta-row">
                        <span>{formatNumber(collectedItems)} of {targetItems ? formatNumber(targetItems) : '—'} items collected</span>
                        <span>{formatNumber(program?.estimatedBeneficiaries || 0)} beneficiaries</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="dashboard-card-empty">No active programs yet. Create one to get started.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};
export default Dashboard;
