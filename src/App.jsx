import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/Layout/AppLayout.jsx';
import Login from './pages/auth/Login.jsx';
import Signup from './pages/auth/Signup.jsx';
import ResetPassword from './pages/auth/ResetPassword.jsx';
import Home from './pages/user/Home.jsx';
import NotePage from './pages/user/NotePage.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import { ProtectedRoute } from './components/Auth/ProtectedRoute.jsx';
import { AdminRoute } from './components/Auth/AdminRoute.jsx';
import ErrorBoundary from './components/Layout/ErrorBoundary.jsx';

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/signup" element={<Signup />} />
        <Route path="/auth/reset" element={<ResetPassword />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="note/:noteId" element={<NotePage />} />
          <Route
            path="admin"
            element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}
