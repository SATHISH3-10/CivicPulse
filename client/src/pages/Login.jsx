import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, getRoleDashboard } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Eye, EyeOff, ArrowLeft, Mail, Lock } from 'lucide-react';
import { signInWithGoogleOAuth } from '../lib/supabase.js';

export default function Login() {
  const { user, isAuthenticated, login, loginWithGoogle } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // If user is already authenticated, redirect to their authorized role dashboard
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      navigate(getRoleDashboard(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const googleButtonRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) {
      addToast('Please enter both email address and password', 'warning');
      return;
    }
    setLoading(true);
    try {
      const loggedUser = await login(form.email, form.password);
      addToast(`Welcome back, ${loggedUser.name}!`, 'success');
      navigate(getRoleDashboard(loggedUser.role));
    } catch (err) {
      addToast(err.response?.data?.error || 'Invalid email or password', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!googleButtonRef.current) return undefined;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return undefined;

    let cancelled = false;

    const initializeGoogleButton = () => {
      if (cancelled || !window.google?.accounts?.id || !googleButtonRef.current) return;

      if (!window._gsiInitialized) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            setLoading(true);
            try {
              const loggedUser = await loginWithGoogle(response.credential);
              addToast(`Welcome back, ${loggedUser.name}!`, 'success');
              navigate(getRoleDashboard(loggedUser.role));
            } catch (err) {
              console.error('Google login error:', err);
              addToast(err.message || 'Google login failed', 'error');
            } finally {
              if (!cancelled) setLoading(false);
            }
          }
        });
        window._gsiInitialized = true;
      }

      googleButtonRef.current.replaceChildren();
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        width: Math.min(400, Math.floor(googleButtonRef.current.getBoundingClientRect().width || 360))
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
  }, [addToast, loginWithGoogle, navigate]);

  return (
    <div className="auth-page" style={{ padding: '40px 20px', minHeight: '100vh' }}>
      <div className="auth-card fade-in" style={{ maxWidth: 450, padding: '36px 32px', width: '100%' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: 20 }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>

        {/* Brand Header */}
        <div className="auth-brand" style={{ marginBottom: 24, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 44, height: 44, background: 'var(--teal-500)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 20, boxShadow: 'var(--shadow-md)' }}>CP</div>
            <h1 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 800, color: 'var(--gray-900)' }}>CivicPulse AI</h1>
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--gray-500)' }}>
            Sign in to access your civic account portal
          </p>
        </div>

        {/* Google Sign-In Container & OAuth Fallback */}
        <div style={{ marginBottom: 20 }}>
          <div
            id="googleBtn"
            ref={googleButtonRef}
            style={{ display: 'flex', justifyContent: 'center', minHeight: 40 }}
          />
          <button
            type="button"
            className="btn btn-secondary w-full"
            onClick={async () => {
              setLoading(true);
              try {
                await signInWithGoogleOAuth();
              } catch (err) {
                addToast(err.message || 'Google OAuth redirect failed', 'error');
                setLoading(false);
              }
            }}
            style={{ marginTop: 8, justifyContent: 'center', gap: 8, fontSize: '0.875rem' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Continue with Google OAuth
          </button>
        </div>

        {/* Quick Email Selection Bar */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-500)', marginBottom: 6, textTransform: 'uppercase' }}>Quick Login Shortcuts:</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.75rem', padding: '4px 8px', border: '1px solid var(--gray-300)' }}
              onClick={() => setForm({ email: 'sathishm.ug.24.it@francisxavier.ac.in', password: 'password123' })}
            >
              👤 Citizen
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.75rem', padding: '4px 8px', border: '1px solid var(--gray-300)' }}
              onClick={() => setForm({ email: 'sathish.kurmbur2006@gmail.com', password: 'password123' })}
            >
              🛡️ Officer
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.75rem', padding: '4px 8px', border: '1px solid var(--gray-300)' }}
              onClick={() => setForm({ email: 'thiruvengadasuburamaninan@gmail.com', password: 'password123' })}
            >
              🏛️ Admin
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--gray-200)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase' }}>or sign in with email</span>
          <div style={{ flex: 1, height: 1, background: 'var(--gray-200)' }} />
        </div>

        {/* Standard Email/Password Form */}
        <form onSubmit={handleSubmit}>
          {/* Email Input Box */}
          <div className="form-group" style={{ marginBottom: 18 }}>
            <label className="form-label" htmlFor="login-email">
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--gray-400)',
                  pointerEvents: 'none'
                }}
              />
              <input
                id="login-email"
                className="form-control"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                style={{ paddingLeft: 42 }}
                required
              />
            </div>
          </div>

          {/* Password Input Box */}
          <div className="form-group" style={{ marginBottom: 18 }}>
            <label className="form-label" htmlFor="login-password">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--gray-400)',
                  pointerEvents: 'none'
                }}
              />
              <input
                id="login-password"
                className="form-control"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                style={{ paddingLeft: 42, paddingRight: 44 }}
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
                  cursor: 'pointer',
                  padding: 4
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--gray-600)', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked /> Remember me
            </label>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                addToast('Password reset link sent to your email address.', 'info');
              }}
              style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.85rem', color: 'var(--teal-600)', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Forgot password?
            </button>
          </div>

          <button className="btn btn-teal btn-lg w-full" type="submit" disabled={loading} style={{ justifyContent: 'center' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: 0 }}>
          Don't have an account? <Link to="/register" style={{ fontWeight: 700, color: 'var(--teal-600)' }}>Register as Citizen</Link>
        </p>
      </div>
    </div>
  );
}
