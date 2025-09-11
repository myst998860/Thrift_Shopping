import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiMapPin, 
  FiCalendar,
  FiBell,
  FiUser,
  FiLogOut
} from 'react-icons/fi';
import '../../styles/admin/AdminPanel.css';
import { authService } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const PartnerPanel = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
   const navigate = useNavigate();

  const navItems = [
    { path: '/partner/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { path: '/partner/bookings', icon: <FiCalendar />, label: 'Bookings' },
    { path: '/partner/venues', icon: <FiMapPin />, label: 'Venues' },
    { path: '/partner/notifications', icon: <FiBell />, label: 'Notifications' },
    { path: '/partner/profile', icon: <FiUser />, label: 'Profile' },
  ];

    const handleLogout = () => {
    authService.logout(); 
    navigate("/login");  
  };

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <div className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <h1>Partner Panel</h1>
          <button 
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link 
              to={item.path} 
              key={item.path}
              className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-item logout-button">
            <span className="sidebar-icon"><FiLogOut /></span>
             <span onClick={handleLogout} className="sidebar-label">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-header">
          <h2>Welcome to the Partner Dashboard</h2>
        </div>
        <div className="content-body">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default PartnerPanel; 