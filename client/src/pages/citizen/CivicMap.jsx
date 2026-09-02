import { useState, useEffect, useRef } from 'react';
import api from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { CATEGORIES, StatusBadge, PriorityBadge, timeAgo } from '../../components/shared.jsx';
import { ThumbsUp } from 'lucide-react';

export default function CivicMap() {
  const { addToast } = useToast();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const res = await api.get('/complaints/public');
      setComplaints(res.data.complaints);
    } catch (e) { console.error(e); }
  }

  useEffect(() => {
    if (!mapRef.current) return;
    import('leaflet').then(L => {
      if (mapInstance.current) mapInstance.current.remove();
      const map = L.default.map(mapRef.current).setView([13.0827, 80.2707], 12);
      L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);

      const colors = { P1: '#DC2626', P2: '#EA580C', P3: '#D97706', P4: '#059669' };
      const filtered = complaints.filter(c => {
        if (filter !== 'all' && c.category !== filter) return false;
        if (statusFilter !== 'all' && c.status !== statusFilter) return false;
        return true;
      });

      filtered.forEach(c => {
        const color = c.status === 'resolved' ? '#059669' : colors[c.priority] || '#6B7280';
        const icon = L.default.divIcon({
          className: '',
          html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
          iconSize: [12, 12]
        });
        L.default.marker([c.latitude, c.longitude], { icon }).addTo(map)
          .bindPopup(`<div style="min-width:200px"><strong>${c.title}</strong><br/><span style="color:${color};font-weight:600">${c.priority} — ${c.status.replace(/_/g,' ')}</span><br/><small>${c.address || ''}</small></div>`);
      });

      mapInstance.current = map;
    });
  }, [complaints, filter, statusFilter]);

  async function supportComplaint(complaintId) {
    try {
      await api.post(`/complaints/${complaintId}/support`);
      addToast('Support registered!', 'success');
      loadData();
    } catch (e) { addToast(e.response?.data?.error || 'Failed', 'warning'); }
  }

  return (
    <div className="fade-in">
      <h1 className="page-title">Civic Issue Map</h1>
      <p className="page-subtitle">What's happening around you?</p>

      <div className="filters-bar">
        {['all', ...CATEGORIES.slice(0, 7).map(c => c.value)].map(f => (
          <button key={f} className={`filter-chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, height: 'calc(100vh - 280px)', minHeight: 500 }}>
        <div ref={mapRef} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--gray-200)' }} />
        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h4 style={{ marginBottom: 4 }}>Nearby Issues ({complaints.filter(c => filter === 'all' || c.category === filter).length})</h4>
          {complaints.filter(c => filter === 'all' || c.category === filter).slice(0, 15).map(c => (
            <div key={c._id} className="card" style={{ padding: 14, fontSize: '0.875rem' }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{c.title}</div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                <StatusBadge status={c.status} />
                <PriorityBadge priority={c.priority} />
              </div>
              <div style={{ color: 'var(--gray-500)', fontSize: '0.75rem' }}>
                📍 {c.address?.split(',').slice(0,2).join(',') || 'Location tagged'} • {timeAgo(c.createdAt)}
              </div>
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => supportComplaint(c.complaintId)} style={{ fontSize: '0.75rem' }}>
                  <ThumbsUp size={14} /> This affects me too ({c.supportCount || 0})
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
