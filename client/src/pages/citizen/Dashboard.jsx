import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';
import { StatusBadge, PriorityBadge, formatDate, timeAgo, getComplaintProofImage } from '../../components/shared.jsx';
import {
  PlusCircle,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Image,
  Eye,
  ArrowRight,
  User,
  Building2,
  Calendar,
  X
} from 'lucide-react';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data.complaints || []);
      if (res.data.complaints?.length > 0) {
        setSelectedComplaint(res.data.complaints[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapRef.current) return;

    import('leaflet').then(L => {
      if (!mapInstance.current) {
        // Center around Chennai or first complaint
        const defaultLat = complaints[0]?.latitude || 13.0827;
        const defaultLng = complaints[0]?.longitude || 80.2707;

        const map = L.default.map(mapRef.current).setView([defaultLat, defaultLng], 12);
        L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap'
        }).addTo(map);

        mapInstance.current = map;
      }

      const map = mapInstance.current;
      const markers = markersRef.current;

      // Clear existing markers
      Object.values(markers).forEach(m => m.remove());
      markersRef.current = {};

      const colors = { P1: '#DC2626', P2: '#EA580C', P3: '#D97706', P4: '#059669' };

      complaints.forEach(c => {
        if (!c.latitude || !c.longitude) return;

        const color = c.status === 'resolved' ? '#059669' : colors[c.priority] || '#3B82F6';
        const isSelected = selectedComplaint?._id === c._id;

        const customIcon = L.default.divIcon({
          className: '',
          html: `
            <div style="
              width: ${isSelected ? '20px' : '14px'};
              height: ${isSelected ? '20px' : '14px'};
              border-radius: 50%;
              background: ${color};
              border: 2px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.4);
              transition: all 0.3s;
              ${isSelected ? 'outline: 3px solid #00B4D8; outline-offset: 2px;' : ''}
            "></div>
          `,
          iconSize: [isSelected ? 20 : 14, isSelected ? 20 : 14]
        });

        const marker = L.default.marker([c.latitude, c.longitude], { icon: customIcon }).addTo(map);

        marker.bindPopup(`
          <div style="min-width: 180px; padding: 2px;">
            <strong style="color: var(--primary-700); font-size: 0.85rem;">${c.complaintId}</strong>
            <div style="font-weight: 600; margin: 2px 0 4px;">${c.title}</div>
            <div style="font-size: 0.75rem; color: #666;">📍 ${c.address || 'Tagged Location'}</div>
          </div>
        `);

        marker.on('click', () => {
          setSelectedComplaint(c);
        });

        markersRef.current[c._id] = marker;
      });

      // Fit bounds if multiple complaints
      if (complaints.length > 1) {
        const group = L.default.featureGroup(Object.values(markersRef.current));
        map.fitBounds(group.getBounds().pad(0.15));
      }
    });
  }, [complaints, selectedComplaint?._id]);

  // When a complaint is clicked from the list, focus map on it
  function handleSelectComplaint(c) {
    setSelectedComplaint(c);
    if (mapInstance.current && c.latitude && c.longitude) {
      mapInstance.current.flyTo([c.latitude, c.longitude], 15, { duration: 1 });
      const marker = markersRef.current[c._id];
      if (marker) {
        marker.openPopup();
      }
    }
  }

  const total = complaints.length;
  const active = complaints.filter(c => !['resolved'].includes(c.status)).length;
  const resolved = complaints.filter(c => c.status === 'resolved').length;
  const awaiting = complaints.filter(c => c.status === 'awaiting_verification').length;
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';

  // Get primary proof image for selected complaint
  const proofUrl = getComplaintProofImage(selectedComplaint, selectedComplaint?.evidence);

  return (
    <div className="fade-in">
      {/* Header & Quick Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
        <div>
          <h1 className="page-title">{greeting}, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Track and monitor your reported civic issues across your area
          </p>
        </div>

        <Link to="/citizen/report" className="btn btn-teal btn-lg" style={{ gap: 8 }}>
          <PlusCircle size={20} /> Report New Issue
        </Link>
      </div>

      {/* KPI Stats Bar */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-100)', color: 'var(--primary-600)' }}>
            <FileText size={22} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Total Reports</div>
            <div className="stat-value">{total}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--warning-100)', color: 'var(--warning-600)' }}>
            <Clock size={22} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Active Issues</div>
            <div className="stat-value">{active}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-100)', color: 'var(--success-600)' }}>
            <CheckCircle size={22} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Resolved</div>
            <div className="stat-value">{resolved}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--teal-100)', color: 'var(--teal-700)' }}>
            <AlertTriangle size={22} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Awaiting Verification</div>
            <div className="stat-value">{awaiting}</div>
          </div>
        </div>
      </div>

      {/* Section Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
            🗺️ My Complaints Map & Issue Proof Viewer
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', margin: 0 }}>
            Click any issue on the list or on the map to inspect its exact location and submitted proof photos
          </p>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Selected Complaint Proof Card + Complaints List */}
      <div className="grid-responsive-2col" style={{ marginBottom: 24, alignItems: 'start' }}>
        {/* Left Column: Interactive Map */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={16} style={{ color: 'var(--teal-500)' }} />
              Reported Locations ({complaints.length} Pins)
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
              Click any pin to inspect proof
            </span>
          </div>

          <div
            ref={mapRef}
            style={{
              height: 480,
              width: '100%',
              background: 'var(--gray-100)'
            }}
          />

          {/* Map Legend */}
          <div style={{ padding: '10px 18px', background: 'var(--gray-50)', display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: '0.75rem', borderTop: '1px solid var(--gray-200)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#DC2626' }} /> Critical (P1)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#EA580C' }} /> High (P2)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#D97706' }} /> Medium (P3)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#059669' }} /> Resolved
            </span>
          </div>
        </div>

        {/* Right Column: Selected Complaint & Submitted Proof Preview */}
        <div>
          {selectedComplaint ? (
            <div className="card fade-in" style={{ border: '2px solid var(--teal-200)', boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-600)' }}>
                    {selectedComplaint.complaintId}
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '2px 0 6px' }}>
                    {selectedComplaint.title}
                  </h3>
                </div>
                <PriorityBadge priority={selectedComplaint.priority} />
              </div>

              <div style={{ marginBottom: 12 }}>
                <StatusBadge status={selectedComplaint.status} />
              </div>

              {/* Submitted Proof / Evidence Photo Section */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gray-700)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Image size={15} style={{ color: 'var(--primary-500)' }} />
                  Submitted Problem Evidence / Photo:
                </div>

                <div
                  style={{
                    position: 'relative',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    background: '#090d16',
                    height: 220,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--gray-200)'
                  }}
                >
                  <img
                    src={proofUrl}
                    alt="Evidence Proof"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }}
                    onError={(e) => {
                      e.target.src = getComplaintProofImage(selectedComplaint, []);
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 8,
                      left: 8,
                      background: 'rgba(0,0,0,0.75)',
                      color: 'white',
                      padding: '3px 8px',
                      borderRadius: 4,
                      fontSize: '0.725rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    📸 Citizen Evidence Proof
                  </div>
                </div>
              </div>

              {/* Description */}
              <p style={{ color: 'var(--gray-600)', fontSize: '0.85rem', marginBottom: 16, lineHeight: 1.4 }}>
                {selectedComplaint.description}
              </p>

              {/* Key Location and Department Info */}
              <div style={{ background: 'var(--gray-50)', padding: 12, borderRadius: 'var(--radius-md)', marginBottom: 16, fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={14} style={{ color: 'var(--teal-600)', flexShrink: 0 }} />
                  <span><strong>Location:</strong> {selectedComplaint.address || `${selectedComplaint.latitude?.toFixed(4)}, ${selectedComplaint.longitude?.toFixed(4)}`}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Building2 size={14} style={{ color: 'var(--primary-600)', flexShrink: 0 }} />
                  <span><strong>Department:</strong> {selectedComplaint.departmentId?.name || 'Pending Assignment'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <User size={14} style={{ color: 'var(--warning-600)', flexShrink: 0 }} />
                  <span><strong>Officer:</strong> {selectedComplaint.officerId?.name || 'Awaiting Assignment'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={14} style={{ color: 'var(--gray-400)', flexShrink: 0 }} />
                  <span><strong>Submitted:</strong> {formatDate(selectedComplaint.createdAt)} ({timeAgo(selectedComplaint.createdAt)})</span>
                </div>
              </div>

              {/* Track Complaint Full Details Button */}
              <Link
                to={`/citizen/complaints/${selectedComplaint.complaintId}`}
                className="btn btn-primary w-full"
                style={{ justifyContent: 'center', gap: 8 }}
              >
                <span>Track Full Timeline & Resolution</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}>
              <MapPin size={36} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <div>Select a complaint on the map or list to inspect the exact location and evidence.</div>
            </div>
          )}
        </div>
      </div>

      {/* Active Complaints List */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">My Registered Complaints</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
              Click on any row to locate it on the map above and inspect its submitted evidence
            </span>
          </div>
          <Link to="/citizen/complaints" className="btn btn-ghost btn-sm">
            View Table List →
          </Link>
        </div>

        {loading ? (
          <div>{[1, 2, 3].map(i => <div key={i} className="skeleton skeleton-card" style={{ marginBottom: 12 }} />)}</div>
        ) : complaints.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><FileText size={32} /></div>
            <div className="empty-state-title">No complaints reported yet</div>
            <div className="empty-state-text">You haven't reported any civic issues yet. Click below to submit your first report with photos and GPS location.</div>
            <Link to="/citizen/report" className="btn btn-teal mt-4">
              <PlusCircle size={16} /> Report an Issue Now
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
            {complaints.map(c => {
              const isSelected = selectedComplaint?._id === c._id;
              const cardProof = getComplaintProofImage(c, c.evidence);

              return (
                <div
                  key={c._id}
                  onClick={() => handleSelectComplaint(c)}
                  style={{
                    background: isSelected ? 'var(--primary-50)' : 'var(--white)',
                    border: isSelected ? '2px solid var(--primary-500)' : '1px solid var(--gray-200)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 16,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: isSelected ? 'var(--shadow-md)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--primary-600)' }}>
                        {c.complaintId}
                      </span>
                      <PriorityBadge priority={c.priority} />
                    </div>

                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--gray-900)', marginBottom: 6, lineHeight: 1.3 }}>
                      {c.title}
                    </div>

                    <div style={{ marginBottom: 10 }}>
                      <StatusBadge status={c.status} />
                    </div>

                    {/* Thumbnail & Location */}
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                      <img
                        src={cardProof}
                        alt="Proof"
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: 'var(--radius-sm)',
                          objectFit: 'cover',
                          border: '1px solid var(--gray-200)',
                          flexShrink: 0
                        }}
                        onError={(e) => { e.target.src = '/demo/before-pothole.svg'; }}
                      />
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                          <MapPin size={12} style={{ color: 'var(--teal-600)' }} />
                          <span style={{ fontWeight: 500 }}>{c.address?.split(',')[0] || c.area || 'Location Tagged'}</span>
                        </div>
                        <div style={{ color: 'var(--gray-400)' }}>
                          🏢 {c.departmentId?.name || 'Pending'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--gray-100)', paddingTop: 8, marginTop: 6, fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--gray-400)' }}>{timeAgo(c.createdAt)}</span>
                    <span style={{ color: 'var(--primary-600)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
                      {isSelected ? '📍 Viewing Location' : 'Click to View →'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Civic Impact Score */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <h3 className="card-title">Your Civic Engagement Impact</h3>
          <TrendingUp size={20} style={{ color: 'var(--teal-500)' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
          <div style={{ textAlign: 'center', padding: 14, background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-700)' }}>{total}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Reports Submitted</div>
          </div>
          <div style={{ textAlign: 'center', padding: 14, background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--success-600)' }}>{resolved}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Issues Resolved</div>
          </div>
          <div style={{ textAlign: 'center', padding: 14, background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--teal-600)' }}>{Math.min(total * 8 + resolved * 12, 100)}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Civic Impact Score</div>
          </div>
        </div>
      </div>
    </div>
  );
}
