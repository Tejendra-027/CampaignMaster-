// src/components/PrivateRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAuth } from '../features/auth/authSlice';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, token } = useSelector(selectAuth);
  const location = useLocation();

  /* Fall back to localStorage only if the store is still “cold” */
  const hasToken = token || localStorage.getItem('token');

  if (!isAuthenticated && !hasToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;
