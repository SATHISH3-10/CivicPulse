import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, getRoleDashboard } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children, roles, allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  const requiredRoles = allowedRoles || roles;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="skeleton" style={{ width: 200, height: 24 }}></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user profile is not completed yet, force completion page
  if (user && user.profileCompleted === false && location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" state={{ from: location }} replace />;
  }

  const userRole = (user?.role || 'citizen').toLowerCase();

  if (requiredRoles && Array.isArray(requiredRoles) && !requiredRoles.includes(userRole)) {
    const authorizedDashboard = getRoleDashboard(userRole);
    return <Navigate to={authorizedDashboard} replace />;
  }

  return children;
}
