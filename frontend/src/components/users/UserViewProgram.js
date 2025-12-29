import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { programService } from '../../services/api';
import Header from "../users/Header";
import Footer from "../users/Footer";
import "../../styles/UserViewProgram.css";

const pickFirstAvailable = (source, keys, fallback = undefined) => {
  if (!source) return fallback;
  for (const key of keys) {
    if (key in source && source[key] !== undefined && source[key] !== null && source[key] !== "") {
      return source[key];
    }
  }
  return fallback;
};

const normalizeProgramDetail = (payload) => {
  if (!payload) return null;
  if (Array.isArray(payload)) {
    return payload.length > 0 ? payload[0] : null;
  }
  if (typeof payload !== "object") {
    return null;
  }

  const directKeys = ["program", "data", "result", "results", "item"];
  for (const key of directKeys) {
    if (key in payload) {
      const value = payload[key];
      if (Array.isArray(value)) {
        return value.length > 0 ? value[0] : null;
      }
      if (value && typeof value === "object") {
        return normalizeProgramDetail(value);
      }
    }
  }

  return payload;
};

const getProgramId = (program) => pickFirstAvailable(program, ["programId", "id", "donationProgramId", "program_id"]);
const getProgramTitle = (program) => pickFirstAvailable(program, ["programTitle", "title", "name"], "Program");
const getNgoName = (program) => pickFirstAvailable(program, ["name", "ngoName", "organization", "partnerName"], "ThriftGood");
const getProgramCategory = (program) => pickFirstAvailable(program, ["category", "programCategory", "type"], "Community");
const getProgramDescription = (program) => pickFirstAvailable(program, ["description", "programDescription", "details"], "No description provided.");
const getProgramGoal = (program) => pickFirstAvailable(program, ["programGoal", "goal", "objectives"], "—");
const getProgramObjective = (program) => pickFirstAvailable(program, ["objective", "programObjective", "mission"], "—");
const getProgramStatus = (program) => pickFirstAvailable(program, ["status", "state"], "Active");
const getProgramLocation = (program) => pickFirstAvailable(program, ["programLocation", "location", "address"], "Kathmandu");

const getProgramImage = (program) => {
  const raw = pickFirstAvailable(program, ["programImage", "image", "imageUrl", "bannerImage", "thumbnail"], "");
  if (!raw) return null;
  if (typeof raw === "string" && (raw.startsWith("http") || raw.startsWith("data:image"))) {
    return raw;
  }
  return `data:image/jpeg;base64,${raw}`;
};

const parseDate = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value) => {
  const date = parseDate(value);
  return date ? date.toLocaleDateString() : "—";
};

const getStartDate = (program) => pickFirstAvailable(program, ["startDate", "start_time", "start", "programStart"], null);
const getEndDate = (program) => pickFirstAvailable(program, ["endDate", "end_time", "end", "programEnd"], null);

const toPositiveNumber = (value, allowZero = true) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  if (number < 0) return 0;
  if (!allowZero && number === 0) return 0;
  return number;
};

const getTargetItems = (program) =>
  toPositiveNumber(pickFirstAvailable(program, ["targetItems", "targetItemsToCollect", "goalItems", "collectionTarget", "target"], 0));

const getCollectedItems = (program) =>
  toPositiveNumber(
    pickFirstAvailable(
      program,
      ["itemsCollected", "collectedItems", "currentItems", "donationsCollected", "estimatedBeneficiaries", "collected"],
      0
    )
  );

const getPeopleHelped = (program, fallback = 0) =>
  toPositiveNumber(pickFirstAvailable(program, ["estimatedBeneficiaries", "beneficiaries", "peopleHelped"], fallback));

const getDonationProgramId = (program) => pickFirstAvailable(program, ["donationProgramId", "programId", "id"]);


