import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  LayoutDashboard, PlusCircle, FileText, MapPin, User,
  ClipboardList, BarChart3, Map, Building2, Flame, Users
} from 'lucide-react';

const mobileNavByRole = {
  citizen: [
    { to: '/citizen', icon: LayoutDashboard, label: 'Home', exact: true },
    { to: '/citizen/complaints', icon: FileText, label: 'Requests' },
    { to: '/citizen/report', icon: PlusCircle, label: 'Report', isAction: true },
    { to: '/citizen/map', icon: MapPin, label: 'Live Map' },
    { to: '/citizen/profile', icon: User, label: 'Profile' },
  ],
  officer: [
    { to: '/officer', icon: LayoutDashboard, label: 'Home', exact: true },
    { to: '/officer/complaints', icon: ClipboardList, label: 'Orders' },
    { to: '/officer/map', icon: MapPin, label: 'Route Map' },
    { to: '/officer/profile', icon: User, label: 'Profile' },
  ],
  admin: [
    { to: '/admin', icon: LayoutDashboard, label: 'Command', exact: true },
    { to: '/admin/complaints', icon: FileText, label: 'Complaints' },
    { to: '/admin/map', icon: Map, label: 'Map' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/admin/profile', icon: User, label: 'Profile' },
  ]
};

export default function MobileBottomNav() {
  const { user } = useAuth();
  const location = useLocation();
  const userRole = (user?.role || 'citizen').toLowerCase();
  const items = mobileNavByRole[userRole] || mobileNavByRole.citizen;

  function isActive(to, exact) {
    return exact ? location.pathname === to : location.pathname.startsWith(to);
  }

  return (
    <nav className="mobile-bottom-nav">
      <div className="mobile-bottom-nav-container">
        {items.map((item) => {
          const active = isActive(item.to, item.exact);
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <Link
                key={item.to}
                to={item.to}
                className="mobile-nav-action-btn"
                aria-label={item.label}
              >
                <div className="mobile-nav-action-icon">
                  <Icon size={24} />
                </div>
                <span className="mobile-nav-label">{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`mobile-nav-item ${active ? 'active' : ''}`}
            >
              <Icon size={20} className="mobile-nav-icon" />
              <span className="mobile-nav-label">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
