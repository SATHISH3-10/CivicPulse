import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import { StatusBadge, PriorityBadge, formatDate, CATEGORIES } from '../../components/shared.jsx';
import { Search, Filter } from 'lucide-react';

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data.complaints);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const filtered = filter === 'all' ? complaints : filter === 'active' ? complaints.filter(c => c.status !== 'resolved') : complaints.filter(c => c.status === filter);

  return (
    <div className="fade-in">
      <h1 className="page-title">My Complaints</h1>
      <p className="page-subtitle">All your reported civic issues</p>

      <div className="filters-bar">
        {['all', 'active', 'submitted', 'in_progress', 'awaiting_verification', 'resolved'].map(f => (
          <button key={f} className={`filter-chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f === 'active' ? 'Active' : f.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {loading ? (
        <div>{[1,2,3].map(i => <div key={i} className="skeleton skeleton-card" style={{ marginBottom: 12 }} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">No complaints found</div>
          <div className="empty-state-text">Try changing the filter or report a new issue.</div>
          <Link to="/citizen/report" className="btn btn-teal mt-4">Report Issue</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(c => (
            <Link key={c._id} to={`/citizen/complaints/${c.complaintId}`} className="complaint-card" style={{ textDecoration: 'none' }}>
              <div className="complaint-card-header">
                <span className="complaint-card-id">{c.complaintId}</span>
                <PriorityBadge priority={c.priority} />
              </div>
              <div className="complaint-card-title">{c.title}</div>
              <div style={{ marginBottom: 8 }}><StatusBadge status={c.status} /></div>
              <div className="complaint-card-meta">
                <span>📍 {c.address || 'Location tagged'}</span>
                <span>🏢 {c.departmentId?.name || 'Pending'}</span>
                <span>📅 {formatDate(c.createdAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
