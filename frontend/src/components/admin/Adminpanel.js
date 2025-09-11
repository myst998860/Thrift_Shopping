import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiBriefcase, 
  FiMapPin, 
  FiCalendar,
  FiBell,
  FiSettings,
  FiUser,
  FiLogOut
} from 'react-icons/fi';
import '../../styles/admin/AdminPanel.css';
import { authService } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useUserSession } from '../../context/UserSessionContext';


const AdminPanel = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
   const { user: currentUser, isUserLoggedIn } = useUserSession();
  const location = useLocation();
 const navigate = useNavigate();

  const navItems = [
    { path: '/admin/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { path: '/admin/users', icon: <FiUsers />, label: 'Users' },
    { path: '/admin/partners', icon: <FiBriefcase />, label: 'Partners' },
    { path: '/admin/venues', icon: <FiMapPin />, label: 'Venues' },
    { path: '/admin/bookings', icon: <FiCalendar />, label: 'Bookings' },
    { path: '/admin/notifications', icon: <FiBell />, label: 'Notifications' },
    { path: '/admin/settings', icon: <FiSettings />, label: 'Settings' },
   currentUser && {
  path: `/admin/profile/`,
  icon: <FiUser />,

  label: 'Profile',
}
  ].filter(Boolean);
  

  const handleLogout = () => {
    authService.logout(); 
    navigate("/login");  
  };

 const handleViewDetails = (user) => {
    if (!user?.user_id) {
      console.error('Invalid user ID:', user?.user_id);
      return;
    }
    console.log('Navigating to view user with ID:', user.user_id);
    navigate(`/admin/profile/${user.user_id}`);
  };

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <div className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <h1>Admin Panel</h1>
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
          <h2>Welcome to the Admin Dashboard</h2>
        </div>
        <div className="content-body">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;