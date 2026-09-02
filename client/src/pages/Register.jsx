import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import api from '../services/api.js';
import { Eye, EyeOff, ArrowLeft, User, Shield, Wrench, Building2, MapPin } from 'lucide-react';

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

  const [role, setRole] = useState('citizen'); // 'citizen' | 'officer' | 'admin'
  const [departments, setDepartments] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    district: 'Chennai',
    area: 'Anna Nagar',
    departmentId: '',
    departmentName: '',
    badgeNumber: ''
  });

  useEffect(() => {
    // Load departments for officer dropdown
    api.get('/auth/departments')
      .then(res => {
        if (res.data?.departments?.length > 0) {
          setDepartments(res.data.departments);
          setForm(prev => ({
            ...prev,
            departmentId: res.data.departments[0]._id,
            departmentName: res.data.departments[0].name
          }));
        }
      })
      .catch(() => {
        // Fallback default list if needed
        const defaultDepts = [
          { _id: '1', name: 'Roads & Infrastructure' },
          { _id: '2', name: 'Water Supply Department' },
          { _id: '3', name: 'Electrical Department' },
          { _id: '4', name: 'Sanitation Department' },
          { _id: '5', name: 'Drainage & Sewage Department' }
        ];
        setDepartments(defaultDepts);
      });
  }, []);

  const update = (field) => (e) => {
    const val = e.target.value;
    if (field === 'departmentId') {
      const dept = departments.find(d => d._id === val);
      setForm(prev => ({ ...prev, departmentId: val, departmentName: dept?.name || '' }));
    } else {
      setForm(prev => ({ ...prev, [field]: val }));
    }
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
    if (role === 'officer' && !form.departmentName && !form.departmentId) {
      addToast('Please select an assigned Department', 'warning');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role,
        district: form.district,
        area: form.area,
        departmentId: form.departmentId,
        departmentName: form.departmentName,
        badgeNumber: form.badgeNumber || (role === 'officer' ? `FO-${Math.floor(100 + Math.random() * 900)}` : '')
      };

      const user = await register(payload);
      addToast(`Account created as ${role.toUpperCase()}! Welcome, ${user.name}`, 'success');

      if (role === 'officer') {
        navigate('/officer');
      } else if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/citizen');
      }
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
        <div className="auth-brand" style={{ marginBottom: 24 }}>
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
            Choose your account role and enter your jurisdiction details
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
            background: 'var(--gray-100)',
            padding: 6,
            borderRadius: 'var(--radius-lg)',
            marginBottom: 24
          }}
        >
          <button
            type="button"
            onClick={() => setRole('citizen')}
            style={{
              padding: '10px 8px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: role === 'citizen' ? 'var(--white)' : 'transparent',
              color: role === 'citizen' ? 'var(--primary-600)' : 'var(--gray-600)',
              fontWeight: 700,
              fontSize: '0.85rem',
              boxShadow: role === 'citizen' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              transition: 'all 0.2s'
            }}
          >
            <User size={18} />
            <span>Citizen</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('officer')}
            style={{
              padding: '10px 8px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: role === 'officer' ? 'var(--white)' : 'transparent',
              color: role === 'officer' ? 'var(--teal-600)' : 'var(--gray-600)',
              fontWeight: 700,
              fontSize: '0.85rem',
              boxShadow: role === 'officer' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              transition: 'all 0.2s'
            }}
          >
            <Wrench size={18} />
            <span>Field Officer</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('admin')}
            style={{
              padding: '10px 8px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: role === 'admin' ? 'var(--white)' : 'transparent',
              color: role === 'admin' ? 'var(--error-600)' : 'var(--gray-600)',
              fontWeight: 700,
              fontSize: '0.85rem',
              boxShadow: role === 'admin' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              transition: 'all 0.2s'
            }}
          >
            <Shield size={18} />
            <span>Admin</span>
          </button>
        </div>

        {/* Role Explanatory Banner */}
        <div
          style={{
            background:
              role === 'officer'
                ? 'var(--teal-50)'
                : role === 'admin'
                ? 'var(--error-50)'
                : 'var(--primary-50)',
            border: `1px solid ${
              role === 'officer'
                ? 'var(--teal-200)'
                : role === 'admin'
                ? 'var(--error-100)'
                : 'var(--primary-200)'
            }`,
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            marginBottom: 20,
            fontSize: '0.825rem',
            color:
              role === 'officer'
                ? 'var(--teal-700)'
                : role === 'admin'
                ? 'var(--error-700)'
                : 'var(--primary-700)',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          {role === 'officer' && (
            <span>
              🔧 <strong>Field Officer Mode:</strong> You will monitor and resolve complaints reported in your assigned department and border/patrol area.
            </span>
          )}
          {role === 'admin' && (
            <span>
              🏛️ <strong>Authority Mode:</strong> Full command center access to monitor SLA, assign officers, and view live city heatmap.
            </span>
          )}
          {role === 'citizen' && (
            <span>
              👤 <strong>Citizen Mode:</strong> Report civic problems, pinpoint GPS location, track progress, and verify resolution.
            </span>
          )}
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              className="form-input"
              placeholder={role === 'officer' ? 'e.g. Officer Suresh Babu' : 'e.g. Ravi Kumar'}
              value={form.name}
              onChange={update('name')}
              required
            />
          </div>

          {/* Email and Phone */}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                className="form-input"
                type="email"
                placeholder={role === 'officer' ? 'officer@civicpulse.gov' : 'you@example.com'}
                value={form.email}
                onChange={update('email')}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                className="form-input"
                placeholder="9876543210"
                value={form.phone}
                onChange={update('phone')}
              />
            </div>
          </div>

          {/* Department Selection (For Officers & Admin) */}
          {(role === 'officer' || role === 'admin') && (
            <div className="form-group">
              <label className="form-label">
                Department {role === 'officer' ? 'Assignment *' : 'Oversight'}
              </label>
              <select
                className="form-select"
                value={form.departmentId}
                onChange={update('departmentId')}
                required={role === 'officer'}
              >
                {departments.map(d => (
                  <option key={d._id} value={d._id}>
                    {d.icon || '🏢'} {d.name}
                  </option>
                ))}
              </select>
              {role === 'officer' && (
                <span className="form-hint">
                  Your officer dashboard will automatically filter complaints for this department in your patrol border.
                </span>
              )}
            </div>
          )}

          {/* District & Border / Area */}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">District *</label>
              <select
                className="form-select"
                value={form.district}
                onChange={update('district')}
              >
                {DISTRICTS.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                {role === 'officer' ? 'Border / Patrol Area *' : 'Area / Locality *'}
              </label>
              <select
                className="form-select"
                value={form.area}
                onChange={update('area')}
              >
                {CHENNAI_AREAS.map(a => (
                  <option key={a} value={a}>
                    📍 {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional Badge / Officer ID for Field Officer */}
          {role === 'officer' && (
            <div className="form-group">
              <label className="form-label">Officer Badge / ID (Optional)</label>
              <input
                className="form-input"
                placeholder="e.g. FO-CHENNAI-104"
                value={form.badgeNumber}
                onChange={update('badgeNumber')}
              />
            </div>
          )}

          {/* Password and Confirm Password */}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 6 chars"
                  value={form.password}
                  onChange={update('password')}
                  style={{ paddingRight: 40 }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 10,
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
              <label className="form-label">Confirm Password *</label>
              <input
                className="form-input"
                type="password"
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={update('confirmPassword')}
                required
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            className={`btn ${
              role === 'officer'
                ? 'btn-teal'
                : role === 'admin'
                ? 'btn-danger'
                : 'btn-primary'
            } btn-lg w-full`}
            type="submit"
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading
              ? 'Creating Account...'
              : `Create ${
                  role === 'officer'
                    ? 'Field Officer'
                    : role === 'admin'
                    ? 'Admin'
                    : 'Citizen'
                } Account`}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.875rem', color: 'var(--gray-500)' }}>
          Already registered?{' '}
          <Link to="/login" style={{ fontWeight: 600, color: 'var(--primary-500)' }}>
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
}
