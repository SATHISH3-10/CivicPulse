import { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import api from '../services/api.js';
import { useEffect } from 'react';
import { timeAgoSimple } from '../components/shared.jsx';
import {
  LayoutDashboard, FileText, MapPin, PlusCircle, Bell, LogOut,
  Menu, X, User, Settings, BarChart3, Users, Building2, AlertTriangle,
  Map, Flame, ClipboardList
} from 'lucide-react';

const citizenLinks = [
  { to: '/citizen', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/citizen/report', icon: PlusCircle, label: 'Report Issue' },
  { to: '/citizen/complaints', icon: FileText, label: 'My Complaints' },
  { to: '/citizen/map', icon: MapPin, label: 'Civic Map' },
];

const officerLinks = [
  { to: '/officer', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/officer/complaints', icon: ClipboardList, label: 'Assigned Tasks' },
];

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Command Center', exact: true },
  { to: '/admin/users', icon: Users, label: 'Users & Team' },
  { to: '/admin/complaints', icon: FileText, label: 'All Complaints' },
  { to: '/admin/map', icon: Map, label: 'Live Map' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/departments', icon: Building2, label: 'Departments' },
  { to: '/admin/hotspots', icon: Flame, label: 'Hotspots' },
];

function getHDAvatarUrl(url) {
  if (!url || typeof url !== 'string') return '';
  if (url.includes('googleusercontent.com')) {
    if (url.includes('=s')) {
      return url.replace(/=s\d+(-c)?/g, '=s400-c');
    }
    return url + '=s400-c';
  }
  return url;
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const links = user?.role === 'admin' ? adminLinks : user?.role === 'officer' ? officerLinks : citizenLinks;
  const roleLabel = user?.role === 'admin' ? 'Municipal Authority' : user?.role === 'officer' ? 'Field Officer' : 'Citizen';

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
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
              const profilePath = user?.role === 'admin' ? '/admin/profile' : user?.role === 'officer' ? '/officer/profile' : '/citizen/profile';
              navigate(profilePath);
            }}
            title="View Profile Settings"
          >
            {user?.avatar ? (
              <img
                src={getHDAvatarUrl(user.avatar)}
                alt={user?.name || 'User'}
                referrerPolicy="no-referrer"
                className="sidebar-avatar-img"
                onError={(e) => {
                  if (e.target.src !== user.avatar && user.avatar) {
                    e.target.src = user.avatar;
                  } else {
                    e.target.style.display = 'none';
                    const fallback = e.target.parentElement?.querySelector('.sidebar-avatar');
                    if (fallback) fallback.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <div
              className="sidebar-avatar"
              style={{ display: user?.avatar ? 'none' : 'flex' }}
            >
              {user?.name?.[0]?.toUpperCase() || 'U'}
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
            {/* Language Toggle */}
            <LanguageToggleButton />

            <div style={{ position: 'relative' }}>
              <button className="notification-bell" onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) loadNotifications(); }}>
                <Bell size={22} />
                {unreadCount > 0 && <span className="notification-badge-count">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </button>

              {notifOpen && (
                <div className="notification-dropdown">
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Notifications</span>
                    {unreadCount > 0 && <button className="btn btn-ghost btn-sm" onClick={markAllRead}>Mark all read</button>}
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--gray-400)', fontSize: '0.875rem' }}>No notifications</div>
                  ) : (
                    notifications.slice(0, 10).map(n => (
                      <div
                        key={n._id}
                        className={`notification-item ${!n.isRead ? 'unread' : ''}`}
                        onClick={() => {
                          markRead(n._id);
                          setNotifOpen(false);
                          if (n.complaintId) {
                            const targetId = typeof n.complaintId === 'object' ? (n.complaintId.complaintId || n.complaintId._id) : n.complaintId;
                            const path = user?.role === 'officer' ? `/officer/complaints/${targetId}` : user?.role === 'admin' ? `/admin/complaints` : `/citizen/complaints/${targetId}`;
                            navigate(path);
                          }
                        }}
                      >
                        <div className="notification-icon-wrap" style={{ background: n.isRead ? 'var(--gray-100)' : 'var(--primary-100)' }}>
                          <Bell size={16} style={{ color: n.isRead ? 'var(--gray-400)' : 'var(--primary-500)' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div className="notification-text">{n.message}</div>
                          <div className="notification-time">{timeAgoSimple(n.createdAt)}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function LanguageToggleButton() {
  const { lang, toggleLanguage } = useLanguage();
  return (
    <button
      onClick={() => toggleLanguage()}
      className="btn btn-secondary btn-sm"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        fontWeight: 700,
        fontSize: '0.8rem',
        borderRadius: 'var(--radius-full)'
      }}
      title="Toggle Language"
    >
      <span style={{ color: lang === 'en' ? 'var(--primary-600)' : 'var(--gray-400)' }}>EN</span>
      <span style={{ color: 'var(--gray-300)' }}>|</span>
      <span style={{ color: lang === 'ta' ? 'var(--teal-600)' : 'var(--gray-400)' }}>தமிழ்</span>
    </button>
  );
}
