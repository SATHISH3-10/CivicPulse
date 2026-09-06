import { Navigate } from 'react-router-dom';
import { useAuth, getRoleDashboard } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children, roles, allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth();

  const requiredRoles = allowedRoles || roles;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="skeleton" style={{ width: 200, height: 24 }}></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && Array.isArray(requiredRoles) && !requiredRoles.includes(user.role)) {
    const authorizedDashboard = getRoleDashboard(user.role);
    return <Navigate to={authorizedDashboard} replace />;
  }

  return children;
}
