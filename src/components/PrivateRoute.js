// src/components/PrivateRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  // If not authenticated, redirect to login and preserve location
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Else, render the protected content
  return children;
};

export default PrivateRoute;
