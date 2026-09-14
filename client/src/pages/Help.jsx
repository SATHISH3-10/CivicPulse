import { Link } from 'react-router-dom';
import { ArrowLeft, HelpCircle, CheckCircle2, MapPin, Camera, Clock, Shield, Search, UserCheck } from 'lucide-react';

export default function Help() {
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
            <Link to="/contact" style={{ color: 'var(--gray-300)', textDecoration: 'none' }}>Contact Us</Link>
            <Link to="/login" className="btn btn-teal btn-sm">Sign In</Link>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1000, margin: '40px auto', padding: '0 20px' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--gray-500)', marginBottom: 20, fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Return to Home
        </Link>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: 8 }}>Help & Troubleshooting Center</h1>
          <p style={{ color: 'var(--gray-600)', fontSize: '1rem', margin: 0 }}>
            Learn how to use CivicPulse AI to report issues, track resolutions, and manage municipal work orders.
          </p>
        </div>

        {/* Guides Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 32 }}>
          {/* Guide 1 */}
          <div className="card" style={{ padding: 24, background: 'white' }}>
            <div style={{ width: 44, height: 44, background: 'var(--teal-50)', color: 'var(--teal-600)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <UserCheck size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>Creating an Account & Login</h3>
            <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', lineHeight: 1.5 }}>
              Click <strong>Register as Citizen</strong> to create an account with your Name, Email, Phone (+91), and Ward Area. You can also sign in instantly using <strong>Continue with Google</strong>.
            </p>
          </div>

          {/* Guide 2 */}
          <div className="card" style={{ padding: 24, background: 'white' }}>
            <div style={{ width: 44, height: 44, background: 'var(--teal-50)', color: 'var(--teal-600)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Camera size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>Reporting a Civic Issue</h3>
            <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', lineHeight: 1.5 }}>
              In your Citizen Dashboard, click <strong>Report Issue</strong>. Upload photo evidence, specify the category (Roads, Water, Streetlights, Garbage), and enter the location.
            </p>
          </div>

          {/* Guide 3 */}
          <div className="card" style={{ padding: 24, background: 'white' }}>
            <div style={{ width: 44, height: 44, background: 'var(--teal-50)', color: 'var(--teal-600)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Clock size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>Tracking SLA & Progress</h3>
            <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', lineHeight: 1.5 }}>
              Track the status of reported issues in <strong>My Complaints</strong>. Watch live SLA timers (Submitted ➔ AI Analyzed ➔ Officer Assigned ➔ In Progress ➔ Resolved).
            </p>
          </div>

          {/* Guide 4 */}
          <div className="card" style={{ padding: 24, background: 'white' }}>
            <div style={{ width: 44, height: 44, background: 'var(--teal-50)', color: 'var(--teal-600)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <MapPin size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>GPS Location & City Map</h3>
            <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', lineHeight: 1.5 }}>
              Use <strong>Locate My Position</strong> on the interactive map to center GPS coordinates, or view active issue markers across municipal wards.
            </p>
          </div>
        </div>

        {/* Troubleshooting Section */}
        <div className="card" style={{ padding: 28, background: 'white' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <HelpCircle size={22} style={{ color: 'var(--teal-600)' }} /> Frequently Asked Questions & Troubleshooting
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <details style={{ border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', padding: 14 }}>
              <summary style={{ fontWeight: 700, color: 'var(--gray-900)', cursor: 'pointer' }}>I am unable to sign in with my password</summary>
              <div style={{ marginTop: 8, fontSize: '0.875rem', color: 'var(--gray-600)', lineHeight: 1.5 }}>
                Ensure your email address is registered first. If you forgot your password, click <strong>Forgot password?</strong> on the Login page and enter your email address to receive a password reset link.
              </div>
            </details>

            <details style={{ border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', padding: 14 }}>
              <summary style={{ fontWeight: 700, color: 'var(--gray-900)', cursor: 'pointer' }}>How do Field Officers get assigned to issues?</summary>
              <div style={{ marginTop: 8, fontSize: '0.875rem', color: 'var(--gray-600)', lineHeight: 1.5 }}>
                Municipal Admins grant Field Officer credentials to qualified personnel. Assigned officers receive work orders based on department domain (Roads, Water, Electrical, Sanitation) and patrol border jurisdiction.
              </div>
            </details>

            <details style={{ border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', padding: 14 }}>
              <summary style={{ fontWeight: 700, color: 'var(--gray-900)', cursor: 'pointer' }}>Can I log in using both Google and Email Password?</summary>
              <div style={{ marginTop: 8, fontSize: '0.875rem', color: 'var(--gray-600)', lineHeight: 1.5 }}>
                Yes! If you registered using Google sign-in, you can open your Profile, click <strong>Edit Profile</strong>, and set a custom password under <em>Manual Sign-In Password Setup</em>.
              </div>
            </details>
          </div>
        </div>
      </main>
    </div>
  );
}
