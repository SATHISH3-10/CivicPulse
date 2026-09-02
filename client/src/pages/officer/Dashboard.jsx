import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import api from '../../services/api.js';
import { StatusBadge, PriorityBadge, formatDate, timeAgo } from '../../components/shared.jsx';
import {
  ClipboardList,
  Clock,
  AlertTriangle,
  CheckCircle,
  Wrench,
  MapPin,
  Building2,
  Check,
  Play,
  Navigation,
  Sparkles
} from 'lucide-react';

export default function OfficerDashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [stats, setStats] = useState({});
  const [assignedComplaints, setAssignedComplaints] = useState([]);
  const [borderComplaints, setBorderComplaints] = useState([]);
  const [officerInfo, setOfficerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('assigned'); // 'assigned' | 'border'
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [sRes, cRes] = await Promise.all([
        api.get('/officer/stats'),
        api.get('/officer/complaints')
      ]);
      setStats(sRes.data.stats || {});
      setAssignedComplaints(cRes.data.complaints || []);
      setBorderComplaints(cRes.data.borderComplaints || []);
      setOfficerInfo(cRes.data.officerInfo || null);
    } catch (e) {
      console.error(e);
      addToast('Failed to refresh officer dashboard', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleClaimComplaint(complaintId) {
    setActionLoadingId(complaintId);
    try {
      await api.put(`/officer/complaints/${complaintId}/claim`);
      addToast(`Complaint ${complaintId} claimed & accepted successfully!`, 'success');
      loadData();
      setActiveTab('assigned');
    } catch (e) {
      addToast(e.response?.data?.error || 'Failed to claim complaint', 'error');
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <div className="fade-in">
      {/* Officer Header with Border Jurisdiction Tag */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>Officer Dashboard</span>
            <span className="badge badge-teal" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
              Field Operations
            </span>
          </h1>
          <p className="page-subtitle" style={{ marginBottom: 8 }}>
            Welcome back, <strong>{user?.name}</strong>. Managing civic resolutions.
          </p>

          {/* Border Details Badge Bar */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: '0.85rem' }}>
            <span
              style={{
                background: 'var(--white)',
                border: '1px solid var(--gray-200)',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Building2 size={14} style={{ color: 'var(--primary-500)' }} />
              <strong>Department:</strong> {officerInfo?.department || user?.department || 'Roads & Infrastructure'}
            </span>

            <span
              style={{
                background: 'var(--white)',
                border: '1px solid var(--gray-200)',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <MapPin size={14} style={{ color: 'var(--teal-500)' }} />
              <strong>Patrol Border:</strong> {officerInfo?.area || user?.area || 'Anna Nagar'}, {officerInfo?.district || user?.district || 'Chennai'} ({officerInfo?.radiusKm || 8} km radius)
            </span>
          </div>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={loadData} disabled={loading}>
          🔄 Refresh Feed
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-100)', color: 'var(--primary-600)' }}>
            <ClipboardList size={22} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Assigned to Me</div>
            <div className="stat-value">{assignedComplaints.length}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--teal-100)', color: 'var(--teal-700)' }}>
            <Navigation size={22} />
          </div>
          <div className="stat-info">
            <div className="stat-label">In My Border</div>
            <div className="stat-value" style={{ color: 'var(--teal-600)' }}>
              {borderComplaints.length}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--warning-100)', color: 'var(--warning-600)' }}>
            <Wrench size={22} />
          </div>
          <div className="stat-info">
            <div className="stat-label">In Progress</div>
            <div className="stat-value">{stats.inProgress || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--error-100)', color: 'var(--error-600)' }}>
            <AlertTriangle size={22} />
          </div>
          <div className="stat-info">
            <div className="stat-label">SLA Breached</div>
            <div className="stat-value" style={{ color: 'var(--error-600)' }}>
              {stats.slaBreached || 0}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-100)', color: 'var(--success-600)' }}>
            <CheckCircle size={22} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Resolved</div>
            <div className="stat-value" style={{ color: 'var(--success-600)' }}>
              {stats.resolved || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabbed Complaint Management View */}
      <div className="card">
        {/* Tab Headers */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--gray-200)',
            marginBottom: 20,
            gap: 16
          }}
        >
          <button
            onClick={() => setActiveTab('assigned')}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'assigned' ? '3px solid var(--primary-500)' : '3px solid transparent',
              color: activeTab === 'assigned' ? 'var(--primary-600)' : 'var(--gray-500)',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <ClipboardList size={18} />
            <span>My Assigned Tasks</span>
            <span
              className="badge"
              style={{
                background: activeTab === 'assigned' ? 'var(--primary-100)' : 'var(--gray-100)',
                color: activeTab === 'assigned' ? 'var(--primary-700)' : 'var(--gray-600)'
              }}
            >
              {assignedComplaints.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('border')}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'border' ? '3px solid var(--teal-500)' : '3px solid transparent',
              color: activeTab === 'border' ? 'var(--teal-600)' : 'var(--gray-500)',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <MapPin size={18} />
            <span>Issues in My Border / Jurisdiction</span>
            <span
              className="badge"
              style={{
                background: activeTab === 'border' ? 'var(--teal-100)' : 'var(--gray-100)',
                color: activeTab === 'border' ? 'var(--teal-700)' : 'var(--gray-600)'
              }}
            >
              {borderComplaints.length}
            </span>
          </button>
        </div>

        {/* Tab 1: Assigned to this Officer */}
        {activeTab === 'assigned' && (
          <div>
            {loading ? (
              <div>{[1, 2, 3].map(i => <div key={i} className="skeleton skeleton-card" style={{ marginBottom: 12 }} />)}</div>
            ) : assignedComplaints.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><ClipboardList size={32} /></div>
                <div className="empty-state-title">No directly assigned tasks yet</div>
                <div className="empty-state-text">
                  Check the <strong>"Issues in My Border"</strong> tab to claim and start working on nearby reported complaints!
                </div>
                <button className="btn btn-teal mt-4" onClick={() => setActiveTab('border')}>
                  <MapPin size={16} /> View Border Issues ({borderComplaints.length})
                </button>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Issue Details</th>
                      <th>Location / Area</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>SLA Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignedComplaints.map(c => (
                      <tr key={c._id}>
                        <td style={{ fontWeight: 700, color: 'var(--primary-500)', fontSize: '0.825rem' }}>
                          {c.complaintId}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{c.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                            Reported by: {c.citizenId?.name || 'Citizen'} • {timeAgo(c.createdAt)}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <MapPin size={14} style={{ color: 'var(--teal-500)' }} />
                            <span>{c.address?.split(',').slice(0, 2).join(',') || c.area || 'Tagged Location'}</span>
                          </div>
                        </td>
                        <td><PriorityBadge priority={c.priority} /></td>
                        <td><StatusBadge status={c.status} /></td>
                        <td><SLAMini deadline={c.slaDeadline} /></td>
                        <td>
                          <Link to={`/officer/complaints/${c.complaintId}`} className="btn btn-primary btn-sm">
                            Manage & Resolve →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Border / Jurisdiction Complaints */}
        {activeTab === 'border' && (
          <div>
            <div
              style={{
                background: 'var(--teal-50)',
                border: '1px solid var(--teal-100)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                marginBottom: 16,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 8
              }}
            >
              <div style={{ fontSize: '0.85rem', color: 'var(--teal-800)' }}>
                📍 Showing live issues reported in <strong>{officerInfo?.area || user?.area || 'your area'}</strong> within your department jurisdiction.
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--teal-700)', fontWeight: 600 }}>
                {borderComplaints.length} unassigned / active issues found
              </span>
            </div>

            {loading ? (
              <div>{[1, 2, 3].map(i => <div key={i} className="skeleton skeleton-card" style={{ marginBottom: 12 }} />)}</div>
            ) : borderComplaints.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon" style={{ background: 'var(--teal-50)', color: 'var(--teal-600)' }}>
                  <CheckCircle size={32} />
                </div>
                <div className="empty-state-title">No pending issues in your border area!</div>
                <div className="empty-state-text">
                  Your patrol area ({officerInfo?.area || user?.area || 'Anna Nagar'}) is currently clear of pending {officerInfo?.department || 'department'} issues.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {borderComplaints.map(c => (
                  <div
                    key={c._id}
                    className="card"
                    style={{
                      padding: 18,
                      borderLeft: `4px solid ${
                        c.priority === 'P1'
                          ? 'var(--error-500)'
                          : c.priority === 'P2'
                          ? 'var(--warning-500)'
                          : 'var(--primary-500)'
                      }`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 260 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span style={{ fontWeight: 700, color: 'var(--primary-500)', fontSize: '0.85rem' }}>
                            {c.complaintId}
                          </span>
                          <PriorityBadge priority={c.priority} />
                          <StatusBadge status={c.status} />
                          {c.distanceKm !== undefined && (
                            <span className="badge badge-blue">
                              📍 {c.distanceKm} km away
                            </span>
                          )}
                        </div>

                        <h3 style={{ fontSize: '1.05rem', marginBottom: 6, fontWeight: 700 }}>
                          {c.title}
                        </h3>

                        <p style={{ color: 'var(--gray-600)', fontSize: '0.85rem', marginBottom: 10, lineHeight: 1.4 }}>
                          {c.description}
                        </p>

                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                          <span>📍 <strong>Location:</strong> {c.address || c.area || 'Border Area'}</span>
                          <span>🏢 <strong>Dept:</strong> {c.departmentId?.name || 'Assigned Dept'}</span>
                          <span>🕒 <strong>Reported:</strong> {timeAgo(c.createdAt)}</span>
                        </div>
                      </div>

                      {/* Claim and Detail Buttons */}
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <button
                          className="btn btn-teal btn-sm"
                          onClick={() => handleClaimComplaint(c.complaintId)}
                          disabled={actionLoadingId === c.complaintId}
                          style={{ gap: 6 }}
                        >
                          <Check size={16} />
                          {actionLoadingId === c.complaintId ? 'Claiming...' : 'Claim & Accept'}
                        </button>

                        <Link to={`/officer/complaints/${c.complaintId}`} className="btn btn-secondary btn-sm">
                          View Details →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SLAMini({ deadline }) {
  if (!deadline) return <span style={{ color: 'var(--gray-400)', fontSize: '0.75rem' }}>N/A</span>;
  const remaining = new Date(deadline) - new Date();
  const breached = remaining < 0;
  const hours = Math.abs(Math.floor(remaining / (1000 * 60 * 60)));
  const mins = Math.abs(Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60)));

  return (
    <span
      style={{
        fontSize: '0.75rem',
        fontWeight: 700,
        color: breached ? 'var(--error-600)' : hours < 6 ? 'var(--warning-600)' : 'var(--success-600)'
      }}
    >
      {breached ? `⚠️ Breached (-${hours}h)` : `⏱️ ${hours}h ${mins}m left`}
    </span>
  );
}
