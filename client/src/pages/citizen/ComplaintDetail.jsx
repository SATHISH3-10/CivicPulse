import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { StatusBadge, PriorityBadge, formatDateTime, STATUS_CONFIG, getComplaintProofImage } from '../../components/shared.jsx';
import OfficialReportModal from '../../components/OfficialReportModal.jsx';
import { ArrowLeft, MapPin, Clock, Building2, User, Star, Image, CheckCircle, AlertTriangle, Printer, ShieldCheck } from 'lucide-react';

const ALL_STATUSES = ['submitted', 'ai_analyzed', 'assigned', 'officer_accepted', 'in_progress', 'resolution_submitted', 'awaiting_verification', 'resolved'];

export default function ComplaintDetail() {
  const { id } = useParams();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [reopenReason, setReopenReason] = useState('');
  const [showReport, setShowReport] = useState(false);

  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => { loadData(); }, [id]);

  async function loadData() {
    try {
      const res = await api.get(`/complaints/${id}`);
      setData(res.data);
      if (res.data.feedback) { setRating(res.data.feedback.rating); setFeedbackComment(res.data.feedback.comment); }
    } catch (e) { addToast('Failed to load complaint', 'error'); }
    finally { setLoading(false); }
  }

  // Initialize Map for exact complaint location
  useEffect(() => {
    let active = true;
    if (data?.complaint && mapRef.current) {
      import('leaflet').then(L => {
        if (!active || !mapRef.current) return;
        if (mapInstance.current) {
          try { mapInstance.current.remove(); } catch (e) {}
          mapInstance.current = null;
        }

        const { latitude, longitude } = data.complaint;
        if (!latitude || !longitude) return;

        try {
          const map = L.default.map(mapRef.current).setView([latitude, longitude], 15);
          L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);

          const color = data.complaint.status === 'resolved' ? '#059669' : data.complaint.priority === 'P1' ? '#DC2626' : '#EA580C';
          const customIcon = L.default.divIcon({
            className: '',
            html: `<div style="width:18px;height:18px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5)"></div>`,
            iconSize: [18, 18]
          });

          L.default.marker([latitude, longitude], { icon: customIcon }).addTo(map)
            .bindPopup(`<strong>${data.complaint.complaintId}</strong><br/>${data.complaint.title}<br/>📍 ${data.complaint.address || ''}`)
            .openPopup();

          mapInstance.current = map;
        } catch (err) {
          console.warn('Map initialization warning:', err);
        }
      });
    }

    return () => {
      active = false;
      if (mapInstance.current) {
        try { mapInstance.current.remove(); } catch (e) {}
        mapInstance.current = null;
      }
    };
  }, [data]);

  async function handleVerify(resolved) {
    setVerifying(true);
    try {
      await api.post(`/complaints/${id}/verify`, { resolved, reason: reopenReason });
      addToast(resolved ? 'Resolution verified! Thank you.' : 'Complaint reopened', resolved ? 'success' : 'warning');
      loadData();
    } catch (e) { addToast('Verification failed', 'error'); }
    setVerifying(false);
  }

  async function submitFeedback() {
    if (!rating) { addToast('Please select a rating', 'warning'); return; }
    try {
      await api.post(`/complaints/${id}/feedback`, { rating, comment: feedbackComment });
      addToast('Thank you for your feedback!', 'success');
    } catch (e) { addToast('Feedback failed', 'error'); }
  }

  if (loading) return <div style={{ padding: 40 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, marginBottom: 12 }} />)}</div>;
  if (!data) return <div className="empty-state"><div className="empty-state-title">Complaint not found</div><Link to="/citizen" className="btn btn-primary mt-4">Back to Dashboard</Link></div>;

  const { complaint, timeline, evidence, feedback } = data;
  const currentStatusIdx = ALL_STATUSES.indexOf(complaint.status);
  const beforeImages = evidence?.filter(e => e.stage === 'report' || e.stage === 'before') || [];
  const afterImages = evidence?.filter(e => e.stage === 'after') || [];

  return (
    <div className="fade-in" style={{ maxWidth: 880, margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ marginBottom: 16 }}><ArrowLeft size={16} /> Back to Dashboard</button>

      {/* Complaint Overview Card */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-600)', marginBottom: 4 }}>{complaint.complaintId}</div>
            <h2 style={{ fontSize: '1.6rem', marginBottom: 8, fontWeight: 800 }}>{complaint.title}</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
            </div>
          </div>

          <div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setShowReport(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
            >
              <ShieldCheck size={16} style={{ color: 'var(--teal-600)' }} />
              <span>Official Action Report (PDF)</span>
            </button>
          </div>
        </div>

        <p style={{ color: 'var(--gray-700)', fontSize: '0.95rem', marginBottom: 16, lineHeight: 1.5 }}>
          {complaint.description}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, fontSize: '0.85rem', background: 'var(--gray-50)', padding: 14, borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MapPin size={16} style={{ color: 'var(--teal-600)' }} /> <span><strong>Location:</strong> {complaint.address || `${complaint.latitude?.toFixed(4)}, ${complaint.longitude?.toFixed(4)}`}</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Building2 size={16} style={{ color: 'var(--primary-600)' }} /> <span><strong>Department:</strong> {complaint.departmentId?.name || 'Pending Assignment'}</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><User size={16} style={{ color: 'var(--warning-600)' }} /> <span><strong>Officer:</strong> {complaint.officerId?.name || 'Awaiting assignment'}</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={16} style={{ color: 'var(--gray-500)' }} /> <span><strong>SLA:</strong> {complaint.slaDeadline ? formatDateTime(complaint.slaDeadline) : 'N/A'}</span></div>
        </div>

        {/* SLA Indicator */}
        {complaint.slaDeadline && complaint.status !== 'resolved' && (
          <div style={{ marginTop: 16 }}>
            <SLABar deadline={complaint.slaDeadline} createdAt={complaint.createdAt} />
          </div>
        )}
      </div>

      {/* Exact Map Location Section */}
      <div className="card" style={{ marginBottom: 20, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <MapPin size={16} style={{ color: 'var(--teal-600)' }} />
            Exact Problem Location on Map
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
            GPS: {complaint.latitude?.toFixed(4)}, {complaint.longitude?.toFixed(4)}
          </span>
        </div>
        <div ref={mapRef} style={{ height: 280, width: '100%' }} />
      </div>

      {/* Submitted Evidence & Proof Section */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 className="card-title" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Image size={20} style={{ color: 'var(--primary-500)' }} />
          Submitted Photo Evidence & Proof
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: afterImages.length > 0 ? 'repeat(auto-fit, minmax(280px, 1fr))' : '1fr', gap: 16 }}>
          {/* Citizen Initial Photo Proof */}
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--error-600)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📸 Before / Problem Proof (Submitted by Citizen)</span>
            </div>
            <div
              style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                border: '2px solid var(--error-200)',
                background: '#090d16',
                height: 280,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              <img
                src={getComplaintProofImage(complaint, beforeImages)}
                alt="Submitted Proof"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onError={(e) => { e.target.src = getComplaintProofImage(complaint, []); }}
              />
              <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,0.75)', color: 'white', padding: '4px 10px', borderRadius: 6, fontSize: '0.75rem' }}>
                📍 Issue Location Proof
              </div>
            </div>
          </div>

          {/* After Resolution Photo (if uploaded) */}
          {afterImages.length > 0 && (
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--success-600)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>✅ After / Resolution Proof (Uploaded by Field Officer)</span>
              </div>
              <div
                style={{
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  border: '2px solid var(--success-200)',
                  background: '#090d16',
                  height: 280,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                <img
                  src={afterImages[0]?.url || '/demo/after-fixed.svg'}
                  alt="Resolution Proof"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  onError={(e) => { e.target.src = '/demo/after-fixed.svg'; }}
                />
                <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,0.75)', color: 'white', padding: '4px 10px', borderRadius: 6, fontSize: '0.75rem' }}>
                  🔧 Fixed by Officer
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Citizen Verification Block */}
      {complaint.status === 'awaiting_verification' && (
        <div className="card" style={{ marginBottom: 20, borderLeft: '5px solid var(--teal-500)', background: 'var(--teal-50)' }}>
          <h3 style={{ marginBottom: 8, color: 'var(--teal-900)' }}>🔍 Verify Resolution</h3>
          <p style={{ color: 'var(--teal-800)', fontSize: '0.9rem', marginBottom: 16 }}>
            The municipal field officer has submitted resolution evidence above. Please inspect and confirm whether the issue is properly resolved!
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-success btn-lg" onClick={() => handleVerify(true)} disabled={verifying}>
              <CheckCircle size={18} /> ✅ Issue Resolved Satisfactorily
            </button>
            <button className="btn btn-danger btn-lg" onClick={() => handleVerify(false)} disabled={verifying}>
              <AlertTriangle size={18} /> ❌ Issue Still Exists (Reopen)
            </button>
          </div>
        </div>
      )}

      {/* Satisfaction Rating */}
      {complaint.status === 'resolved' && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 12 }}>⭐ How satisfied are you with the resolution?</h3>
          <div className="star-rating" style={{ marginBottom: 16 }}>
            {[1,2,3,4,5].map(s => (
              <button key={s} className={s <= rating ? 'active' : ''} onClick={() => setRating(s)}>
                <Star size={28} fill={s <= rating ? '#FBBF24' : 'none'} />
              </button>
            ))}
          </div>
          <textarea className="form-textarea" placeholder="Optional feedback..." value={feedbackComment} onChange={e => setFeedbackComment(e.target.value)} rows={3} style={{ marginBottom: 12 }} />
          <button className="btn btn-primary" onClick={submitFeedback}>Submit Rating & Feedback</button>
        </div>
      )}

      {/* Timeline */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 className="card-title" style={{ marginBottom: 20 }}>Resolution Timeline & Events</h3>
        <div className="timeline">
          {ALL_STATUSES.map((s, i) => {
            const event = timeline?.find(t => t.status === s);
            const isCompleted = i <= currentStatusIdx;
            const isCurrent = s === complaint.status;
            return (
              <div key={s} className="timeline-item">
                <div className={`timeline-dot ${isCurrent ? 'active' : isCompleted ? 'completed' : ''}`} />
                <div className="timeline-content">
                  <div className="timeline-status" style={{ opacity: isCompleted ? 1 : 0.4 }}>
                    {STATUS_CONFIG[s]?.icon} {STATUS_CONFIG[s]?.label}
                  </div>
                  {event && (
                    <>
                      <div className="timeline-message">{event.message}</div>
                      <div className="timeline-meta">{event.createdByName && `by ${event.createdByName} • `}{formatDateTime(event.timestamp)}</div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Official Municipal Action Report Modal */}
      {showReport && (
        <OfficialReportModal
          complaint={complaint}
          timeline={timeline}
          evidence={evidence}
          feedback={feedback}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}

function SLABar({ deadline, createdAt }) {
  const now = new Date();
  const dead = new Date(deadline);
  const created = new Date(createdAt);
  const total = dead - created;
  const elapsed = now - created;
  const pct = Math.min(Math.max((elapsed / total) * 100, 0), 100);
  const remaining = dead - now;
  const breached = remaining < 0;
  const hours = Math.abs(Math.floor(remaining / (1000 * 60 * 60)));
  const mins = Math.abs(Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60)));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
        <span style={{ fontWeight: 600, color: breached ? 'var(--error-600)' : pct > 75 ? 'var(--warning-600)' : 'var(--success-600)' }}>
          {breached ? `SLA BREACHED (${hours}h ${mins}m ago)` : `${hours}h ${mins}m remaining`}
        </span>
        <span style={{ color: 'var(--gray-400)' }}>{breached ? 'OVERDUE' : pct > 75 ? 'AT RISK' : 'ON TRACK'}</span>
      </div>
      <div className="sla-bar">
        <div className={`sla-bar-fill ${breached ? 'breached' : pct > 75 ? 'warning' : 'on-track'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
