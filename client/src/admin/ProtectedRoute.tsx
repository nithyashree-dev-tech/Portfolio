import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ApiError, authService, clearAuthToken, getAuthToken } from '../services/api';

const ProtectedRoute = () => {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const verify = async () => {
      try {
        await authService.me();
        if (mounted) setAuthorized(true);
      } catch (authError) {
        if (authError instanceof ApiError && (authError.status === 401 || authError.status === 403)) {
          clearAuthToken();
          if (mounted) setAuthorized(false);
        } else if (mounted) {
          setError(authError instanceof Error ? authError.message : 'Unable to verify admin access.');
        }
      } finally {
        if (mounted) setChecking(false);
      }
    };
    void verify();
    return () => { mounted = false; };
  }, []);

  if (checking) return <div className="page container"><p className="muted">Checking admin access...</p></div>;
  if (error) return <div className="page container"><p className="form-feedback error">{error}</p><button type="button" className="button secondary" onClick={() => window.location.reload()}>Retry</button></div>;
  if (!authorized && !getAuthToken()) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  if (!authorized) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
};

export default ProtectedRoute;