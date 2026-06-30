import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

/**
 * Redirects unauthenticated users to the sign-in page.
 */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-screen__spinner" />
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/sign-in" replace />;
}
