import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { formatDate, timeAgo } from '../../components/shared.jsx';
import {
  Users,
  Search,
  UserCheck,
  Shield,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  Filter
} from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.users || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Filter users based on search & role filter
  const filteredUsers = users.filter(u => {
    const matchesSearch =
      (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone || '').includes(searchTerm);

    const matchesRole =
      roleFilter === 'all' ||
      (roleFilter === 'citizen' && u.role === 'citizen') ||
      (roleFilter === 'officer' && u.role === 'officer') ||
      (roleFilter === 'admin' && u.role === 'admin');

    return matchesSearch && matchesRole;
  });

  const total = users.length;
  const citizensCount = users.filter(u => u.role === 'citizen').length;
  const officersCount = users.filter(u => u.role === 'officer').length;
  const adminsCount = users.filter(u => u.role === 'admin').length;

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">Users & Team Directory</h1>
        <p className="page-subtitle" style={{ marginBottom: 0 }}>
          Overview of all registered platform members, field officers, citizens, and municipal authorities
        </p>
      </div>

      {/* KPI Stats Bar */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-100)', color: 'var(--primary-600)' }}>
            <Users size={22} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{total}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--teal-100)', color: 'var(--teal-700)' }}>
            <User size={22} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Citizens</div>
            <div className="stat-value">{citizensCount}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--warning-100)', color: 'var(--warning-600)' }}>
            <UserCheck size={22} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Field Officers</div>
            <div className="stat-value">{officersCount}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-100)', color: 'var(--success-600)' }}>
            <Shield size={22} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Admins / Authorities</div>
            <div className="stat-value">{adminsCount}</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {/* Search Input */}
          <div className="search-input" style={{ flex: 1, minWidth: 260 }}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Search members by name, real email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Role Filter Chips */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              className={`filter-chip ${roleFilter === 'all' ? 'active' : ''}`}
              onClick={() => setRoleFilter('all')}
            >
              All Members ({total})
            </button>
            <button
              className={`filter-chip ${roleFilter === 'citizen' ? 'active' : ''}`}
              onClick={() => setRoleFilter('citizen')}
            >
              Citizens ({citizensCount})
            </button>
            <button
              className={`filter-chip ${roleFilter === 'officer' ? 'active' : ''}`}
              onClick={() => setRoleFilter('officer')}
            >
              Field Officers ({officersCount})
            </button>
            <button
              className={`filter-chip ${roleFilter === 'admin' ? 'active' : ''}`}
              onClick={() => setRoleFilter('admin')}
            >
              Admins ({adminsCount})
            </button>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="skeleton skeleton-card" style={{ height: 160 }} />
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="card empty-state" style={{ padding: 40 }}>
          <div className="empty-state-icon"><Users size={32} /></div>
          <div className="empty-state-title">No members found</div>
          <div className="empty-state-text">No user records matched your current search or filter query.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
          {filteredUsers.map(u => {
            const roleColor =
              u.role === 'admin' ? { bg: 'var(--error-50)', color: 'var(--error-600)', border: 'var(--error-200)' } :
              u.role === 'officer' ? { bg: 'var(--warning-50)', color: 'var(--warning-600)', border: 'var(--warning-200)' } :
              { bg: 'var(--teal-50)', color: 'var(--teal-700)', border: 'var(--teal-200)' };

            return (
              <div
                key={u._id}
                className="card fade-in"
                style={{
                  padding: 18,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: '1px solid var(--gray-200)',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
              >
                <div>
                  {/* Top Row: Avatar + Name + Role Badge */}
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
                    {u.avatar ? (
                      <img
                        src={u.avatar}
                        alt={u.name}
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 'var(--radius-full)',
                          objectFit: 'cover',
                          border: '2px solid var(--teal-300)',
                          flexShrink: 0
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const fallback = e.target.parentElement?.querySelector('.user-avatar-initial');
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}

                    <div
                      className="user-avatar-initial"
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--teal-500)',
                        color: 'white',
                        display: u.avatar ? 'none' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '1.2rem',
                        flexShrink: 0
                      }}
                    >
                      {u.name?.[0]?.toUpperCase() || 'U'}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {u.name || 'User'}
                        </h3>
                      </div>

                      <span
                        style={{
                          display: 'inline-block',
                          background: roleColor.bg,
                          color: roleColor.color,
                          border: `1px solid ${roleColor.border}`,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '1px 8px',
                          borderRadius: 'var(--radius-full)',
                          textTransform: 'uppercase',
                          marginTop: 4
                        }}
                      >
                        {u.role}
                      </span>
                    </div>
                  </div>

                  {/* Details List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.8rem', color: 'var(--gray-600)', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Mail size={14} style={{ color: 'var(--primary-600)', flexShrink: 0 }} />
                      <span style={{ fontWeight: 600, color: 'var(--gray-800)', wordBreak: 'break-all' }}>{u.email}</span>
                    </div>

                    {u.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Phone size={14} style={{ color: 'var(--teal-600)', flexShrink: 0 }} />
                        <span>{u.phone}</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <MapPin size={14} style={{ color: 'var(--warning-600)', flexShrink: 0 }} />
                      <span>{u.area || 'Anna Nagar'}, {u.district || u.city || 'Chennai'}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Join Date */}
                <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 8, fontSize: '0.725rem', color: 'var(--gray-400)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={12} /> Registered: {u.createdAt ? formatDate(u.createdAt) : 'Initial User'}
                  </span>
                  {u.supabaseUserId && (
                    <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>
                      Google Auth
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
