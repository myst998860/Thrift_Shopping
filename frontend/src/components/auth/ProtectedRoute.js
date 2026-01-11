import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserSession } from '../../context/UserSessionContext';

/**
 * ProtectedRoute component that checks if user is authenticated
 * before allowing access to protected routes.
 * 
 * If user is not authenticated, redirects to login page with return URL.
 */
const ProtectedRoute = ({ children }) => {
  const { isUserLoggedIn, loading } = useUserSession();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="auth-loading-container">
        <div className="auth-loading-spinner"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  // If not logged in, redirect to login with return URL
  if (!isUserLoggedIn) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname + location.search }}
        replace 
      />
    );
  }

  // If logged in, render the protected content
  return children;
};

export default ProtectedRoute;