const UserViewProgram = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const data = await programService.getProgram(id);
        const normalized = normalizeProgramDetail(data);
        setProgram(normalized);
      } catch (err) {
        setError("Could not load program details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProgram();
  }, [id]);

  const getImageSrc = () => {
    if (!program) return "https://via.placeholder.com/1200x400?text=Program+Image";
    return getProgramImage(program) || "https://via.placeholder.com/1200x400?text=Program+Image";
  };

  if (loading)
    return (
      <div className="program-view-page">
        <Header />
        <div className="loading">Loading program details...</div>
        <Footer />
      </div>
    );

  if (error)
    return (
      <div className="program-view-page">
        <Header />
        <div className="error-message">{error}</div>
        <Footer />
      </div>
    );

  if (!program)
    return (
      <div className="program-view-page">
        <Header />
        <div className="error-message">Program not found.</div>
        <Footer />
      </div>
    );

  const title = getProgramTitle(program);
  const description = getProgramDescription(program);
  const category = getProgramCategory(program);
  const startDate = formatDate(getStartDate(program));
  const endDate = formatDate(getEndDate(program));
  const location = getProgramLocation(program);
  const targetItems = getTargetItems(program);
  const collectedItems = getCollectedItems(program);
  const peopleHelped = getPeopleHelped(program, collectedItems);
  const programGoal = getProgramGoal(program);
  const teamMemberName = pickFirstAvailable(program, ["name", "teamMember", "coordinator"], "—");
  const teamMemberRole = pickFirstAvailable(program, ["role", "teamRole", "position"], "—");
  const programObjective = getProgramObjective(program);
  const status = getProgramStatus(program);
  const donationProgramId = getDonationProgramId(program);
  const percent = targetItems > 0 ? Math.min(100, Math.round((collectedItems / targetItems) * 100)) : 0;
  const ngoName = getNgoName(program);

  return (
    <div className="program-view-page">
      <Header />

      {/* Breadcrumb */}
      <div className="program-breadcrumb">
        <Link to="/home">Home</Link> › <Link to="/programs">Programs</Link> ›{" "}
        <span>{title}</span>
      </div>

      {/* Program Details */}
      <div className="program-content-wrapper">
        <div className="program-detail-container">
          <div className="program-media">
            <img
              src={getImageSrc()}
              alt={title}
              className="program-media-image"
            />
            <div className="program-status-badge">{status}</div>
            <div className="program-category-pill">{category}</div>
          </div>

          <div className="program-detail-content">
            <h1 className="program-title">{title}</h1>
            <p className="program-ngo">{ngoName}</p>

            {/* About */}
            <div className="section-heading">About This Program</div>
            <p className="program-description">{description}</p>

            {/* Two-column: Details and Progress */}
            <div className="program-info-grid">
              {/* Program Details */}
              <div>
                <div className="section-heading">Program Details</div>
                <div className="program-meta-grid">
                  <div className="meta-card">
                    <div className="meta-label">Duration</div>
                    <div className="meta-value">{startDate} to {endDate}</div>
                  </div>
                  <div className="meta-card">
                    <div className="meta-label">Location</div>
                    <div className="meta-value">{location}</div>
                  </div>
                  <div className="meta-card">
                    <div className="meta-label">People Helped</div>
                    <div className="meta-value">{peopleHelped} beneficiaries</div>
                  </div>
                </div>
              </div>

              {/* Collection Progress */}
              <div>
                <div className="section-heading">Collection Progress</div>
                <div className="program-progress">
                  <div className="progress-header">
                    <span>Collection Progress</span>
                    <span>{percent}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${percent}%` }} />
                  </div>
                  <div className="progress-subtext">{collectedItems} of {targetItems || 0} items collected</div>
                </div>

                <div className="progress-stats">
                  <div className="progress-stat">
                    <div className="progress-stat-value">{collectedItems}</div>
                    <div className="progress-stat-label">Items Collected</div>
                  </div>
                  <div className="progress-stat">
                    <div className="progress-stat-value target">{targetItems || 0}</div>
                    <div className="progress-stat-label">Target Items</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Goals and Objectives */}
            <div className="program-extra-grid">
              <div className="extra-card">
                <div className="extra-title">Program Goal</div>
                <div className="extra-body">{programGoal}</div>
              </div>
              <div className="extra-card">
                <div className="extra-title">Program Objective</div>
                <div className="extra-body">{programObjective}</div>
              </div>
              <div className="extra-card">
                <div className="extra-title">Team Lead</div>
                <div className="extra-body">
                  <div><strong>Name:</strong> {teamMemberName}</div>
                  <div><strong>Role:</strong> {teamMemberRole}</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="program-actions-grid">
              <button onClick={() => navigate('/venues')} className="donate-button primary">
                Shop to Support This Program
              </button>
              <button
                onClick={() => navigate('/donate', { state: { programId: donationProgramId } })}
                className="donate-button secondary"
              >
                Donate Clothes
              </button>
              <button onClick={() => navigate('/programs')} className="back-button">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default UserViewProgram;
