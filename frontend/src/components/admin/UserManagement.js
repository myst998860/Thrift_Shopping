import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/api';
import '../../styles/admin/UserManagement.css';

const UserManagement = () => {
  // State declarations
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeActionMenu, setActiveActionMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Fetch users from API
  useEffect(() => {
   const fetchUsers = async () => {
  try {
    setLoading(true);
    const response = await userService.listUsers();
    console.log('Fetched users:', response);
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

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        (user.fullname && user.fullname.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  // Handle click outside action menu
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

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeActionMenu]);

  const handleActionClick = (user_id) => {
    setActiveActionMenu(activeActionMenu === user_id ? null : user_id);
  };

  const handleDeactivate = async (userId) => {
    try {
      await userService.changeUserStatus(userId, 'Inactive');
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.user_id === userId ? { ...user, status: 'Inactive' } : user
        )
      );
      setActiveActionMenu(null);
    } catch (error) {
      console.error('Error deactivating user:', error);
      setError('Failed to deactivate user');
    }
  };


  const handleActivate = async (user_id) => {
    try {
      await userService.changeUserStatus(user_id, 'Active');
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.user_id === user_id? { ...user, status: 'Active' } : user
        )
      );
      setActiveActionMenu(null);
    } catch (error) {
      console.error('Error activating user:', error);
      setError('Failed to activate user');
    }
  };

 const handleDelete = async (userId) => {
  console.log('Deleting userId:', userId);
  if (!window.confirm('Are you sure you want to delete this user?')) return;
  try {
    await userService.deleteUser(userId);
    setUsers((prevUsers) => prevUsers.filter((user) => user.user_id !== userId));
    setActiveActionMenu(null);
  } catch (error) {
    console.error('Error deleting user:', error);
    setError('Failed to delete user');
  }
};

  const handleViewDetails = (user) => {
    if (!user?.user_id) {
    console.error("Invalid user ID:", user?.user_id);
    return;
  }
  console.log("Navigating to view user with ID:", user.user_id);
  navigate(`/admin/users/${user.user_id}`);
  };

 const handleEditUser = (user) => {
  if (!user?.user_id) {
    console.error("Invalid user ID:", user?.user_id);
    return;
  }
  console.log("Navigating to edit user with ID:", user.user_id);
  navigate(`/admin/users/edit/${user.user_id}`);
};

  const StatusBadge = ({ status }) => {
    const statusClasses = `status-badge ${status === 'Active' ? 'status-active' : 'status-inactive'}`;
    return <span className={statusClasses}>{status}</span>;
  };

  if (loading) {
    return <div className="loading-message">Loading users...</div>;
  }

    return (
    <div className="user-management-container">
      <h1 className="title">User Management</h1>
      <p className="subtitle">Manage all registered users</p>
      
      <div className="header">
        <h2>All Users</h2>
        <button 
          className="add-user-btn"
          onClick={() => navigate('/admin/users/new')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New User
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Search users by name, partner, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="table-container">
        {filteredUsers.length === 0 ? (
          <div className="no-users-message">
            {searchTerm ? 'No matching users found' : 'No users available'}
          </div>
        ) : (
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Join Date</th>
                {/* <th>Bookings</th> */}
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.user_id}>
                  <td>{user.user_id}</td>
                  <td>{user.fullname}</td>
                  <td>{user.email}</td>
                   <td>{user.role}</td>
                <td>{user.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'N/A'}</td>

                
                  {/* <td>{user.bookings || 0}</td> */}
                  <td>
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="actions-cell">
                    <button 
                      onClick={() => handleActionClick(user.user_id)} 
                      className="actions-btn"
                      aria-label="User actions"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                    {activeActionMenu === user.user_id && (
                      <div className="actions-menu" ref={menuRef}>
                        <div className="actions-menu-header">Actions</div>
                        <div className="actions-menu-items">
                          <button 
                            onClick={() => {
                              setActiveActionMenu(null);
                              handleViewDetails(user);
                              console.log("clicked:",user)
                        
                            }} 
                            className="actions-menu-item"
                          >
                            View Details
                          </button>
                         <button 
                              onClick={() => {
                                setActiveActionMenu(null);
                                handleEditUser(user);
                                console.log("clicked:",user)
                              }} 
                              className="actions-menu-item"
                            >
                              Edit User
                          </button>
                          {user.status === 'Active' ? (
                            <button 
                              onClick={() => handleDeactivate(user.id)} 
                              className="actions-menu-item"
                            >
                              Deactivate User
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleActivate(user.id)} 
                              className="actions-menu-item actions-menu-item-activate"
                            >
                              Activate User
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(user.user_id)} 
                            className="actions-menu-item actions-menu-item-delete"
                          >
                            Delete User
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserManagement;