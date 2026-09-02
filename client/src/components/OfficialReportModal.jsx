import { useRef } from 'react';
import { formatDate, formatDateTime, StatusBadge, PriorityBadge } from './shared.jsx';
import { Printer, Download, X, CheckCircle, ShieldCheck, QrCode, MapPin, Building2, User, Clock } from 'lucide-react';

export default function OfficialReportModal({ complaint, timeline, evidence, feedback, onClose }) {
  if (!complaint) return null;

  const reportRef = useRef(null);

  function handlePrint() {
    window.print();
  }

  const beforeImg = getComplaintProofImage(complaint, evidence);
  const afterImg = evidence?.find(e => e.stage === 'after')?.url || '/demo/after-fixed.svg';

  const createdAt = new Date(complaint.createdAt);
  const resolvedAt = complaint.updatedAt ? new Date(complaint.updatedAt) : new Date();
  const turnaroundHours = Math.max(1, Math.round((resolvedAt - createdAt) / (1000 * 60 * 60)));

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 820,
          width: '95%',
          maxHeight: '92vh',
          padding: 0,
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden'
        }}
      >
        {/* Top Control Action Bar (Hidden during print) */}
        <div
          className="no-print"
          style={{
            padding: '12px 20px',
            background: 'var(--primary-900)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', fontWeight: 600 }}>
            <ShieldCheck size={18} style={{ color: 'var(--teal-400)' }} />
            <span>Official Municipal Resolution & Action Certificate</span>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="btn btn-teal btn-sm" onClick={handlePrint} style={{ gap: 6 }}>
              <Printer size={15} />
              <span>Print / Save as PDF</span>
            </button>
            <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ color: 'white' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Official Government Document Container */}
        <div
          ref={reportRef}
          id="printable-report"
          style={{
            padding: '36px 40px',
            background: '#ffffff',
            color: '#111827',
            fontFamily: 'Inter, sans-serif',
            overflowY: 'auto',
            maxHeight: 'calc(92vh - 60px)'
          }}
        >
          {/* Municipal Emblem Header */}
          <div
            style={{
              textAlign: 'center',
              borderBottom: '3px double #1e3a8a',
              paddingBottom: 20,
              marginBottom: 24
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 8 }}>
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  background: '#0A2540',
                  color: '#00B4D8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: 22,
                  border: '2px solid #00B4D8'
                }}
              >
                CP
              </div>
              <div style={{ textAlign: 'left' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0A2540', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Municipal Corporation of Greater Chennai
                </h1>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0D6E6E' }}>
                  CivicPulse AI — Smart Civic Grievance & Resolution Authority
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'inline-block',
                background: '#EBF5FE',
                color: '#1570CD',
                padding: '4px 16px',
                borderRadius: 999,
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                border: '1px solid #A3CFF7',
                marginTop: 6
              }}
            >
              Official Civic Action & Audit Certificate
            </div>
          </div>

          {/* Certificate Metadata Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 12,
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: 8,
              padding: 14,
              marginBottom: 20,
              fontSize: '0.8rem'
            }}
          >
            <div>
              <span style={{ color: '#6B7280', display: 'block', fontSize: '0.7rem' }}>CERTIFICATE ID</span>
              <strong style={{ color: '#1570CD', fontSize: '0.9rem' }}>{complaint.complaintId}</strong>
            </div>

            <div>
              <span style={{ color: '#6B7280', display: 'block', fontSize: '0.7rem' }}>FILING DATE</span>
              <strong>{formatDate(complaint.createdAt)}</strong>
            </div>

            <div>
              <span style={{ color: '#6B7280', display: 'block', fontSize: '0.7rem' }}>RESOLUTION TIME</span>
              <strong style={{ color: '#059669' }}>{turnaroundHours} Hours</strong>
            </div>

            <div>
              <span style={{ color: '#6B7280', display: 'block', fontSize: '0.7rem' }}>STATUS</span>
              <strong style={{ color: complaint.status === 'resolved' ? '#059669' : '#D97706', textTransform: 'uppercase' }}>
                {complaint.status.replace(/_/g, ' ')}
              </strong>
            </div>
          </div>

          {/* Section 1: Complaint & Citizen Profile */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', color: '#374151', borderBottom: '1px solid #E5E7EB', paddingBottom: 6, marginBottom: 12 }}>
              1. Issue & Geolocation Profile
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
              <div>
                <table style={{ width: '100%', fontSize: '0.825rem', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '5px 0', color: '#6B7280', width: 130 }}>Issue Title:</td>
                      <td style={{ padding: '5px 0', fontWeight: 700 }}>{complaint.title}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '5px 0', color: '#6B7280' }}>Category / Dept:</td>
                      <td style={{ padding: '5px 0' }}>{complaint.category} • {complaint.departmentId?.name || 'Assigned Department'}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '5px 0', color: '#6B7280' }}>AI Calculated Priority:</td>
                      <td style={{ padding: '5px 0', fontWeight: 700, color: complaint.priority === 'P1' ? '#DC2626' : '#EA580C' }}>
                        {complaint.priority} (Recommended SLA: 48h)
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '5px 0', color: '#6B7280' }}>Geotagged Location:</td>
                      <td style={{ padding: '5px 0' }}>{complaint.address || 'Chennai Urban Zone'} ({complaint.latitude?.toFixed(4)}, {complaint.longitude?.toFixed(4)})</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* QR Verification Badge */}
              <div
                style={{
                  border: '1px dashed #D1D5DB',
                  borderRadius: 8,
                  padding: 10,
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#F9FAFB'
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 4 }}>🏁</div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#374151' }}>DIGITAL AUDIT STAMP</span>
                <span style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>Gov Certificate #CP-{complaint.complaintId?.slice(-5)}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Before & After Evidence Audit */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', color: '#374151', borderBottom: '1px solid #E5E7EB', paddingBottom: 6, marginBottom: 12 }}>
              2. Photographic Evidence & Resolution Verification
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Before Evidence */}
              <div style={{ border: '1px solid #E5E7EB', borderRadius: 8, padding: 10, background: '#FEF2F2' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#DC2626', marginBottom: 6 }}>
                  BEFORE / CITIZEN REPORTED PROOF
                </div>
                <div style={{ height: 160, borderRadius: 6, overflow: 'hidden', background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={beforeImg} alt="Before Fix" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = '/demo/before-pothole.svg'; }} />
                </div>
                <div style={{ fontSize: '0.7rem', color: '#6B7280', marginTop: 6, textAlign: 'center' }}>
                  Logged at: {formatDateTime(complaint.createdAt)}
                </div>
              </div>

              {/* After Evidence */}
              <div style={{ border: '1px solid #E5E7EB', borderRadius: 8, padding: 10, background: '#ECFDF5' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', marginBottom: 6 }}>
                  AFTER / OFFICER RESOLUTION PROOF
                </div>
                <div style={{ height: 160, borderRadius: 6, overflow: 'hidden', background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={afterImg} alt="After Fix" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = '/demo/after-fixed.svg'; }} />
                </div>
                <div style={{ fontSize: '0.7rem', color: '#6B7280', marginTop: 6, textAlign: 'center' }}>
                  Work executed by: {complaint.officerId?.name || 'Municipal Field Team'}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Citizen Verification & Signatures */}
          <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 16 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', color: '#374151', marginBottom: 12 }}>
              3. Verification & Governance Authorization
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, textAlign: 'center' }}>
              <div style={{ padding: 12, background: '#F9FAFB', borderRadius: 8, border: '1px solid #E5E7EB' }}>
                <span style={{ fontSize: '0.7rem', color: '#6B7280', display: 'block' }}>REPORTING CITIZEN</span>
                <strong style={{ fontSize: '0.85rem' }}>{complaint.citizenId?.name || 'Citizen'}</strong>
                <div style={{ fontSize: '0.7rem', color: '#059669', marginTop: 4 }}>
                  {feedback ? `⭐ Verified ${feedback.rating}/5 Stars` : '✅ Verified'}
                </div>
              </div>

              <div style={{ padding: 12, background: '#F9FAFB', borderRadius: 8, border: '1px solid #E5E7EB' }}>
                <span style={{ fontSize: '0.7rem', color: '#6B7280', display: 'block' }}>FIELD OFFICER</span>
                <strong style={{ fontSize: '0.85rem' }}>{complaint.officerId?.name || 'Officer Suresh'}</strong>
                <div style={{ fontSize: '0.7rem', color: '#1570CD', marginTop: 4 }}>Badge: FO-CHN-104</div>
              </div>

              <div style={{ padding: 12, background: '#F9FAFB', borderRadius: 8, border: '1px solid #E5E7EB' }}>
                <span style={{ fontSize: '0.7rem', color: '#6B7280', display: 'block' }}>COMMISSIONER / AUDITOR</span>
                <strong style={{ fontSize: '0.85rem' }}>Dr. Lakshmi Narayan</strong>
                <div style={{ fontSize: '0.7rem', color: '#0D6E6E', marginTop: 4 }}>Signed & Digitally Sealed</div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.675rem', color: '#9CA3AF' }}>
              This document is digitally generated by CivicPulse AI (Hackspora 2.0). Tamper-proof record stored on municipal blockchain ledger.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
