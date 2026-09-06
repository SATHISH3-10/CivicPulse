import { useState, useEffect, useRef } from 'react';
import api from '../../services/api.js';
import { CATEGORIES } from '../../components/shared.jsx';

export default function AdminLiveMap() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [cRes, aRes] = await Promise.all([
        api.get('/complaints/public'),
        api.get('/admin/analytics')
      ]);
      setComplaints(cRes.data.complaints);
      setStats(aRes.data.stats || {});
    } catch (e) { console.error(e); }
  }

  useEffect(() => {
    if (!mapRef.current) return;
    import('leaflet').then(L => {
      if (mapInstance.current) mapInstance.current.remove();
      const map = L.default.map(mapRef.current).setView([13.0827, 80.2707], 12);
      L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);

      const colors = { P1: '#DC2626', P2: '#EA580C', P3: '#D97706', P4: '#059669' };
      const filtered = (complaints || []).filter(c => filter === 'all' || c.category === filter);

      filtered.forEach(c => {
        if (c.latitude == null || c.longitude == null) return;
        const color = c.status === 'resolved' ? '#059669' : colors[c.priority] || '#6B7280';
        const size = c.priority === 'P1' ? 16 : c.priority === 'P2' ? 14 : 12;
        const icon = L.default.divIcon({
          className: '',
          html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);${c.priority === 'P1' ? 'animation:pulse 2s infinite;' : ''}"></div>`,
          iconSize: [size, size]
        });
        L.default.marker([c.latitude, c.longitude], { icon }).addTo(map)
          .bindPopup(`<div style="min-width:220px"><strong>${c.title}</strong><br/><span style="color:${color};font-weight:700">${c.priority}</span> • ${c.status?.replace(/_/g,' ') || 'submitted'}<br/><small>📍 ${c.address || ''}</small><br/><small>${c.category || ''} • ${c.complaintId || ''}</small></div>`);
      });

      mapInstance.current = map;
    });
  }, [complaints, filter]);

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Live City Map</h1>
        <div className="filters-bar" style={{ marginBottom: 0 }}>
          {['all', ...CATEGORIES.slice(0, 7).map(c => c.value)].map(f => (
            <button key={f} className={`filter-chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, height: 'calc(100vh - 200px)', minHeight: 500 }}>
        <div ref={mapRef} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--gray-200)' }} />
        <div>
          <div className="card" style={{ marginBottom: 12 }}>
            <h4 style={{ fontSize: '0.875rem', marginBottom: 12 }}>Live Statistics</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}><span>Active Issues</span><strong style={{ color: 'var(--warning-600)' }}>{stats.active || 0}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}><span>Critical</span><strong style={{ color: 'var(--error-600)' }}>{stats.critical || 0}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}><span>SLA Breached</span><strong style={{ color: 'var(--error-600)' }}>{stats.slaBreached || 0}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}><span>Resolved Today</span><strong style={{ color: 'var(--success-600)' }}>{stats.resolvedToday || 0}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}><span>Resolution Rate</span><strong>{stats.resolutionRate || 0}%</strong></div>
            </div>
          </div>
          <div className="card">
            <h4 style={{ fontSize: '0.875rem', marginBottom: 12 }}>Map Legend</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[{ color: '#DC2626', label: 'Critical (P1)' }, { color: '#EA580C', label: 'High (P2)' }, { color: '#D97706', label: 'Medium (P3)' }, { color: '#059669', label: 'Resolved / Low' }].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem' }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: l.color, border: '1px solid var(--gray-300)' }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
