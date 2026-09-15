import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, getRoleDashboard } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Eye, EyeOff, ArrowLeft, Mail, Lock, Phone, KeyRound, X, CheckCircle } from 'lucide-react';
import { signInWithGoogleOAuth } from '../lib/supabase.js';
import api from '../services/api.js';

export default function Login() {
  const { user, isAuthenticated, login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // If user is already authenticated, redirect appropriately
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.profileCompleted === false) {
        navigate('/complete-profile', { replace: true, state: { from: location.state?.from } });
      } else if (user.role) {
        const target = location.state?.from?.pathname || getRoleDashboard(user.role);
        navigate(target, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, location]);

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotForm, setForgotForm] = useState({
    contact: '',
    method: 'email',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [oauthAlert, setOauthAlert] = useState('');

  async function performLogin(email, password) {
    setLoading(true);
    setOauthAlert('');
    try {
      const loggedUser = await login(email, password);
      addToast(`Welcome back, ${loggedUser.name}!`, 'success');
      
      if (loggedUser.profileCompleted === false) {
        navigate('/complete-profile', { replace: true, state: { from: location.state?.from } });
      } else {
        const target = location.state?.from?.pathname || getRoleDashboard(loggedUser.role);
        navigate(target, { replace: true });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Invalid email or password';
      if (errorMsg.includes('Google')) {
        setOauthAlert(errorMsg);
      } else {
        addToast(errorMsg, 'error');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) {
      addToast('Please enter both email address and password', 'warning');
      return;
    }
    await performLogin(form.email, form.password);
  }

  function handleOpenForgotModal() {
    setForgotForm({
      contact: form.email || '',
      method: form.email && !form.email.includes('@') ? 'phone' : 'email',
      otp: '',
      newPassword: '',
      confirmPassword: ''
    });
    setForgotStep(1);
    setShowForgotModal(true);
  }

  async function handleRequestOTP(e) {
    e.preventDefault();
    if (!forgotForm.contact.trim()) {
      addToast('Please enter your registered email address or phone number', 'warning');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await api.post('/auth/forgot-password/request-otp', {
        contact: forgotForm.contact,
        method: forgotForm.method
      });
      addToast(res.data.message || 'Verification code sent!', 'success');
      if (res.data.otp) {
        setForgotForm(prev => ({ ...prev, otp: res.data.otp }));
      }
      setForgotStep(2);
    } catch (err) {
      addToast(err.response?.data?.error || err.message || 'Failed to send OTP code', 'error');
    } finally {
      setForgotLoading(false);
    }
  }

  async function handleVerifyOTPAndReset(e) {
    e.preventDefault();
    if (!forgotForm.otp.trim()) {
      addToast('Please enter the 6-digit verification code', 'warning');
      return;
    }
    if (!forgotForm.newPassword) {
      addToast('Please enter a new password', 'warning');
      return;
    }
    if (forgotForm.newPassword.length < 6) {
      addToast('New password must be at least 6 characters long', 'warning');
      return;
    }
    if (forgotForm.newPassword !== forgotForm.confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await api.post('/auth/forgot-password/verify-otp', {
        contact: forgotForm.contact,
        otp: forgotForm.otp,
        newPassword: forgotForm.newPassword
      });

      addToast(res.data.message || 'Password reset successfully!', 'success');
      setShowForgotModal(false);
      if (forgotForm.contact.includes('@')) {
        setForm(prev => ({ ...prev, email: forgotForm.contact }));
      }
    } catch (err) {
      addToast(err.response?.data?.error || err.message || 'Failed to reset password', 'error');
    } finally {
      setForgotLoading(false);
    }
  }

  return (
    <div className="auth-page" style={{ padding: '40px 20px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="auth-card fade-in" style={{ maxWidth: 460, padding: '36px 32px', width: '100%' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: 20 }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>

        {/* Brand Header */}
        <div className="auth-brand" style={{ marginBottom: 24, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
            <img src="/logo.jpg" alt="CivicPulse Logo" style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover', boxShadow: 'var(--shadow-md)' }} />
            <h1 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 800, color: 'var(--gray-900)' }}>CivicPulse AI</h1>
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--gray-500)' }}>
            Sign in to access your live municipal portal
          </p>
        </div>

        {/* Google OAuth Login Button */}
        <div style={{ marginBottom: 24 }}>
          <button
            type="button"
            className="btn btn-secondary w-full"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              try {
                await signInWithGoogleOAuth();
              } catch (err) {
                addToast(err.message || 'Google OAuth redirect failed', 'error');
                setLoading(false);
              }
            }}
            style={{ justifyContent: 'center', gap: 10, fontSize: '0.9rem', padding: '10px 16px', fontWeight: 600 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Continue with Google
          </button>
        </div>

        {/* OAuth-Only Account Notification Banner */}
        {oauthAlert && (
          <div className="fade-in" style={{ background: '#fef3c7', border: '1px solid #fde68a', color: '#92400e', padding: '14px 16px', borderRadius: 'var(--radius-md)', marginBottom: 20, fontSize: '0.85rem' }}>
            <div style={{ fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🌐</span> Google Sign-In Account Detected
            </div>
            <div>{oauthAlert}</div>
            <button
              type="button"
              className="btn btn-teal btn-sm w-full"
              style={{ marginTop: 12, justifyContent: 'center', gap: 8, fontWeight: 700 }}
              onClick={async () => {
                setLoading(true);
                try {
                  await signInWithGoogleOAuth();
                } catch (e) {
                  addToast(e.message || 'Google OAuth failed', 'error');
                  setLoading(false);
                }
              }}
            >
              Continue with Google
            </button>
          </div>
        )}

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
              onClick={handleOpenForgotModal}
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

        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'center', gap: 12, fontSize: '0.78rem', color: 'var(--gray-500)', flexWrap: 'wrap' }}>
          <Link to="/contact" style={{ color: 'var(--gray-500)', textDecoration: 'none' }}>Contact Us</Link>
          <span>•</span>
          <Link to="/help" style={{ color: 'var(--gray-500)', textDecoration: 'none' }}>Help</Link>
          <span>•</span>
          <Link to="/privacy" style={{ color: 'var(--gray-500)', textDecoration: 'none' }}>Privacy Policy</Link>
          <span>•</span>
          <Link to="/terms" style={{ color: 'var(--gray-500)', textDecoration: 'none' }}>Terms & Conditions</Link>
        </div>
      </div>

      {/* FORGOT PASSWORD OTP MODAL */}
      {showForgotModal && (
        <div
          className="fade-in"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16
          }}
        >
          <div
            className="auth-card fade-in"
            style={{
              maxWidth: 440,
              width: '100%',
              padding: 28,
              position: 'relative',
              background: 'white',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-xl)'
            }}
          >
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: 'none',
                border: 'none',
                color: 'var(--gray-400)',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, background: 'var(--teal-50)', color: 'var(--teal-600)', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <KeyRound size={22} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--gray-900)' }}>
                Reset Your Password
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', margin: '4px 0 0 0' }}>
                {forgotStep === 1 ? 'Choose how to receive your verification code' : 'Enter verification code and create new password'}
              </p>
            </div>

            {forgotStep === 1 ? (
              /* STEP 1: REQUEST OTP */
              <form onSubmit={handleRequestOTP}>
                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label">Recovery Method</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <button
                      type="button"
                      className={`btn btn-sm ${forgotForm.method === 'email' ? 'btn-teal' : 'btn-secondary'}`}
                      onClick={() => setForgotForm(prev => ({ ...prev, method: 'email' }))}
                      style={{ justifyContent: 'center', gap: 6 }}
                    >
                      <Mail size={16} /> Email OTP
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${forgotForm.method === 'phone' ? 'btn-teal' : 'btn-secondary'}`}
                      onClick={() => setForgotForm(prev => ({ ...prev, method: 'phone' }))}
                      style={{ justifyContent: 'center', gap: 6 }}
                    >
                      <Phone size={16} /> Phone OTP
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label className="form-label" htmlFor="forgot-contact">
                    {forgotForm.method === 'email' ? 'Registered Email Address' : 'Registered Phone Number'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    {forgotForm.method === 'email' ? (
                      <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                    ) : (
                      <Phone size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                    )}
                    <input
                      id="forgot-contact"
                      className="form-control"
                      type={forgotForm.method === 'email' ? 'email' : 'tel'}
                      placeholder={forgotForm.method === 'email' ? 'you@example.com' : '+91 98765 43210'}
                      value={forgotForm.contact}
                      onChange={e => setForgotForm(prev => ({ ...prev, contact: e.target.value }))}
                      style={{ paddingLeft: 42 }}
                      required
                    />
                  </div>
                </div>

                <button className="btn btn-teal btn-lg w-full" type="submit" disabled={forgotLoading} style={{ justifyContent: 'center' }}>
                  {forgotLoading ? 'Sending Verification Code...' : 'Send Verification Code (OTP)'}
                </button>
              </form>
            ) : (
              /* STEP 2: VERIFY OTP & RESET PASSWORD */
              <form onSubmit={handleVerifyOTPAndReset}>
                <div style={{ background: 'var(--teal-50)', border: '1px solid var(--teal-200)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: '0.8rem', color: 'var(--teal-900)', marginBottom: 16 }}>
                  Verification code sent to <strong>{forgotForm.contact}</strong>
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    style={{ background: 'none', border: 'none', color: 'var(--teal-700)', textDecoration: 'underline', marginLeft: 8, cursor: 'pointer', fontWeight: 600 }}
                  >
                    Change
                  </button>
                </div>

                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label" htmlFor="forgot-otp">6-Digit Verification Code (OTP)</label>
                  <input
                    id="forgot-otp"
                    className="form-control"
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={forgotForm.otp}
                    onChange={e => setForgotForm(prev => ({ ...prev, otp: e.target.value.replace(/\D/g, '') }))}
                    style={{ letterSpacing: 4, fontWeight: 700, textAlign: 'center', fontSize: '1.1rem' }}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label" htmlFor="forgot-newpass">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                    <input
                      id="forgot-newpass"
                      className="form-control"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Minimum 6 characters"
                      value={forgotForm.newPassword}
                      onChange={e => setForgotForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      style={{ paddingLeft: 42, paddingRight: 44 }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer' }}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label className="form-label" htmlFor="forgot-confirmpass">Confirm New Password</label>
                  <input
                    id="forgot-confirmpass"
                    className="form-control"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Re-enter new password"
                    value={forgotForm.confirmPassword}
                    onChange={e => setForgotForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                  />
                </div>

                <button className="btn btn-teal btn-lg w-full" type="submit" disabled={forgotLoading} style={{ justifyContent: 'center' }}>
                  {forgotLoading ? 'Resetting Password...' : 'Verify Code & Reset Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
