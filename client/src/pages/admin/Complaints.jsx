import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { StatusBadge, PriorityBadge, formatDate } from '../../components/shared.jsx';
import { Search, UserPlus } from 'lucide-react';

export default function AdminComplaints() {
  const { addToast } = useToast();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [assignModal, setAssignModal] = useState(null);
  const [officers, setOfficers] = useState([]);
  const [selectedOfficer, setSelectedOfficer] = useState('');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [cRes, oRes] = await Promise.all([
        api.get('/admin/complaints'),
        api.get('/admin/officers')
      ]);
      setComplaints(cRes.data.complaints);
      setOfficers(oRes.data.officers);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleAssign() {
    if (!selectedOfficer) { addToast('Select an officer', 'warning'); return; }
    try {
      await api.put(`/admin/complaints/${assignModal.complaintId}/assign`, { officerId: selectedOfficer });
      addToast('Complaint assigned successfully', 'success');
      setAssignModal(null);
      setSelectedOfficer('');
      loadData();
    } catch (e) { addToast('Assignment failed', 'error'); }
  }

  const filtered = complaints.filter(c => {
    if (filter !== 'all' && c.status !== filter) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.complaintId.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="fade-in">
      <h1 className="page-title">All Complaints</h1>
      <p className="page-subtitle">Manage and assign civic complaints</p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-input" style={{ flex: 1, minWidth: 200 }}>
          <Search size={18} />
          <input placeholder="Search complaints..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filters-bar" style={{ marginBottom: 0 }}>
          {['all', 'submitted', 'assigned', 'in_progress', 'awaiting_verification', 'resolved', 'escalated'].map(f => (
            <button key={f} className={`filter-chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead><tr><th>ID</th><th>Issue</th><th>Category</th><th>Priority</th><th>Status</th><th>Citizen</th><th>Officer</th><th>Date</th><th>Action</th></tr></thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c._id}>
                <td style={{ fontWeight: 600, color: 'var(--primary-500)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{c.complaintId}</td>
                <td style={{ maxWidth: 200 }}><div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div></td>
                <td style={{ fontSize: '0.8rem' }}>{c.category}</td>
                <td><PriorityBadge priority={c.priority} /></td>
                <td><StatusBadge status={c.status} /></td>
                <td style={{ fontSize: '0.8rem' }}>{c.citizenId?.name || '—'}</td>
                <td style={{ fontSize: '0.8rem' }}>{c.officerId?.name || <span style={{ color: 'var(--gray-400)' }}>Unassigned</span>}</td>
                <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{formatDate(c.createdAt)}</td>
                <td>
                  <button className="btn btn-primary btn-sm" onClick={() => { setAssignModal(c); setSelectedOfficer(c.officerId?._id || ''); }}>
                    <UserPlus size={14} /> Assign
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>No complaints found</div>}
      </div>

      {/* Assign Modal */}
      {assignModal && (
        <div className="modal-overlay" onClick={() => setAssignModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Assign Complaint</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setAssignModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: 16, fontSize: '0.875rem' }}>
                <strong>{assignModal.complaintId}</strong> — {assignModal.title}
              </p>
              <div className="form-group">
                <label className="form-label">Select Officer</label>
                <select className="form-select" value={selectedOfficer} onChange={e => setSelectedOfficer(e.target.value)}>
                  <option value="">Choose an officer</option>
                  {officers.map(o => (
                    <option key={o._id} value={o.userId?._id}>{o.userId?.name} — {o.departmentId?.name} ({o.availability})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setAssignModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAssign}>Assign Officer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
