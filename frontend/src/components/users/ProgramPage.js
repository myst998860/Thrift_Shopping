import React, { useEffect, useState } from "react";
import { programService } from "../../services/api";
import "../../styles/ProgramPage.css";
import { useNavigate, useLocation } from "react-router-dom";

const ProgramPage = () => {
  const [programs, setPrograms] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  // Fetch all programs (including partner-owned)
  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const data = await programService.listPrograms();
      
      // Make sure every program has required fields
      const safePrograms = data.map((p) => ({
        programId: p.programId,
        programTitle: p.programTitle || "Untitled Program",
        name: p.name || "ThriftGood",
        description: p.description || "No description available",
        category: p.category || "Other",
        programImage: p.programImage || "/default-image.png",
        programLocation: p.programLocation || "Kathmandu",
        targetItemsToCollect: p.targetItemsToCollect || 1,
        estimatedBeneficiaries: p.estimatedBeneficiaries || 0,
      }));

      setPrograms(safePrograms);
    } catch (error) {
      console.error("Error fetching programs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Refetch whenever route changes (important after adding a program)
  useEffect(() => {
    fetchPrograms();
  }, [location.pathname]);

  // Apply search & category filters
  useEffect(() => {
    let filteredData = programs;

    if (search.trim() !== "") {
      const lowerSearch = search.toLowerCase();
      filteredData = filteredData.filter(
        (p) =>
          p.programTitle.toLowerCase().includes(lowerSearch) ||
          p.name.toLowerCase().includes(lowerSearch) ||
          p.description.toLowerCase().includes(lowerSearch) ||
          p.category.toLowerCase().includes(lowerSearch)
      );
    }

    if (categoryFilter) {
      filteredData = filteredData.filter((p) => p.category === categoryFilter);
    }

    setFiltered(filteredData);
  }, [search, categoryFilter, programs]);

  return (
    <div className="programs-page">
      <div className="header-section">
        <h1 className="page-title">Social Impact Programs</h1>
        <p className="page-subtitle">
          Discover programs making a difference in our community. Browse,
          donate, and support initiatives that matter.
        </p>

        <div className="filter-bar">
          <input
            type="text"
            placeholder="🔍 Search programs by name, description, NGO, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Programs</option>
            <option value="Clothing">Clothing</option>
            <option value="Education">Education</option>
            <option value="Community">Community</option>
            <option value="Emergency Relief">Emergency Relief</option>
            <option value="Seasonal">Seasonal</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", marginTop: 50 }}>Loading programs...</div>
      ) : filtered.length > 0 ? (
        <div className="program-grid">
          {filtered.map((program) => (
            <div key={program.programId} className="program-card">
              <div className="program-image-container">
                <img
                  src={
                    program.programImage?.startsWith("http")
                      ? program.programImage
                      : program.programImage
                  }
                  alt={program.programTitle}
                />
                <span className={`status-badge ${program.category.toLowerCase()}`}>
                  {program.category}
                </span>
              </div>

              <div className="program-content">
                <h3 className="program-title">{program.programTitle}</h3>
                <p className="program-org">{program.name}</p>
                <p className="program-desc">{program.description}</p>

                <div className="program-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${
                          Math.min(
                            program.estimatedBeneficiaries / program.targetItemsToCollect,
                            1
                          ) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="program-location">
                  📍 {program.programLocation}
                </div>

                <button
                  className="view-details-btn"
                  onClick={() => navigate(`/programs/${program.programId}`)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", marginTop: 50 }}>No programs found.</div>
      )}
    </div>
  );
};

export default ProgramPage;
