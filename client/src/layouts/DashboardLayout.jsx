import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import api from '../services/api.js';
import { timeAgoSimple } from '../components/shared.jsx';
import { getHDAvatarUrl } from '../lib/avatar.js';
import {
  LayoutDashboard, FileText, MapPin, PlusCircle, Bell, LogOut,
  Menu, X, User, Settings, BarChart3, Users, Building2, AlertTriangle,
  Map, Flame, ClipboardList, CheckCheck, UserCheck
} from 'lucide-react';

const navigationByRole = {
  citizen: [
    { to: '/citizen', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { to: '/citizen/report', icon: PlusCircle, label: 'Report Issue' },
    { to: '/citizen/complaints', icon: FileText, label: 'My Complaints' },
    { to: '/citizen/map', icon: MapPin, label: 'Civic Map' },
  ],
  officer: [
    { to: '/officer', icon: LayoutDashboard, label: 'Field Dashboard', exact: true },
    { to: '/officer/complaints', icon: ClipboardList, label: 'Assigned Work Orders' },
    { to: '/officer/map', icon: MapPin, label: 'Field Route Map' },
  ],
  admin: [
    { to: '/admin', icon: LayoutDashboard, label: 'Command Center', exact: true },
    { to: '/admin/users', icon: Users, label: 'Users & Team' },
    { to: '/admin/complaints', icon: FileText, label: 'All Complaints' },
    { to: '/admin/map', icon: Map, label: 'Live Map' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/admin/departments', icon: Building2, label: 'Departments' },
    { to: '/admin/hotspots', icon: Flame, label: 'Hotspots' },
  ]
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const userRole = (user?.role || 'citizen').toLowerCase();
  const links = navigationByRole[userRole] || navigationByRole.citizen;
  const roleLabel = userRole === 'admin' ? 'Municipal Authority' : userRole === 'officer' ? 'Field Officer' : 'Citizen';

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (e) { /* silent */ }
  }

  async function markRead(id) {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) { /* silent */ }
  }

  async function markAllRead() {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) { /* silent */ }
  }

  function handleLogout() {
    logout();
    addToast('Logged out successfully', 'success');
    navigate('/');
  }

  function isActive(to, exact) {
    return exact ? location.pathname === to : location.pathname.startsWith(to);
  }

  const avatarDisplayUrl = getHDAvatarUrl(user?.avatar, user?.email);

  return (
    <div className="dashboard-layout">
      {sidebarOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9998 }} onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">CP</div>
          <div>
            <div className="sidebar-brand-text">CivicPulse</div>
            <div className="sidebar-brand-sub">AI Platform</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section">
            <div className="sidebar-section-title">{roleLabel}</div>
            {links.map(link => (
              <Link key={link.to} to={link.to} className={`sidebar-link ${isActive(link.to, link.exact) ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                <link.icon size={20} />
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div
            className="sidebar-user"
            onClick={() => {
              setSidebarOpen(false);
              const profilePath = userRole === 'admin' ? '/admin/profile' : userRole === 'officer' ? '/officer/profile' : '/citizen/profile';
              navigate(profilePath);
            }}
            title="View Profile Settings"
          >
            {avatarDisplayUrl ? (
              <img
                src={avatarDisplayUrl}
                alt={user?.name || 'User'}
                referrerPolicy="no-referrer"
                className="sidebar-avatar-img"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallback = e.target.parentElement?.querySelector('.sidebar-avatar');
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className="sidebar-avatar"
              style={{ display: avatarDisplayUrl ? 'none' : 'flex' }}
            >
              {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name" title={user?.name || 'User'}>
                {user?.name || 'User'}
              </div>
              <div className="sidebar-user-role">
                {user?.role || 'citizen'}
              </div>
            </div>
            <button
              className="sidebar-logout-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleLogout();
              }}
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <div className="top-header-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle Menu">
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          <div className="top-header-right">
            <div style={{ position: 'relative' }}>
              <button className="notification-bell" onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) loadNotifications(); }}>
                <Bell size={22} />
                {unreadCount > 0 && <span className="notification-badge-count">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </button>

              {notifOpen && (
                <div className="notification-dropdown">
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: 24, textAlign: 'center', color: 'var(--gray-500)', fontSize: '0.85rem' }}>
                        No notifications
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n._id}
                          onClick={() => markRead(n._id)}
                          style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid var(--gray-100)',
                            background: n.isRead ? 'transparent' : 'var(--primary-50)',
                            cursor: 'pointer',
                            transition: 'background 0.15s'
                          }}
                        >
                          <div style={{ fontWeight: n.isRead ? 500 : 700, fontSize: '0.85rem', color: 'var(--gray-900)' }}>{n.title}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)', marginTop: 2 }}>{n.message}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', marginTop: 4 }}>{timeAgoSimple(n.createdAt)}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div
              style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
              onClick={() => {
                const profilePath = userRole === 'admin' ? '/admin/profile' : userRole === 'officer' ? '/officer/profile' : '/citizen/profile';
                navigate(profilePath);
              }}
              title="View Profile"
            >
              {avatarDisplayUrl ? (
                <img
                  src={avatarDisplayUrl}
                  alt={user?.name || 'User'}
                  referrerPolicy="no-referrer"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid var(--teal-400)',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const fallback = e.target.parentElement?.querySelector('.header-avatar-fallback');
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className="header-avatar-fallback"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'var(--primary-600)',
                  color: 'white',
                  display: avatarDisplayUrl ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.9rem'
                }}
              >
                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--gray-800)' }}>
                {user?.name || 'User'}
              </span>
            </div>
          </div>
        </header>

        <div className="content-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
