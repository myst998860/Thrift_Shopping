import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/api';
import { FiSearch, FiPlus, FiMoreVertical, FiUser, FiMail, FiCalendar, FiShield, FiTrash2, FiEdit2, FiEye } from 'react-icons/fi';
import '../../styles/admin/UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeActionMenu, setActiveActionMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await userService.listUsers();
        setUsers(Array.isArray(response) ? response : []);
        setFilteredUsers(Array.isArray(response) ? response : []);
        setError(null);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again.');
        setUsers([]);
        setFilteredUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        (user.fullname && user.fullname.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.role && user.role.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveActionMenu(null);
      }
    };

    if (activeActionMenu !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeActionMenu]);

  const handleDeactivate = async (userId) => {
    try {
      await userService.changeUserStatus(userId, 'Inactive');
      setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, status: 'Inactive' } : u));
      setActiveActionMenu(null);
    } catch (error) {
      setError('Failed to deactivate user');
    }
  };

  const handleActivate = async (userId) => {
    try {
      await userService.changeUserStatus(userId, 'Active');
      setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, status: 'Active' } : u));
      setActiveActionMenu(null);
    } catch (error) {
      setError('Failed to activate user');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await userService.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.user_id !== userId));
      setActiveActionMenu(null);
    } catch (error) {
      setError('Failed to delete user');
    }
  };

  const StatusBadge = ({ status }) => (
    <span className={`status-badge-modern ${status === 'Active' ? 'active' : 'inactive'}`}>
      {status}
    </span>
  );

  if (loading) return (
    <div className="user-loading-state">
      <div className="loading-spinner"></div>
      <p>Fetching user directory...</p>
    </div>
  );

  return (
    <div className="user-management-modern">
      <div className="um-header">
        <div className="um-title-section">
          <h1>User Directory</h1>
          <p>Manage access levels and monitor platform contributors.</p>
        </div>
        <button className="um-add-btn" onClick={() => navigate('/admin/users/new')}>
          <FiPlus /> New User
        </button>
      </div>

      <div className="um-controls">
        <div className="um-search">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, email or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="um-stats">
          Total Users: <strong>{filteredUsers.length}</strong>
        </div>
      </div>

      {error && <div className="um-error-banner">{error}</div>}

      <div className="user-cards-grid">
        {filteredUsers.length === 0 ? (
          <div className="um-empty-state">
            <FiUser size={48} />
            <p>No users found matching your search.</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.user_id} className="user-card-modern">
              <div className="card-top">
                <div className="user-avatar-circle">
                  {user.fullname ? user.fullname.charAt(0).toUpperCase() : <FiUser />}
                </div>
                <div className="user-actions-container">
                  <button
                    className="user-more-btn"
                    onClick={() => setActiveActionMenu(activeActionMenu === user.user_id ? null : user.user_id)}
                  >
                    <FiMoreVertical />
                  </button>
                  {activeActionMenu === user.user_id && (
                    <div className="context-menu-modern" ref={menuRef}>
                      <button onClick={() => navigate(`/admin/users/${user.user_id}`)}>
                        <FiEye /> View Details
                      </button>
                      <button onClick={() => navigate(`/admin/users/edit/${user.user_id}`)}>
                        <FiEdit2 /> Edit Profile
                      </button>
                      {user.status === 'Active' ? (
                        <button onClick={() => handleDeactivate(user.user_id)}>
                          <FiShield /> Deactivate
                        </button>
                      ) : (
                        <button onClick={() => handleActivate(user.user_id)} className="activate-item">
                          <FiShield /> Activate
                        </button>
                      )}
                      <button onClick={() => handleDelete(user.user_id)} className="delete-item">
                        <FiTrash2 /> Delete User
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="card-body">
                <h3 className="user-full-name">{user.fullname || 'Anonymous User'}</h3>
                <div className="user-id-badge">ID: #{user.user_id}</div>

                <div className="user-meta-info">
                  <div className="meta-line">
                    <FiMail /> <span>{user.email}</span>
                  </div>
                  <div className="meta-line">
                    <FiShield /> <span className="role-tag">{user.role || 'User'}</span>
                  </div>
                  <div className="meta-line">
                    <FiCalendar />
                    <span>Joined {user.joinDate ? new Date(user.joinDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="card-footer">
                <StatusBadge status={user.status} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserManagement;
