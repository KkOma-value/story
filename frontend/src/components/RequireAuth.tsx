import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types';

interface Props {
  children: React.ReactNode;
  /** If provided, user must have this role */
  requiredRole?: UserRole;
}

/**
 * Route guard component.
 * Redirects unauthenticated users to /login.
 * Redirects users without required role to appropriate home.
 */
export const RequireAuth: React.FC<Props> = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to role-appropriate home
    const dest = user.role === 'admin' ? '/admin' : '/';
    return <Navigate to={dest} replace />;
  }

  return <>{children}</>;
};
