import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Eye, EyeOff, ArrowLeft, User, Shield, MapPin, Sparkles } from 'lucide-react';

const DISTRICTS = [
  'Chennai',
  'Coimbatore',
  'Madurai',
  'Tiruchirappalli',
  'Salem',
  'Tirunelveli',
  'Erode',
  'Vellore',
  'Kanchipuram',
  'Thanjavur',
  'Chengalpattu'
];

const CHENNAI_AREAS = [
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
  'Vadapalani'
];

export default function Register() {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    district: 'Chennai',
    area: 'Anna Nagar'
  });

  const update = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      addToast('Please fill in name, email, and password', 'warning');
      return;
    }
    if (form.password.length < 6) {
      addToast('Password must be at least 6 characters', 'warning');
      return;
    }
    if (form.password !== form.confirmPassword) {
      addToast('Passwords do not match', 'warning');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: 'citizen', // All public sign-ups are strictly registered as Citizen
        district: form.district,
        area: form.area
      };

      const user = await register(payload);
      addToast(`Account created as Citizen! Welcome, ${user.name}`, 'success');
      navigate('/citizen');
    } catch (err) {
      addToast(err.response?.data?.error || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page" style={{ padding: '40px 20px', minHeight: '100vh' }}>
      <div className="auth-card fade-in" style={{ maxWidth: 540, width: '100%' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.875rem',
            color: 'var(--gray-500)',
            marginBottom: 20
          }}
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>

        {/* Branding */}
        <div className="auth-brand" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
            <div
              style={{
                width: 42,
                height: 42,
                background: 'var(--teal-500)',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 800,
                fontSize: 20
              }}
            >
              CP
            </div>
            <h1 style={{ fontSize: '1.75rem', margin: 0 }}>Join CivicPulse AI</h1>
          </div>
          <p style={{ margin: 0, color: 'var(--gray-500)', fontSize: '0.9rem' }}>
            Register your Citizen account to report civic issues and track resolution live
          </p>
        </div>

        {/* Informational Banner */}
        <div
          style={{
            background: 'var(--teal-50)',
            border: '1px solid var(--teal-200)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: '0.85rem',
            color: 'var(--teal-800)'
          }}
        >
          <Sparkles size={20} style={{ color: 'var(--teal-600)', flexShrink: 0 }} />
          <div>
            <strong>Citizen Registration Path:</strong> All new web accounts start as Citizens. Field Officer credentials are granted via Municipal Admin permit approval.
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">
                Full Name <span style={{ color: 'var(--error-500)' }}>*</span>
              </label>
              <input
                id="reg-name"
                type="text"
                className="form-control"
                placeholder="e.g. Anitha Sundaram"
                value={form.name}
                onChange={update('name')}
                required
              />
            </div>

            {/* Email + Phone Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">
                  Email Address <span style={{ color: 'var(--error-500)' }}>*</span>
                </label>
                <input
                  id="reg-email"
                  type="email"
                  className="form-control"
                  placeholder="anitha@example.com"
                  value={form.email}
                  onChange={update('email')}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-phone">Phone Number</label>
                <input
                  id="reg-phone"
                  type="tel"
                  className="form-control"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={update('phone')}
                />
              </div>
            </div>

            {/* Location Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-district">City / District</label>
                <select
                  id="reg-district"
                  className="form-control"
                  value={form.district}
                  onChange={update('district')}
                >
                  {DISTRICTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-area">Local Ward / Area</label>
                <select
                  id="reg-area"
                  className="form-control"
                  value={form.area}
                  onChange={update('area')}
                >
                  {CHENNAI_AREAS.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">
                  Password <span style={{ color: 'var(--error-500)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="At least 6 characters"
                    value={form.password}
                    onChange={update('password')}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--gray-400)',
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-confirm">
                  Confirm Password <span style={{ color: 'var(--error-500)' }}>*</span>
                </label>
                <input
                  id="reg-confirm"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={update('confirmPassword')}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-teal btn-lg"
              disabled={loading}
              style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}
            >
              {loading ? 'Creating Account...' : 'Create Citizen Account'}
            </button>
          </div>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: '0.875rem', color: 'var(--gray-600)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary-600)', fontWeight: 700 }}>
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
