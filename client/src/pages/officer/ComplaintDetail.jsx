import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { StatusBadge, PriorityBadge, formatDateTime, STATUS_CONFIG, getComplaintProofImage } from '../../components/shared.jsx';
import OfficialReportModal from '../../components/OfficialReportModal.jsx';
import { ArrowLeft, MapPin, Play, CheckCircle, Upload, Camera, Check, ShieldCheck, Printer, Image } from 'lucide-react';

export default function OfficerComplaintDetail() {
  const { id } = useParams();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [workNotes, setWorkNotes] = useState('');
  const [showReport, setShowReport] = useState(false);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const fileBeforeRef = useRef(null);
  const fileAfterRef = useRef(null);

  useEffect(() => { loadData(); }, [id]);

  async function loadData() {
    try {
      const res = await api.get(`/complaints/${id}`);
      setData(res.data);
    } catch (e) { addToast('Failed to load complaint', 'error'); }
    finally { setLoading(false); }
  }

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
          L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OSM' }).addTo(map);
          L.default.marker([latitude, longitude]).addTo(map);
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

  async function claimComplaint() {
    setUpdating(true);
    try {
      await api.put(`/officer/complaints/${id}/claim`);
      addToast('Complaint claimed and accepted successfully!', 'success');
      loadData();
    } catch (e) {
      addToast(e.response?.data?.error || 'Failed to claim complaint', 'error');
    } finally {
      setUpdating(false);
    }
  }

  async function updateStatus(status, message) {
    setUpdating(true);
    try {
      await api.put(`/officer/complaints/${id}/status`, { status, message: message || workNotes || undefined });
      addToast(`Status updated to ${status.replace(/_/g, ' ')}`, 'success');
      setWorkNotes('');
      loadData();
    } catch (e) { addToast(e.response?.data?.error || 'Update failed', 'error'); }
    setUpdating(false);
  }

  async function uploadEvidence(stage, fileUrl) {
    setUpdating(true);
    try {
      const url = fileUrl || (stage === 'before' ? '/demo/before-pothole.svg' : '/demo/after-fixed.svg');
      await api.post(`/officer/complaints/${id}/evidence`, { stage, url });
      addToast(`${stage.toUpperCase()} evidence photo uploaded`, 'success');
      loadData();
    } catch (e) { addToast('Upload failed', 'error'); }
    setUpdating(false);
  }

  function handleFileSelect(e, stage) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result;
      if (base64) {
        uploadEvidence(stage, base64);
      }
    };
    reader.readAsDataURL(file);
  }

  if (loading) return <div style={{ padding: 40 }}><div className="skeleton" style={{ height: 200 }} /></div>;
  if (!data) return <div className="empty-state"><div className="empty-state-title">Not found</div></div>;

  const { complaint, timeline, evidence } = data;
  const beforeImages = evidence?.filter(e => e.stage === 'report' || e.stage === 'before') || [];
  const afterImages = evidence?.filter(e => e.stage === 'after') || [];

  const slaRemaining = complaint.slaDeadline ? new Date(complaint.slaDeadline) - new Date() : null;
  const slaBreach = slaRemaining !== null && slaRemaining < 0;
  const slaHours = slaRemaining !== null ? Math.abs(Math.floor(slaRemaining / (1000 * 60 * 60))) : null;
  const slaMins = slaRemaining !== null ? Math.abs(Math.floor((slaRemaining % (1000 * 60 * 60)) / (1000 * 60))) : null;
  const slaPct = complaint.slaDeadline ? Math.min(Math.max(((new Date() - new Date(complaint.createdAt)) / (new Date(complaint.slaDeadline) - new Date(complaint.createdAt))) * 100, 0), 100) : 0;

  return (
    <div className="fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ marginBottom: 16 }}><ArrowLeft size={16} /> Back</button>

      {/* Header */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-500)' }}>{complaint.complaintId}</div>
            <h2 style={{ fontSize: '1.3rem' }}>{complaint.title}</h2>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setShowReport(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <ShieldCheck size={15} style={{ color: 'var(--teal-600)' }} />
              <span>Action Certificate (PDF)</span>
            </button>
          </div>
        </div>
        <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', marginBottom: 12 }}>{complaint.description}</p>
        <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
          <div>📍 {complaint.address || `${complaint.latitude}, ${complaint.longitude}`}</div>
          <div>👤 Reported by: {complaint.citizenId?.name || 'Citizen'}</div>
          <div>🏢 {complaint.departmentId?.name || 'N/A'}</div>
          {complaint.officerId && <div>🔧 Assigned Officer: {complaint.officerId.name}</div>}
        </div>
      </div>

      {/* SLA */}
      <div className="card" style={{ marginBottom: 16, borderLeft: slaBreach ? '4px solid var(--error-500)' : '4px solid var(--success-500)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h4 style={{ fontSize: '0.875rem' }}>SLA Countdown</h4>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: slaBreach ? 'var(--error-600)' : 'var(--success-600)' }}>
            {slaHours !== null ? `${slaHours}h ${slaMins}m` : 'N/A'}
          </span>
        </div>
        <div className="sla-bar">
          <div className={`sla-bar-fill ${slaBreach ? 'breached' : slaPct > 75 ? 'warning' : 'on-track'}`} style={{ width: `${slaPct}%` }} />
        </div>
        <div style={{ fontSize: '0.75rem', color: slaBreach ? 'var(--error-600)' : 'var(--gray-500)', marginTop: 4, fontWeight: 600 }}>
          {slaBreach ? '⚠️ SLA BREACHED' : slaPct > 75 ? '⚡ AT RISK' : '✅ ON TRACK'}
        </div>
      </div>

      {/* Submitted Photo Evidence & Proof Section */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h4 style={{ marginBottom: 16, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Image size={18} style={{ color: 'var(--primary-500)' }} />
          Submitted Photo Evidence & Proof
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: afterImages.length > 0 ? 'repeat(auto-fit, minmax(260px, 1fr))' : '1fr', gap: 16 }}>
          {/* Citizen Initial Photo Proof */}
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--error-600)', marginBottom: 8 }}>
              📸 Problem / Before Photo (Submitted by Citizen)
            </div>
            <div
              style={{
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '2px solid var(--error-200)',
                background: '#090d16',
                height: 260,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              <img
                src={getComplaintProofImage(complaint, beforeImages)}
                alt="Problem Proof"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onError={(e) => { e.target.src = getComplaintProofImage(complaint, []); }}
              />
              <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,0.75)', color: 'white', padding: '4px 10px', borderRadius: 6, fontSize: '0.75rem' }}>
                📍 Citizen Issue Photo
              </div>
            </div>
          </div>

          {/* After Resolution Photo (if uploaded) */}
          {afterImages.length > 0 && (
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--success-600)', marginBottom: 8 }}>
                ✅ Resolution / After Photo (Uploaded by Officer)
              </div>
              <div
                style={{
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: '2px solid var(--success-200)',
                  background: '#090d16',
                  height: 260,
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
                  🔧 Fixed Officer Photo
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h4 style={{ marginBottom: 12, fontSize: '0.875rem' }}>Location</h4>
        <div ref={mapRef} style={{ height: 250, borderRadius: 'var(--radius-md)', overflow: 'hidden' }} />
      </div>

      {/* Actions */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h4 style={{ marginBottom: 12 }}>Officer Actions</h4>

        {/* If complaint not assigned to current officer, show Claim button */}
        {!complaint.officerId && (
          <div style={{ marginBottom: 16, padding: 12, background: 'var(--teal-50)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--teal-800)' }}>
              This issue is in your patrol border and is currently unassigned.
            </span>
            <button className="btn btn-teal btn-sm" onClick={claimComplaint} disabled={updating}>
              <Check size={16} /> Claim & Accept
            </button>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Work Notes</label>
          <textarea className="form-textarea" placeholder="Add notes about the work..." value={workNotes} onChange={e => setWorkNotes(e.target.value)} rows={3} />
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {complaint.status === 'assigned' && (
            <button className="btn btn-primary" onClick={() => updateStatus('officer_accepted', 'Officer accepted the assignment')} disabled={updating}>
              <CheckCircle size={16} /> Accept Assignment
            </button>
          )}
          {['assigned', 'officer_accepted'].includes(complaint.status) && (
            <button className="btn btn-warning" onClick={() => updateStatus('in_progress', 'Work started')} disabled={updating}>
              <Play size={16} /> Start Work
            </button>
          )}
          {['officer_accepted', 'in_progress'].includes(complaint.status) && (
            <>
              <input type="file" ref={fileBeforeRef} accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileSelect(e, 'before')} />
              <input type="file" ref={fileAfterRef} accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileSelect(e, 'after')} />

              <button className="btn btn-secondary" onClick={() => fileBeforeRef.current?.click()} disabled={updating} title="Select photo file from device or camera">
                <Camera size={16} /> Upload Before Photo
              </button>
              <button className="btn btn-secondary" onClick={() => fileAfterRef.current?.click()} disabled={updating} title="Select resolution photo from device or camera">
                <Upload size={16} /> Upload After Photo
              </button>
            </>
          )}
          {['in_progress', 'officer_accepted'].includes(complaint.status) && (
            <button className="btn btn-success" onClick={() => updateStatus('awaiting_verification', 'Resolution submitted — awaiting citizen verification')} disabled={updating}>
              <CheckCircle size={16} /> Mark Resolved
            </button>
          )}
          {complaint.status === 'reopened' && (
            <button className="btn btn-warning" onClick={() => updateStatus('in_progress', 'Reopened — resuming work')} disabled={updating}>
              <Play size={16} /> Resume Work
            </button>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="card">
        <h4 style={{ marginBottom: 16 }}>Timeline</h4>
        <div className="timeline">
          {timeline?.map((t, i) => (
            <div key={i} className="timeline-item">
              <div className={`timeline-dot ${i === timeline.length - 1 ? 'active' : 'completed'}`} />
              <div className="timeline-content">
                <div className="timeline-status">{STATUS_CONFIG[t.status]?.icon} {STATUS_CONFIG[t.status]?.label || t.status}</div>
                <div className="timeline-message">{t.message}</div>
                <div className="timeline-meta">{t.createdByName} • {formatDateTime(t.timestamp)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Official Municipal Action Report Modal */}
      {showReport && (
        <OfficialReportModal
          complaint={complaint}
          timeline={timeline}
          evidence={evidence}
          feedback={data.feedback}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}
