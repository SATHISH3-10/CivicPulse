import { useState, useEffect, useRef } from 'react';
import api from '../../services/api.js';
import { Flame, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

export default function Hotspots() {
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const res = await api.get('/admin/hotspots');
      setHotspots(res.data.hotspots);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    if (!mapRef.current || hotspots.length === 0) return;
    import('leaflet').then(L => {
      if (mapInstance.current) mapInstance.current.remove();
      const map = L.default.map(mapRef.current).setView([13.0500, 80.2200], 12);
      L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OSM' }).addTo(map);

      hotspots.forEach(h => {
        const color = h.severity === 'critical' ? '#DC2626' : h.severity === 'high' ? '#EA580C' : '#D97706';
        const radius = Math.min(h.totalComplaints * 80, 800);
        L.default.circle([h.latitude, h.longitude], { radius, color, fillColor: color, fillOpacity: 0.25, weight: 2 }).addTo(map)
          .bindPopup(`<strong>Hotspot</strong><br/>${h.totalComplaints} complaints<br/>Primary: ${h.primaryCategory}<br/>Trend: ${h.trend > 0 ? '↑' : '↓'} ${Math.abs(h.trend)}%`);
      });

      mapInstance.current = map;
    });
  }, [hotspots]);

  return (
    <div className="fade-in">
      <h1 className="page-title">Civic Hotspots</h1>
      <p className="page-subtitle">Areas with high concentrations of complaints</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20, minHeight: 400 }}>
        <div ref={mapRef} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--gray-200)', minHeight: 400 }} />
        <div style={{ overflowY: 'auto', maxHeight: 600 }}>
          {loading ? (
            [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 140, marginBottom: 12 }} />)
          ) : hotspots.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>No hotspots detected</div>
            </div>
          ) : (
            hotspots.map((h, i) => (
              <div key={i} className="card" style={{ marginBottom: 12, borderLeft: `4px solid ${h.severity === 'critical' ? 'var(--error-500)' : h.severity === 'high' ? 'var(--warning-500)' : 'var(--warning-400)'}` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                  <Flame size={24} style={{ color: h.severity === 'critical' ? 'var(--error-500)' : 'var(--warning-500)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', fontSize: '0.75rem', color: h.severity === 'critical' ? 'var(--error-600)' : 'var(--warning-600)' }}>
                      ⚠️ HOTSPOT DETECTED
                    </div>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>{h.primaryCategory} Zone</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                      {h.totalComplaints} complaints • {h.recentComplaints} in last 30 days
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.875rem', fontWeight: 600, color: h.trend > 0 ? 'var(--error-600)' : 'var(--success-600)' }}>
                    {h.trend > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    {Math.abs(h.trend)}%
                  </div>
                </div>

                <div style={{ background: 'var(--gray-50)', padding: 12, borderRadius: 'var(--radius-md)', fontSize: '0.8rem', marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Category Breakdown:</div>
                  {Object.entries(h.categoryBreakdown).map(([cat, count]) => (
                    <span key={cat} style={{ marginRight: 12 }}>{cat}: <strong>{count}</strong></span>
                  ))}
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--primary-600)', fontWeight: 500 }}>
                  💡 {h.recommendedAction}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
