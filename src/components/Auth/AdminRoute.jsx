import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider.jsx';

export function AdminRoute({ children }) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  if (role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}
