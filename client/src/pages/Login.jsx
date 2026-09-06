import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, getRoleDashboard } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Eye, EyeOff, ArrowLeft, User, Wrench, Building2, ChevronRight, RotateCcw } from 'lucide-react';

export default function Login() {
  const { user, isAuthenticated, login, loginWithGoogle, signInWithGoogleOAuth } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // If user is already authenticated, redirect to their authorized role dashboard
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      navigate(getRoleDashboard(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Selected role state: null initially (step 1), or 'citizen' | 'officer' | 'admin' (step 2)
  const [selectedRole, setSelectedRole] = useState(null);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const googleButtonRef = useRef(null);
  const selectedRoleRef = useRef(selectedRole);

  useEffect(() => {
    selectedRoleRef.current = selectedRole;
  }, [selectedRole]);

  const roleMeta = {
    citizen: {
      title: 'Citizen',
      icon: '👤',
      color: 'var(--teal-500)',
      bg: 'var(--teal-50)',
      demoEmail: 'citizen@civicpulse.demo',
      desc: 'Report civic issues, track resolution progress & view live maps'
    },
    officer: {
      title: 'Field Officer',
      icon: '🔧',
      color: 'var(--primary-600)',
      bg: 'var(--primary-50)',
      demoEmail: 'officer@civicpulse.demo',
      desc: 'Resolve assigned ward complaints & update field work evidence'
    },
    admin: {
      title: 'Municipal Admin',
      icon: '🏛️',
      color: '#7c3aed',
      bg: '#f5f3ff',
      demoEmail: 'admin@civicpulse.demo',
      desc: 'Municipal authority dashboard, analytics & officer dispatch'
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) {
      addToast('Please fill in all fields', 'warning');
      return;
    }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      addToast(`Welcome back, ${user.name}!`, 'success');
      navigate(getRoleDashboard(user.role));
    } catch (err) {
      addToast(err.response?.data?.error || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin(email) {
    setForm({ email, password: 'password123' });
    setLoading(true);
    try {
      const user = await login(email, 'password123');
      addToast(`Welcome, ${user.name}! (Demo Mode)`, 'success');
      navigate(getRoleDashboard(user.role));
    } catch (err) {
      addToast(err.response?.data?.error || 'Demo login failed. Please verify seed data.', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!googleButtonRef.current) return undefined;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      return undefined;
    }

    let cancelled = false;

    const initializeGoogleButton = () => {
      if (cancelled || !window.google?.accounts?.id || !googleButtonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          setLoading(true);
          try {
            const user = await loginWithGoogle(
              response.credential,
              selectedRoleRef.current || 'citizen'
            );
            addToast(`Welcome, ${user.name}!`, 'success');
            navigate(getRoleDashboard(user.role));
          } catch (err) {
            console.error('Google login error:', err);
            addToast(err.message || 'Google login failed', 'error');
          } finally {
            if (!cancelled) setLoading(false);
          }
        }
      });

      googleButtonRef.current.replaceChildren();
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        width: Math.min(404, Math.floor(googleButtonRef.current.getBoundingClientRect().width || 360))
      });
      setGoogleError('');
    };

    if (window.google?.accounts?.id) {
      initializeGoogleButton();
    } else {
      const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      script?.addEventListener('load', initializeGoogleButton, { once: true });
    }

    return () => {
      cancelled = true;
    };
  }, [addToast, loginWithGoogle, navigate, selectedRole]);

  return (
    <div className="auth-page">
      <div className="auth-card fade-in" style={{ maxWidth: 460, padding: '32px 28px' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: 20 }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>

        {/* Brand Header */}
        <div className="auth-brand" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 44, height: 44, background: 'var(--teal-500)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 20, boxShadow: 'var(--shadow-md)' }}>CP</div>
            <h1 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 800 }}>CivicPulse AI</h1>
          </div>

          {!selectedRole ? (
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '12px 0 4px 0', color: 'var(--gray-900)' }}>
                Select Your Account Type
              </h2>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                Choose how you want to sign in to CivicPulse
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, background: roleMeta[selectedRole].bg, padding: '10px 14px', borderRadius: 'var(--radius-md)', border: `1px solid ${roleMeta[selectedRole].color}33` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.3rem' }}>{roleMeta[selectedRole].icon}</span>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: roleMeta[selectedRole].color }}>Login Role Selected</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--gray-900)' }}>{roleMeta[selectedRole].title}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRole(null)}
                style={{ background: 'white', border: '1px solid var(--gray-300)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-700)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <RotateCcw size={12} /> Change
              </button>
            </div>
          )}
        </div>

        {/* STEP 1: ROLE SELECTION CARDS */}
        {!selectedRole ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="fade-in">
            {/* Citizen Role Option */}
            <div
              onClick={() => setSelectedRole('citizen')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: 16,
                borderRadius: 'var(--radius-md)',
                border: '2px solid var(--gray-200)',
                background: 'var(--gray-50)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: 'var(--shadow-xs)'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--teal-500)'; e.currentTarget.style.background = 'var(--teal-50)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.background = 'var(--gray-50)'; }}
            >
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--teal-100)', color: 'var(--teal-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                👤
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--gray-900)' }}>
                  Login as <strong>Citizen</strong>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)', marginTop: 2 }}>
                  {roleMeta.citizen.desc}
                </div>
              </div>
              <ChevronRight size={20} style={{ color: 'var(--gray-400)' }} />
            </div>

            {/* Field Officer Role Option */}
            <div
              onClick={() => setSelectedRole('officer')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: 16,
                borderRadius: 'var(--radius-md)',
                border: '2px solid var(--gray-200)',
                background: 'var(--gray-50)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: 'var(--shadow-xs)'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-500)'; e.currentTarget.style.background = 'var(--primary-50)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.background = 'var(--gray-50)'; }}
            >
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--primary-100)', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                🔧
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--gray-900)' }}>
                  Login as <strong>Field Officer</strong>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)', marginTop: 2 }}>
                  {roleMeta.officer.desc}
                </div>
              </div>
              <ChevronRight size={20} style={{ color: 'var(--gray-400)' }} />
            </div>

            {/* Admin Role Option */}
            <div
              onClick={() => setSelectedRole('admin')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: 16,
                borderRadius: 'var(--radius-md)',
                border: '2px solid var(--gray-200)',
                background: 'var(--gray-50)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: 'var(--shadow-xs)'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.background = '#f5f3ff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.background = 'var(--gray-50)'; }}
            >
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#ede9fe', color: '#6d28d9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                🏛️
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--gray-900)' }}>
                  Login as <strong>Admin</strong>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)', marginTop: 2 }}>
                  {roleMeta.admin.desc}
                </div>
              </div>
              <ChevronRight size={20} style={{ color: 'var(--gray-400)' }} />
            </div>

            {/* Direct Google Sign-In on Step 1 */}
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, height: 1, background: 'var(--gray-200)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase' }}>or sign in directly</span>
                <div style={{ flex: 1, height: 1, background: 'var(--gray-200)' }} />
              </div>

              <div
                id="googleBtn"
                ref={googleButtonRef}
                style={{ display: 'flex', justifyContent: 'center', minHeight: 40 }}
              />
            </div>
          </div>
        ) : (
          /* STEP 2: EMAIL & PASSWORD FORM FOR SELECTED ROLE */
          <div className="fade-in">

            {/* Email & Password Form */}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email or Username</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="form-input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    style={{ paddingRight: 44 }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', color: 'var(--gray-600)', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked /> Remember me
                </label>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    addToast('For password reset, please contact your municipal administrator or check your registered email.', 'info');
                  }}
                  style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.875rem', color: 'var(--teal-600)', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Forgot password?
                </button>
              </div>

              <button className="btn btn-primary btn-lg w-full" type="submit" disabled={loading} style={{ background: roleMeta[selectedRole].color, borderColor: roleMeta[selectedRole].color }}>
                {loading ? 'Signing in...' : `Sign In as ${roleMeta[selectedRole].title}`}
              </button>

              {/* Google login option */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0 12px' }}>
                <div style={{ flex: 1, height: 1, background: 'var(--gray-200)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase' }}>or</span>
                <div style={{ flex: 1, height: 1, background: 'var(--gray-200)' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div
                  id="googleBtn"
                  ref={googleButtonRef}
                  style={{ display: 'flex', justifyContent: 'center', minHeight: 40 }}
                />
              </div>

              {googleError && (
                <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: 'var(--danger-600, #dc2626)', textAlign: 'center' }}>
                  {googleError}
                </p>
              )}
            </form>

            {/* Demo One-Click Login Button for Selected Role */}
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px dashed var(--gray-300)' }}>
              <button
                type="button"
                onClick={() => handleDemoLogin(roleMeta[selectedRole].demoEmail)}
                className="demo-btn"
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center', gap: 8, background: 'var(--gray-100)', color: 'var(--gray-800)', border: '1px solid var(--gray-300)' }}
              >
                ⚡ Quick Demo Login as <strong>{roleMeta[selectedRole].title}</strong>
              </button>
            </div>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.875rem', color: 'var(--gray-500)' }}>
          Don't have an account? <Link to="/register" style={{ fontWeight: 600 }}>Register</Link>
        </p>
      </div>
    </div>
  );
}
