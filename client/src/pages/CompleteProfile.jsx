import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, getRoleDashboard } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { User, Phone, MapPin, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { formatIndianPhone } from '../components/shared.jsx';

const TAMIL_NADU_AREAS = [
  'Anna Nagar',
  'T. Nagar',
  'Adyar',
  'Velachery',
  'Mylapore',
  'Guindy',
  'Tambaram',
  'Chromepet',
  'Porur',
  'Egmore',
  'Nungambakkam',
  'Ashok Nagar',
  'KK Nagar',
  'Besant Nagar',
  'Vadapalani',
  'Other'
];

const DISTRICTS = [
  'Chennai',
  'Coimbatore',
  'Madurai',
  'Salem',
  'Tiruchirappalli',
  'Tirunelveli',
  'Erode',
  'Vellore',
  'Thanjavur',
  'Kanchipuram'
];

export default function CompleteProfile() {
  const { user, completeProfile } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const nameParts = (user?.name || '').trim().split(' ');
  const defaultFirst = user?.firstName || nameParts[0] || '';
  const defaultLast = user?.lastName || nameParts.slice(1).join(' ') || '';

  const [form, setForm] = useState({
    firstName: defaultFirst,
    lastName: defaultLast,
    phone: formatIndianPhone(user?.phone || ''),
    district: user?.district || 'Chennai',
    area: user?.area || ''
  });

  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === 'phone') {
      setForm(prev => ({ ...prev, phone: formatIndianPhone(value) }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.firstName.trim()) {
      addToast('Please enter your First Name', 'warning');
      return;
    }
    if (!form.lastName.trim()) {
      addToast('Please enter your Last Name', 'warning');
      return;
    }
    const cleanPhone = form.phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      addToast('Please enter a valid 10-digit Phone Number', 'warning');
      return;
    }
    if (!form.area) {
      addToast('Please select your Local Ward / Area', 'warning');
      return;
    }

    setLoading(true);
    try {
      const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`;
      const updatedUser = await completeProfile({
        name: fullName,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone,
        district: form.district,
        city: form.district,
        area: form.area
      });

      addToast('Profile completed successfully! Welcome to CivicPulse AI.', 'success');
      
      const target = location.state?.from?.pathname || getRoleDashboard(updatedUser?.role || user?.role || 'citizen');
      navigate(target, { replace: true });
    } catch (err) {
      console.error('Complete profile submit error:', err);
      addToast(err.response?.data?.error || err.message || 'Failed to complete profile', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page" style={{ padding: '40px 20px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="auth-card fade-in" style={{ maxWidth: 560, padding: '36px 32px', width: '100%' }}>
        
        {/* Brand Header */}
        <div className="auth-brand" style={{ marginBottom: 24, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
            <img src="/logo.jpg" alt="CivicPulse Logo" style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover', boxShadow: 'var(--shadow-md)' }} />
            <h1 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 800, color: 'var(--gray-900)' }}>CivicPulse AI</h1>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--teal-800)', margin: '0 0 6px 0' }}>
            Complete Your Profile
          </h2>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--gray-600)' }}>
            Google authentication verified. Please complete your citizen profile details to continue to your dashboard.
          </p>
        </div>

        {/* Verified Google Account Banner */}
        <div style={{ background: 'var(--teal-50)', border: '1px solid var(--teal-200)', borderRadius: 'var(--radius-md)', padding: '14px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <ShieldCheck size={24} style={{ color: 'var(--teal-600)', flexShrink: 0 }} />
          <div style={{ fontSize: '0.85rem', color: 'var(--teal-900)' }}>
            <div style={{ fontWeight: 700, marginBottom: 2 }}>Verified Google Account</div>
            <div style={{ color: 'var(--teal-800)', wordBreak: 'break-all' }}>
              <strong>{user?.email}</strong> is set as your verified login email.
            </div>
          </div>
        </div>

        {/* Profile Completion Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            {/* First Name */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="setup-firstname">
                First Name <span style={{ color: 'var(--error-500)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', pointerEvents: 'none' }} />
                <input
                  id="setup-firstname"
                  name="firstName"
                  className="form-control"
                  type="text"
                  placeholder="e.g. Sathish"
                  value={form.firstName}
                  onChange={handleChange}
                  style={{ paddingLeft: 42 }}
                  required
                />
              </div>
            </div>

            {/* Last Name */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="setup-lastname">
                Last Name <span style={{ color: 'var(--error-500)' }}>*</span>
              </label>
              <input
                id="setup-lastname"
                name="lastName"
                className="form-control"
                type="text"
                placeholder="e.g. Kumar"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label" htmlFor="setup-phone">
              Phone Number <span style={{ color: 'var(--error-500)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', pointerEvents: 'none' }} />
              <input
                id="setup-phone"
                name="phone"
                className="form-control"
                type="tel"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={handleChange}
                style={{ paddingLeft: 42 }}
                required
              />
            </div>
            <small style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginTop: 4, display: 'block' }}>
              Used for municipal update notifications and resolution SMS.
            </small>
          </div>

          {/* District */}
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label" htmlFor="setup-district">
              City / District <span style={{ color: 'var(--error-500)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <MapPin size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', pointerEvents: 'none' }} />
              <select
                id="setup-district"
                name="district"
                className="form-control"
                value={form.district}
                onChange={handleChange}
                style={{ paddingLeft: 42 }}
                required
              >
                {DISTRICTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Local Area / Ward */}
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label" htmlFor="setup-area">
              Assigned Area / Local Ward <span style={{ color: 'var(--error-500)' }}>*</span>
            </label>
            <select
              id="setup-area"
              name="area"
              className="form-control"
              value={form.area}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Your Ward / Area --</option>
              {TAMIL_NADU_AREAS.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            <small style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginTop: 4, display: 'block' }}>
              Maps your account to local field officers and municipal departments.
            </small>
          </div>

          <div style={{ background: 'var(--gray-50)', padding: 14, borderRadius: 'var(--radius-md)', marginBottom: 24, border: '1px solid var(--gray-200)', fontSize: '0.8rem', color: 'var(--gray-600)' }}>
            💡 <strong>Security Note:</strong> Your primary login method is Google OAuth. You can optionally create an Email + Password credential anytime from your Account Settings.
          </div>

          <button className="btn btn-teal btn-lg w-full" type="submit" disabled={loading} style={{ justifyContent: 'center', gap: 10 }}>
            {loading ? (
              <span>Saving Profile...</span>
            ) : (
              <>
                <span>Save Profile & Continue to Dashboard</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
