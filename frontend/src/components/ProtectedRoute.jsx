import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check if user is authenticated
  const auth = localStorage.getItem('cafe_auth');
  
  if (!auth) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  try {
    const authData = JSON.parse(auth);
    if (!authData.isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
  } catch (error) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;