import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { formatDate } from '../../components/shared.jsx';
import { getHDAvatarUrl } from '../../lib/avatar.js';
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
  Filter,
  CheckCircle,
  X,
  Award,
  Sparkles,
  RotateCcw,
  Edit2,
  BadgeAlert
} from 'lucide-react';

const DEPARTMENTS = [
  { id: 'dept_1', name: 'Roads & Infrastructure', icon: '🛣️' },
  { id: 'dept_2', name: 'Water Supply Department', icon: '💧' },
  { id: 'dept_3', name: 'Electrical Department', icon: '💡' },
  { id: 'dept_4', name: 'Sanitation Department', icon: '🗑️' },
  { id: 'dept_5', name: 'Drainage & Sewage Department', icon: '🚰' }
];

const TAMIL_NADU_AREAS = [
  'Anna Nagar',
  'T. Nagar',
  'Adyar',
  'Velachery',
  'Mylapore',
  'Guindy',
  'Tambaram',
  'Chromepet',
  'Porur',
  'Egmore',
  'Nungambakkam',
  'Ashok Nagar',
  'KK Nagar',
  'Besant Nagar',
  'Vadapalani'
];

export default function AdminUsers() {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modal State for Granting Officer Permit
  const [selectedUserForPermit, setSelectedUserForPermit] = useState(null);
  const [permitForm, setPermitForm] = useState({
    departmentName: 'Roads & Infrastructure',
    area: 'Anna Nagar',
    badgeNumber: ''
  });
  const [submittingPermit, setSubmittingPermit] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.users || []);
    } catch (e) {
      console.error(e);
      addToast('Failed to load user directory', 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleOpenPermitModal(user) {
    setSelectedUserForPermit(user);
    setPermitForm({
      departmentName: user.department || 'Roads & Infrastructure',
      area: user.area || 'Anna Nagar',
      badgeNumber: user.badgeNumber || `FO-${Math.floor(100 + Math.random() * 900)}`
    });
  }

  async function handleGrantPermit(targetRole = 'officer', userTarget = null) {
    const targetUser = userTarget || selectedUserForPermit;
    if (!targetUser) return;
    setSubmittingPermit(true);

    try {
      const payload = {
        role: targetRole,
        departmentName: targetRole === 'officer' ? permitForm.departmentName : '',
        area: targetRole === 'officer' ? permitForm.area : '',
        badgeNumber: targetRole === 'officer' ? permitForm.badgeNumber : ''
      };

      const res = await api.put(`/admin/users/${targetUser._id || targetUser.id}/permit`, payload);

      addToast(
        targetRole === 'officer'
          ? `Granted Field Officer permit to ${targetUser.name}!`
          : `Revoked Officer permit for ${targetUser.name}. Account role reset to Citizen.`,
        'success'
      );

      setSelectedUserForPermit(null);
      await loadUsers(); // Refresh user directory instantly
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.error || 'Failed to update user permit', 'error');
    } finally {
      setSubmittingPermit(false);
    }
  }

  async function handleRevokePermit(user) {
    if (!window.confirm(`Are you sure you want to revoke Officer credentials for ${user.name}? This user will return to Citizen role.`)) {
      return;
    }
    await handleGrantPermit('citizen', user);
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
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">Users & Team Directory</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Real-time overview of registered citizens, officer credentials, and admin permits
          </p>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-100)', color: 'var(--primary-600)' }}>
            <Users size={22} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Total Registered</div>
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

      {/* Info Banner on Officer Permits */}
      <div
        className="card"
        style={{
          marginBottom: 24,
          background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.08) 0%, rgba(13, 148, 136, 0.08) 100%)',
          border: '1px solid rgba(2, 132, 199, 0.2)',
          padding: '16px 20px'
        }}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Sparkles size={24} style={{ color: 'var(--teal-600)', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--gray-900)' }}>
              Municipal Authorization Policy
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginTop: 2 }}>
              All new users sign up as <strong>Citizens</strong> by default. To assign someone as a <strong>Field Officer</strong>, click <em>Grant Officer Permit</em> below to select their ward & department.
            </div>
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
              placeholder="Search members by name, email, or phone..."
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="skeleton skeleton-card" style={{ height: 220 }} />
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="card empty-state" style={{ padding: 40 }}>
          <div className="empty-state-icon"><Users size={32} /></div>
          <div className="empty-state-title">No members found</div>
          <div className="empty-state-text">No user records matched your current search or filter query.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
          {filteredUsers.map(u => {
            const isOfficer = u.role === 'officer';
            const isAdmin = u.role === 'admin';
            const roleColor =
              isAdmin ? { bg: 'var(--error-50)', color: 'var(--error-600)', border: 'var(--error-200)' } :
              isOfficer ? { bg: 'var(--warning-50)', color: 'var(--warning-700)', border: 'var(--warning-200)' } :
              { bg: 'var(--teal-50)', color: 'var(--teal-700)', border: 'var(--teal-200)' };

            const avatarUrl = getHDAvatarUrl(u.avatar, u.email);

            return (
              <div
                key={u._id || u.id}
                className="card fade-in"
                style={{
                  padding: 18,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: isOfficer ? '2px solid var(--warning-400)' : '1px solid var(--gray-200)',
                  boxShadow: isOfficer ? 'var(--shadow-md)' : 'none',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
              >
                <div>
                  {/* Top Row: Avatar + Name + Role Badge */}
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={u.name}
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: 'var(--radius-full)',
                          objectFit: 'cover',
                          border: '2px solid var(--teal-400)',
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
                        width: 50,
                        height: 50,
                        borderRadius: 'var(--radius-full)',
                        background: isOfficer ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'var(--teal-500)',
                        color: 'white',
                        display: avatarUrl ? 'none' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '1.2rem',
                        flexShrink: 0
                      }}
                    >
                      {u.name?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || 'U'}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {u.name || 'User'}
                        </h3>
                      </div>

                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
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
                            textTransform: 'uppercase'
                          }}
                        >
                          {isOfficer ? '🛡️ Field Officer' : isAdmin ? '🏛️ Admin' : '👤 Citizen'}
                        </span>

                        {isOfficer && u.department && (
                          <span style={{ fontSize: '0.7rem', background: '#fef3c7', color: '#b45309', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>
                            {u.department}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Details List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.8rem', color: 'var(--gray-600)', marginBottom: 16 }}>
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
                      <span>Assigned Ward: <strong>{u.area || 'Anna Nagar'}</strong>, {u.district || u.city || 'Chennai'}</span>
                    </div>

                    {isOfficer && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--warning-700)' }}>
                        <Award size={14} />
                        <span>Badge ID: <strong>{u.badgeNumber || 'FO-101'}</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action Buttons for Admin Permit Assignment */}
                <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 12, marginTop: 4 }}>
                  {!isAdmin && (
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      {!isOfficer ? (
                        <button
                          onClick={() => handleOpenPermitModal(u)}
                          className="btn btn-teal btn-sm"
                          style={{ gap: 6, width: '100%', justifyContent: 'center' }}
                        >
                          <Shield size={14} />
                          <span>Grant Officer Permit</span>
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleOpenPermitModal(u)}
                            className="btn btn-secondary btn-sm"
                            style={{ gap: 4, flex: 1 }}
                          >
                            <Edit2 size={13} /> Edit Dept
                          </button>
                          <button
                            onClick={() => handleRevokePermit(u)}
                            className="btn btn-secondary btn-sm"
                            style={{ gap: 4, color: 'var(--error-600)', borderColor: 'var(--error-200)' }}
                            title="Downgrade back to Citizen"
                          >
                            <RotateCcw size={13} /> Revoke
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  <div style={{ fontSize: '0.725rem', color: 'var(--gray-400)', marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={12} /> Joined: {u.createdAt ? formatDate(u.createdAt) : 'Registered Member'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* GRANT OFFICER PERMIT MODAL */}
      {selectedUserForPermit && (
        <div
          className="fade-in"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
          onClick={() => setSelectedUserForPermit(null)}
        >
          <div
            className="card"
            style={{
              maxWidth: 480,
              width: '100%',
              padding: 24,
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-xl)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--gray-200)', paddingBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--gray-900)' }}>
                <Shield size={22} style={{ color: 'var(--teal-600)' }} /> Grant Field Officer Permit
              </h3>
              <button
                onClick={() => setSelectedUserForPermit(null)}
                style={{ background: 'none', border: 'none', color: 'var(--gray-500)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 20 }}>
              Promoting <strong>{selectedUserForPermit.name}</strong> (<em>{selectedUserForPermit.email}</em>) from Citizen to <strong>Field Officer</strong>.
            </p>

            <form onSubmit={(e) => { e.preventDefault(); handleGrantPermit('officer'); }}>
              {/* Assigned Department Dropdown */}
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label" htmlFor="permit-dept">Assigned Municipal Department <span style={{ color: 'var(--error-500)' }}>*</span></label>
                <select
                  id="permit-dept"
                  className="form-control"
                  value={permitForm.departmentName}
                  onChange={e => setPermitForm(prev => ({ ...prev, departmentName: e.target.value }))}
                  required
                >
                  {DEPARTMENTS.map(d => (
                    <option key={d.id} value={d.name}>{d.icon} {d.name}</option>
                  ))}
                </select>
              </div>

              {/* Assigned Jurisdiction Area */}
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label" htmlFor="permit-area">Assigned Jurisdiction Ward / Area</label>
                <select
                  id="permit-area"
                  className="form-control"
                  value={permitForm.area}
                  onChange={e => setPermitForm(prev => ({ ...prev, area: e.target.value }))}
                >
                  {TAMIL_NADU_AREAS.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              {/* Officer Badge ID */}
              <div className="form-group" style={{ marginBottom: 24 }}>
                <label className="form-label" htmlFor="permit-badge">Officer Badge / Credentials ID</label>
                <input
                  id="permit-badge"
                  type="text"
                  className="form-control"
                  placeholder="e.g. FO-2026-808"
                  value={permitForm.badgeNumber}
                  onChange={e => setPermitForm(prev => ({ ...prev, badgeNumber: e.target.value }))}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', borderTop: '1px solid var(--gray-200)', paddingTop: 16 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedUserForPermit(null)}
                  disabled={submittingPermit}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-teal"
                  disabled={submittingPermit}
                  style={{ gap: 6 }}
                >
                  <CheckCircle size={16} />
                  <span>{submittingPermit ? 'Granting...' : 'Grant Permit & Make Officer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
