import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle2, AlertTriangle, Shield } from 'lucide-react';

export default function Terms() {
  return (
    <div className="fade-in" style={{ minHeight: '100vh', background: 'var(--gray-50)', paddingBottom: 60 }}>
      {/* Header */}
      <header style={{ background: '#0f172a', padding: '16px 24px', color: 'white' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'white' }}>
            <div style={{ width: 36, height: 36, background: 'var(--teal-500)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16 }}>CP</div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>CivicPulse AI</span>
          </Link>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: '0.9rem' }}>
            <Link to="/privacy" style={{ color: 'var(--gray-300)', textDecoration: 'none' }}>Privacy Policy</Link>
            <Link to="/login" className="btn btn-teal btn-sm">Sign In</Link>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '40px auto', padding: '0 20px' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--gray-500)', marginBottom: 20, fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Return to Home
        </Link>

        <div className="card" style={{ padding: 36, background: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--teal-600)', marginBottom: 12 }}>
            <FileText size={24} />
            <span style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.85rem' }}>Platform User Agreement</span>
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: 16 }}>Terms & Conditions</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: 28, borderBottom: '1px solid var(--gray-200)', paddingBottom: 16 }}>
            Last Updated: September 2026 | Standard Usage Terms for CivicPulse AI Service
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, lineHeight: 1.6, color: 'var(--gray-700)', fontSize: '0.95rem' }}>
            <section>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>1. Acceptable Use</h3>
              <p>
                CivicPulse AI is a platform designed for reporting public civic maintenance issues (such as potholes, water leaks, non-functional streetlights, garbage accumulation, and drainage overflows). Users agree to submit accurate, truthful information in good faith.
              </p>
            </section>

            <section>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>2. User Responsibilities & Content Accuracy</h3>
              <p>When reporting an issue or updating profile data, citizens and officers agree that:</p>
              <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                <li>All uploaded photos represent genuine civic issues or field work resolutions.</li>
                <li>Location information and addresses are submitted accurately to assist department routing.</li>
                <li>Users will not submit spam, abusive, offensive, or fraudulent reports.</li>
              </ul>
            </section>

            <section>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>3. Non-Emergency Scope Limitation</h3>
              <p>
                CivicPulse AI is NOT intended for life-threatening emergencies, fire, police, or medical crises. For immediate emergency dispatch, users must dial <strong>112</strong> or local emergency services directly.
              </p>
            </section>

            <section>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>4. Account Roles & Security</h3>
              <p>
                Public sign-ups receive Citizen access. Field Officer credentials and Admin permits are issued through municipal administrative authorization. Users are responsible for keeping login credentials secure.
              </p>
            </section>

            <section>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>5. Service Availability & Modifications</h3>
              <p>
                CivicPulse AI reserves the right to modify, update, or maintain system features to enhance civic complaint workflows and security protocols.
              </p>
            </section>

            <section>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>6. Contact Information</h3>
              <p>
                For questions regarding terms of service, contact <strong style={{ color: 'var(--teal-700)' }}>legal@civicpulse.org</strong>.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
