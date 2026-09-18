import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

// Protected Route Guard: restricts access to authenticated students
export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-royal-blue-900 animate-spin mb-3" />
        <span className="text-xs font-semibold text-slate-500">Checking credentials...</span>
      </div>
    );
  }

  // Redirect to login, storing the previous route location path
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // If an admin or mentor navigates directly to the student dashboard root, guide them to their workspace
  if (location.pathname === '/dashboard' || location.pathname === '/dashboard/') {
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (user?.role === 'mentor') {
      return <Navigate to="/mentor/dashboard" replace />;
    }
  }

  return <Outlet />;
};

// Public Route Guard: prevents authenticated users from visiting auth pages
export const PublicRoute: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-royal-blue-900 animate-spin mb-3" />
      </div>
    );
  }

  if (isAuthenticated) {
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (user?.role === 'mentor') {
      return <Navigate to="/mentor/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

// Admin Route Guard: restricts access to users with role 'admin'
export const AdminRoute: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-950 text-white">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-3" />
        <span className="text-xs font-semibold text-stone-400">Verifying Admin Access...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (user?.role !== 'admin') {
    if (user?.role === 'mentor') {
      return <Navigate to="/mentor/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

// Mentor Route Guard: restricts access to users with role 'mentor'
export const MentorRoute: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-950 text-white">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-3" />
        <span className="text-xs font-semibold text-stone-400">Verifying Mentor Access...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (user?.role !== 'mentor') {
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
