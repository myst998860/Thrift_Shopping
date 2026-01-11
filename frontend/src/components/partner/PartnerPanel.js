// import React, { useState } from 'react';
// import { Link, Outlet, useLocation } from 'react-router-dom';
// import { 
//   FiHome, 
//   FiMapPin, 
//   FiCalendar,
//   FiGift,
//   FiBell,
//   FiUser,
//   FiLogOut
// } from 'react-icons/fi';
// import '../../styles/admin/AdminPanel.css';
// import { authService } from '../../services/api';
// import { useNavigate } from 'react-router-dom';

// const PartnerPanel = () => {
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const location = useLocation();
//    const navigate = useNavigate();

//   const navItems = [
//     { path: '/partner/dashboard', icon: <FiHome />, label: 'Dashboard' },
//     { path: '/partner/bookings', icon: <FiCalendar />, label: 'Pickups' },
//     { path: '/partner/program', icon: <FiMapPin />, label: 'Programs' },
//     { path: '/partner/donations', icon: <FiGift />, label: 'Donations' },
//     { path: '/partner/notifications', icon: <FiBell />, label: 'Notifications' },
//     { path: '/partner/profile', icon: <FiUser />, label: 'Profile' },
//   ];

//     const handleLogout = () => {
//     authService.logout(); 
//     navigate("/login");  
//   };

//   return (
//     <div className="admin-container">
//       {/* Sidebar */}
//       <div className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
//         <div className="sidebar-header">
//           <h1>Partner Panel</h1>
//           <button 
//             className="mobile-menu-button"
//             onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//           >
//             {mobileMenuOpen ? '✕' : '☰'}
//           </button>
//         </div>

//         <nav className="sidebar-nav">
//           {navItems.map((item) => (
//             <Link 
//               to={item.path} 
//               key={item.path}
//               className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
//               onClick={() => setMobileMenuOpen(false)}
//             >
//               <span className="sidebar-icon">{item.icon}</span>
//               <span className="sidebar-label">{item.label}</span>
//             </Link>
//           ))}
//         </nav>

//         <div className="sidebar-footer">
//           <button className="sidebar-item logout-button">
//             <span className="sidebar-icon"><FiLogOut /></span>
//              <span onClick={handleLogout} className="sidebar-label">Logout</span>
//           </button>
//         </div>
//       </div>

//       {/* Main Content */}
//       <main className="main-content">
//         <div className="content-header">
//           <h2> NGO Dashboard</h2>
//         </div>
//         <div className="content-body">
//           <Outlet />
//         </div>
//       </main>
//     </div>
//   );
// };

// export default PartnerPanel; 

import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiMapPin,
  FiCalendar,
  FiGift,
  FiBell,
  FiUser,
  FiLogOut,
} from "react-icons/fi";
import "../../styles/admin/AdminPanel.css";
import { useUserSession } from "../../context/UserSessionContext"; // use context
import { donationAPI } from "../../services/api"; // Added for counts
import { useEffect } from "react"; // Added

const PartnerPanel = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useUserSession(); // get logout from context
  const [counts, setCounts] = useState({ pending: 0, confirmed: 0 });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const data = await donationAPI.getDonationCounts();
        setCounts(data);
      } catch (err) {
        console.error("Error fetching donation counts:", err);
      }
    };
    fetchCounts();
    // Refresh every 30 seconds
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { path: "/partner/dashboard", icon: <FiHome />, label: "Dashboard" },
    { path: "/partner/bookings", icon: <FiCalendar />, label: "Pickups" },
    { path: "/partner/programs", icon: <FiMapPin />, label: "Programs" },
    { path: "/partner/donations", icon: <FiGift />, label: "Donations" },
    { path: "/partner/notifications", icon: <FiBell />, label: "Notifications" },
    { path: "/partner/profile", icon: <FiUser />, label: "Profile" },
  ];

  const handleLogout = () => {
    logout();          // clears user and tokens from context/localStorage
    navigate("/login"); // redirect to login page
  };

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <div className={`sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-header">
          <h1>Partner Panel</h1>
          <button
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              to={item.path}
              key={item.path}
              className={`sidebar-item ${location.pathname === item.path ? "active" : ""
                }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
              {item.label === "Donations" && (
                <div className="badge-container">
                  {counts.pending > 0 && (
                    <span className="badge pending-badge" title="Pending Donations">
                      {counts.pending}
                    </span>
                  )}
                  {counts.confirmed > 0 && (
                    <span className="badge confirmed-badge" title="Confirmed Donations">
                      {counts.confirmed}
                    </span>
                  )}
                </div>
              )}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-item logout-button" onClick={handleLogout}>
            <span className="sidebar-icon">
              <FiLogOut />
            </span>
            <span className="sidebar-label">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-header">
          <h2>NGO Dashboard</h2>
        </div>
        <div className="content-body">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default PartnerPanel;
