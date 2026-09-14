import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, FileText } from 'lucide-react';

export default function Privacy() {
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
            <Link to="/terms" style={{ color: 'var(--gray-300)', textDecoration: 'none' }}>Terms & Conditions</Link>
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
            <Shield size={24} />
            <span style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.85rem' }}>Data Protection & Transparency</span>
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: 16 }}>Privacy Policy</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: 28, borderBottom: '1px solid var(--gray-200)', paddingBottom: 16 }}>
            Last Updated: September 2026 | Effective for CivicPulse AI Citizens, Field Officers & Municipal Authorities
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, lineHeight: 1.6, color: 'var(--gray-700)', fontSize: '0.95rem' }}>
            <section>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>1. Information We Collect</h3>
              <p>When you interact with the CivicPulse AI platform, we collect the following categories of information necessary to process civic complaints and deliver municipal services:</p>
              <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                <li><strong>Account Data:</strong> Full name, email address, phone number (+91 format), district, and assigned local ward/area.</li>
                <li><strong>Complaint Data:</strong> Issue titles, descriptions, categories (e.g. Roads, Water, Streetlights, Garbage), and severity classifications.</li>
                <li><strong>Uploaded Media:</strong> Photos or evidence files uploaded to substantiate civic issues or work order resolutions.</li>
                <li><strong>Location Information:</strong> Geolocation GPS coordinates (latitude/longitude), address, and selected municipal ward.</li>
                <li><strong>Authentication Logs:</strong> Encrypted passwords (hashed with bcrypt), JWT authorization tokens, and Google OAuth tokens.</li>
              </ul>
            </section>

            <section>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>2. How Information is Used</h3>
              <p>The information collected is strictly used to fulfill core municipal resolution workflows:</p>
              <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                <li>Routing complaints to responsible municipal departments and field officers.</li>
                <li>Displaying issue status and location on interactive city maps for public transparency.</li>
                <li>Calculating AI severity scores and tracking SLA resolution deadlines.</li>
                <li>Sending notification updates to citizens regarding complaint progress.</li>
              </ul>
            </section>

            <section>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>3. Data Security & Storage</h3>
              <p>
                We implement industry-standard encryption protocols (SSL/TLS for data in transit) and bcrypt hashing for passwords stored in the database. JWT session tokens are stored securely in the client browser.
              </p>
            </section>

            <section>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>4. Data Sharing & Third Parties</h3>
              <p>
                CivicPulse AI does not sell, rent, or trade personal data to advertising companies. Information is shared strictly with authorized municipal officers and department personnel responsible for civic maintenance.
              </p>
            </section>

            <section>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>5. User Rights & Profile Control</h3>
              <p>
                Citizens can view, edit, or update their personal account information, phone number, ward location, profile picture, or password anytime via the User Profile page.
              </p>
            </section>

            <section>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>6. Contact Privacy Officer</h3>
              <p>
                For privacy inquiries or data requests, contact our Privacy Desk at <strong style={{ color: 'var(--teal-700)' }}>privacy@civicpulse.org</strong>.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
