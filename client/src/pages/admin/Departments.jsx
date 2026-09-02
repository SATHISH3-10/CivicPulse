import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { Building2, TrendingUp, Clock, AlertTriangle, Star } from 'lucide-react';

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const res = await api.get('/admin/departments');
      setDepartments(res.data.departments);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  if (loading) return <div>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 150, marginBottom: 12 }} />)}</div>;

  return (
    <div className="fade-in">
      <h1 className="page-title">Department Performance</h1>
      <p className="page-subtitle">Monitor resolution rates and efficiency across departments</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {departments.map(d => (
          <div key={d._id} className="card" style={{ borderTop: `4px solid ${d.resolutionRate >= 90 ? 'var(--success-500)' : d.resolutionRate >= 75 ? 'var(--warning-500)' : 'var(--error-500)'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 28 }}>{d.icon || '🏢'}</div>
              <div>
                <h4 style={{ fontSize: '1rem', marginBottom: 2 }}>{d.name}</h4>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Head: {d.head || 'N/A'}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div style={{ textAlign: 'center', padding: 12, background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: d.resolutionRate >= 90 ? 'var(--success-600)' : d.resolutionRate >= 75 ? 'var(--warning-600)' : 'var(--error-600)' }}>
                  {d.resolutionRate}%
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)' }}>Resolution Rate</div>
              </div>
              <div style={{ textAlign: 'center', padding: 12, background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-600)' }}>{d.avgResolutionHours}h</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)' }}>Avg Resolution</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--gray-600)' }}>
              <span>Total: <strong>{d.totalComplaints}</strong></span>
              <span>Active: <strong>{d.active}</strong></span>
              <span style={{ color: 'var(--error-600)' }}>Breached: <strong>{d.slaBreached}</strong></span>
              <span>⭐ {d.avgSatisfaction}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
