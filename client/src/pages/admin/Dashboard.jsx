import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import { StatusBadge, PriorityBadge, formatDate, timeAgo } from '../../components/shared.jsx';
import { FileText, AlertTriangle, Clock, CheckCircle, BarChart3, Flame, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const res = await api.get('/admin/analytics');
      setAnalytics(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  if (loading) return <div style={{ padding: 40 }}>{[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 100, marginBottom: 16 }} />)}</div>;

  const s = analytics?.stats || {};

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.75rem' }}>CivicPulse Command Center</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>What's happening in the city right now</p>
        </div>
        <Link to="/admin/map" className="btn btn-teal">🗺️ Live Map</Link>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-100)', color: 'var(--primary-600)' }}><FileText size={22} /></div>
          <div className="stat-info"><div className="stat-label">Total Complaints</div><div className="stat-value">{s.total || 0}</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--warning-100)', color: 'var(--warning-600)' }}><Clock size={22} /></div>
          <div className="stat-info"><div className="stat-label">Active</div><div className="stat-value">{s.active || 0}</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-100)', color: 'var(--success-600)' }}><CheckCircle size={22} /></div>
          <div className="stat-info"><div className="stat-label">Resolved</div><div className="stat-value">{s.resolved || 0}</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--error-100)', color: 'var(--error-600)' }}><AlertTriangle size={22} /></div>
          <div className="stat-info"><div className="stat-label">SLA Breached</div><div className="stat-value">{s.slaBreached || 0}</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FEE2E2', color: '#DC2626' }}><Flame size={22} /></div>
          <div className="stat-info"><div className="stat-label">Critical</div><div className="stat-value">{s.critical || 0}</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--teal-100)', color: 'var(--teal-700)' }}><BarChart3 size={22} /></div>
          <div className="stat-info"><div className="stat-label">Avg Resolution</div><div className="stat-value">{s.avgResolutionHours || 0}h</div></div>
        </div>
      </div>

      <div className="grid-2col-responsive" style={{ marginBottom: 20 }}>
        {/* Resolution Rate */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Resolution Rate</h3></div>
          <div style={{ textAlign: 'center', padding: 20 }}>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--success-600)' }}>{s.resolutionRate || 0}%</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>Citizen Satisfaction: {s.avgSatisfaction || 0} ⭐</div>
          </div>
        </div>

        {/* Resolved Today */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Today's Activity</h3></div>
          <div style={{ textAlign: 'center', padding: 20 }}>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--primary-600)' }}>{s.resolvedToday || 0}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>Issues resolved today</div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><h3 className="card-title">Complaints by Category</h3></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          {Object.entries(analytics?.byCategory || {}).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
            <div key={cat} style={{ padding: 16, background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-700)' }}>{count}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 500 }}>{cat}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Escalations */}
      <div className="card">
        <div className="card-header"><h3 className="card-title">Recent Escalations</h3></div>
        {(analytics?.escalated || []).length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--gray-400)' }}>No escalations</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(analytics?.escalated || []).slice(0, 5).map(c => (
              <Link key={c._id} to={`/admin/complaints`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'var(--error-50)', borderRadius: 'var(--radius-md)', textDecoration: 'none' }}>
                <AlertTriangle size={18} style={{ color: 'var(--error-500)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--gray-800)' }}>{c.complaintId} — {c.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--error-600)' }}>SLA breached • {c.priority} • {c.category}</div>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{timeAgo(c.updatedAt)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
