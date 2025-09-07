import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Customer Pages
import CustomerDashboard from '../pages/customer/Dashboard';
import TicketForm from '../pages/customer/TicketForm';

// Agent Pages
import AgentDashboard from '../pages/agent/Dashboard';
import TicketReview from '../pages/agent/TicketReview';

// Admin Pages
import AdminDashboard from '../pages/admin/Dashboard';
import SLAConfig from '../pages/admin/SLAConfig';
import KBManager from '../pages/admin/KBManager';
import AuditLogs from '../pages/admin/AuditLogs';
import UserManager from '../pages/admin/UserManager';

// Shared Components
import Profile from '../components/Profile';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { authenticated, user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Public Route Component (redirect if already authenticated)
const PublicRoute = ({ children }) => {
  const { authenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return !authenticated ? children : <Navigate to="/dashboard" replace />;
};

// Role-based Dashboard Router
const DashboardRouter = () => {
  const { user } = useAuth();
  
  switch (user?.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'agent':
      return <AgentDashboard />;
    case 'customer':
      return <CustomerDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } 
      />
      
      {/* Protected Routes - Dashboard */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardRouter />
          </ProtectedRoute>
        } 
      />
      
      {/* Customer Routes */}
      <Route 
        path="/customer/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/customer/tickets" 
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/customer/create-ticket" 
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <TicketForm />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/customer/create" 
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <TicketForm />
          </ProtectedRoute>
        } 
      />
      
      {/* Agent Routes */}
      <Route 
        path="/agent/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['agent']}>
            <AgentDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/agent/tickets" 
        element={
          <ProtectedRoute allowedRoles={['agent']}>
            <AgentDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/agent/tickets/:ticketId" 
        element={
          <ProtectedRoute allowedRoles={['agent']}>
            <TicketReview />
          </ProtectedRoute>
        } 
      />
      
      {/* Admin Routes */}
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/analytics" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/users" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UserManager />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/sla" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <SLAConfig />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/kb" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <KBManager />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/audit" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AuditLogs />
          </ProtectedRoute>
        } 
      />
      
      {/* Profile Route - Available to all authenticated users */}
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      
      {/* Default Route */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* 404 Route */}
      <Route path="*" element={<div>Page Not Found</div>} />
    </Routes>
  );
};

export default AppRoutes;