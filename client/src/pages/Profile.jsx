import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatIndianPhone } from '../components/shared.jsx';
import {
  getHDAvatarUrl,
  getGravatarUrl,
  getUnavatarUrl
} from '../lib/avatar.js';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Save,
  Edit2,
  X,
  Camera,
  Check,
  Upload,
  Trash2,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Link as LinkIcon,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  KeyRound,
  ArrowRight
} from 'lucide-react';
import api from '../services/api.js';

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

export default function Profile() {
  const { user, updateProfile, setPassword, changePassword, updateUserState } = useAuth();
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Full-size image lightbox modal state
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState('');

  // Circular crop modal states
  const [showCropModal, setShowCropModal] = useState(false);
  const [rawImageForCrop, setRawImageForCrop] = useState(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropPos, setCropPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Password & Security State
  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passLoading, setPassLoading] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Contact Info OTP Change Modal State
  const [contactModal, setContactModal] = useState({
    show: false,
    type: 'email', // 'email' or 'phone'
    step: 1,
    newValue: '',
    currentPassword: '',
    otp: '',
    loading: false
  });

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: formatIndianPhone(user?.phone || ''),
    district: user?.district || 'Chennai',
    area: user?.area || '',
    city: user?.city || 'Chennai',
    avatar: user?.avatar || ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: formatIndianPhone(user.phone || ''),
        district: user.district || 'Chennai',
        area: user.area || '',
        city: user.city || 'Chennai',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === 'phone') {
      setFormData(prev => ({ ...prev, phone: formatIndianPhone(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file (JPG, PNG, WebP)', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      addToast('Selected image is too large. Please select an image under 10MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result;
      if (base64Url) {
        setRawImageForCrop(base64Url);
        setCropZoom(1);
        setCropPos({ x: 0, y: 0 });
        setShowCropModal(true);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleApplyCrop() {
    if (!rawImageForCrop) return;

    const img = new Image();
    img.src = rawImageForCrop;
    img.onload = () => {
      const CANVAS_SIZE = 800;
      const PREVIEW_SIZE = 260;
      const ratio = CANVAS_SIZE / PREVIEW_SIZE;

      const canvas = document.createElement('canvas');
      canvas.width = CANVAS_SIZE;
      canvas.height = CANVAS_SIZE;
      const ctx = canvas.getContext('2d');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Clip to circular frame
      ctx.beginPath();
      ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      const baseScale = Math.max(CANVAS_SIZE / img.width, CANVAS_SIZE / img.height);
      const finalScale = baseScale * cropZoom;
      const dw = img.width * finalScale;
      const dh = img.height * finalScale;
      const dx = (CANVAS_SIZE / 2) - (dw / 2) + (cropPos.x * ratio);
      const dy = (CANVAS_SIZE / 2) - (dh / 2) + (cropPos.y * ratio);

      ctx.drawImage(img, dx, dy, dw, dh);
      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.95);

      setFormData(prev => ({ ...prev, avatar: croppedDataUrl }));
      setShowCropModal(false);
      setRawImageForCrop(null);
      addToast('Profile photo cropped & applied! Click "Save Changes" to save.', 'success');
    };
  }

  function handlePointerDown(e) {
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - cropPos.x, y: clientY - cropPos.y });
  }

  function handlePointerMove(e) {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setCropPos({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  }

  function handlePointerUp() {
    setIsDragging(false);
  }

  function handleUseGravatar() {
    const userEmail = user?.email;
    if (!userEmail) {
      addToast('No email address found on user profile', 'error');
      return;
    }
    const gravatarUrl = getGravatarUrl(userEmail, 400, 'identicon');
    setFormData(prev => ({ ...prev, avatar: gravatarUrl }));
    addToast('Applied Email Gravatar profile picture! Click "Save Changes" to save.', 'success');
  }

  function handleUseUnavatar() {
    const userEmail = user?.email;
    if (!userEmail) {
      addToast('No email address found on user profile', 'error');
      return;
    }
    const unavatarUrl = getUnavatarUrl(userEmail);
    setFormData(prev => ({ ...prev, avatar: unavatarUrl }));
    addToast('Applied Email Social profile picture! Click "Save Changes" to save.', 'success');
  }

  function handleApplyCustomUrl() {
    if (!customUrlInput.trim()) {
      addToast('Please enter a valid image URL', 'error');
      return;
    }
    setFormData(prev => ({ ...prev, avatar: customUrlInput.trim() }));
    setShowUrlInput(false);
    setCustomUrlInput('');
    addToast('Custom photo URL applied! Click "Save Changes" to save.', 'success');
  }

  function handleRemovePhoto() {
    setFormData(prev => ({ ...prev, avatar: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    addToast('Photo removed. Initial letter of your name will be used.', 'info');
  }

  function handleStartEditing() {
    setFormData({
      name: user?.name || '',
      phone: formatIndianPhone(user?.phone || ''),
      district: user?.district || 'Chennai',
      area: user?.area || '',
      city: user?.city || 'Chennai',
      avatar: user?.avatar || ''
    });
    setIsEditing(true);
  }

  function handleCancelEditing() {
    setIsEditing(false);
    setShowUrlInput(false);
    setFormData({
      name: user?.name || '',
      phone: formatIndianPhone(user?.phone || ''),
      district: user?.district || 'Chennai',
      area: user?.area || '',
      city: user?.city || 'Chennai',
      avatar: user?.avatar || ''
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast('Name cannot be empty', 'error');
      return;
    }

    setSaving(true);
    try {
      await updateProfile(formData);
      addToast('Profile updated successfully!', 'success');
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      addToast(err?.response?.data?.error || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  }

  // Password Set/Change submit handler
  async function handlePasswordSubmit(e) {
    e.preventDefault();

    if (!passForm.newPassword) {
      addToast('Please enter a new password', 'warning');
      return;
    }
    if (passForm.newPassword.length < 6) {
      addToast('Password must be at least 6 characters long', 'warning');
      return;
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }

    setPassLoading(true);
    try {
      if (user?.hasPassword) {
        if (!passForm.currentPassword) {
          addToast('Please enter your current password', 'warning');
          setPassLoading(false);
          return;
        }
        await changePassword(passForm.currentPassword, passForm.newPassword);
        addToast('Password changed successfully!', 'success');
      } else {
        await setPassword(passForm.newPassword);
        addToast('Password created successfully! You can now sign in using Email + Password as well.', 'success');
      }

      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      addToast(err.response?.data?.error || err.message || 'Password update failed', 'error');
    } finally {
      setPassLoading(false);
    }
  }

  // Open Contact Change Modal
  function handleOpenContactModal(type) {
    setContactModal({
      show: true,
      type,
      step: 1,
      newValue: type === 'email' ? user?.email || '' : user?.phone || '',
      currentPassword: '',
      otp: '',
      loading: false
    });
  }

  // Contact Change Request OTP
  async function handleRequestContactOTP(e) {
    e.preventDefault();
    if (!contactModal.newValue.trim()) {
      addToast(`Please enter a valid ${contactModal.type === 'email' ? 'email address' : 'phone number'}`, 'warning');
      return;
    }

    if (user?.hasPassword && !contactModal.currentPassword) {
      addToast('Please enter your current password for security verification', 'warning');
      return;
    }

    setContactModal(prev => ({ ...prev, loading: true }));
    try {
      const res = await api.post('/auth/request-contact-otp', {
        type: contactModal.type,
        newValue: contactModal.newValue,
        currentPassword: contactModal.currentPassword
      });

      addToast(res.data.message || 'Verification code sent!', 'success');
      setContactModal(prev => ({ ...prev, step: 2, loading: false }));
    } catch (err) {
      addToast(err.response?.data?.error || err.message || 'Failed to send OTP code', 'error');
      setContactModal(prev => ({ ...prev, loading: false }));
    }
  }

  // Contact Change Verify OTP
  async function handleVerifyContactOTP(e) {
    e.preventDefault();
    if (!contactModal.otp.trim()) {
      addToast('Please enter the 6-digit verification code', 'warning');
      return;
    }

    setContactModal(prev => ({ ...prev, loading: true }));
    try {
      const res = await api.post('/auth/verify-contact-otp', {
        type: contactModal.type,
        newValue: contactModal.newValue,
        otp: contactModal.otp
      });

      updateUserState(res.data.user);
      addToast(res.data.message || `${contactModal.type === 'email' ? 'Email' : 'Phone'} updated successfully!`, 'success');
      setContactModal(prev => ({ ...prev, show: false, loading: false }));
    } catch (err) {
      addToast(err.response?.data?.error || err.message || 'Failed to verify OTP', 'error');
      setContactModal(prev => ({ ...prev, loading: false }));
    }
  }

  function handleOpenLightbox(src) {
    if (!src) return;
    setLightboxSrc(getHDAvatarUrl(src, user?.email));
    setShowLightbox(true);
  }

  const roleLabel = user?.role === 'admin' ? 'Municipal Authority' : user?.role === 'officer' ? 'Field Officer' : 'Citizen User';
  const activeAvatarRaw = isEditing ? formData.avatar : user?.avatar;
  const currentAvatar = getHDAvatarUrl(activeAvatarRaw, user?.email);

  return (
    <div className="fade-in" style={{ maxWidth: 840, margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">User Account Profile</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            {isEditing ? 'Update your personal details and profile picture below' : 'View your profile details, jurisdiction area, and account status'}
          </p>
        </div>

        {!isEditing ? (
          <button onClick={handleStartEditing} className="btn btn-teal btn-lg" style={{ gap: 8 }}>
            <Edit2 size={18} />
            <span>Edit Profile</span>
          </button>
        ) : (
          <button onClick={handleCancelEditing} className="btn btn-secondary btn-lg" style={{ gap: 8 }}>
            <X size={18} />
            <span>Cancel Edit</span>
          </button>
        )}
      </div>

      {/* Hidden File Input for Device Folder Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Profile Banner Card */}
      <div
        className="card"
        style={{
          marginBottom: 24,
          background: 'linear-gradient(135deg, var(--primary-900) 0%, #0f172a 100%)',
          color: 'white',
          border: 'none',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', top: -30, right: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(0,180,216,0.15)', filter: 'blur(40px)' }} />

        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          {/* Avatar Display */}
          <div style={{ position: 'relative' }}>
            {currentAvatar ? (
              <img
                src={currentAvatar}
                alt={user?.name || 'User'}
                referrerPolicy="no-referrer"
                onClick={() => handleOpenLightbox(currentAvatar)}
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 'var(--radius-full)',
                  objectFit: 'cover',
                  border: '3px solid var(--teal-400)',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
                  cursor: 'pointer',
                  imageRendering: '-webkit-optimize-contrast',
                  transition: 'transform 0.2s ease, filter 0.2s ease'
                }}
                title="Touch / Click to view full image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallback = e.target.parentElement?.querySelector('.avatar-fallback-initial');
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}

            <div
              className="avatar-fallback-initial"
              style={{
                width: 96,
                height: 96,
                borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(135deg, var(--teal-500) 0%, var(--teal-700) 100%)',
                color: 'white',
                display: currentAvatar ? 'none' : 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.4rem',
                fontWeight: 800,
                border: '3px solid rgba(255,255,255,0.4)',
                boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              {((isEditing ? formData.name : user?.name)?.[0] || user?.email?.[0] || 'U').toUpperCase()}
            </div>

            {isEditing && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  background: 'var(--teal-500)',
                  color: 'white',
                  border: '2px solid white',
                  borderRadius: '50%',
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-md)'
                }}
                title="Select & Crop Photo from Device Folder"
              >
                <Camera size={18} />
              </button>
            )}
          </div>

          {/* Basic User Info */}
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: 'white' }}>
                {isEditing ? (formData.name || 'User') : (user?.name || 'User')}
              </h2>
              <span
                style={{
                  background: 'rgba(0,180,216,0.25)',
                  color: 'var(--teal-300)',
                  border: '1px solid rgba(0,180,216,0.4)',
                  padding: '2px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}
              >
                {roleLabel}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Mail size={16} style={{ color: 'var(--teal-300)', flexShrink: 0 }} />
                <span style={{ wordBreak: 'break-all' }}>{user?.email}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={16} style={{ color: 'var(--teal-300)' }} />
                <span>{user?.area ? `${user.area}, ` : ''}{user?.district || 'Chennai'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Picture Option Controls in Edit Mode */}
        {isEditing && (
          <div className="fade-in" style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--teal-300)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={16} /> Profile Picture Options & Email Avatar:
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                type="button"
                onClick={handleUseGravatar}
                className="btn btn-teal btn-sm"
                style={{ gap: 6, background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' }}
                title="Use Gravatar linked to your email address"
              >
                <Mail size={15} />
                <span>Use Email Profile Picture (Gravatar)</span>
              </button>

              <button
                type="button"
                onClick={handleUseUnavatar}
                className="btn btn-teal btn-sm"
                style={{ gap: 6, background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)' }}
                title="Fetch profile picture associated with your email"
              >
                <Sparkles size={15} />
                <span>Use Social Email Avatar</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-secondary btn-sm"
                style={{ gap: 6, color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
              >
                <Upload size={15} />
                <span>Upload & Crop Local Photo</span>
              </button>

              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="btn btn-secondary btn-sm"
                style={{ gap: 6, color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
              >
                <LinkIcon size={15} />
                <span>Image Link URL</span>
              </button>

              {formData.avatar && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: 6, color: '#f87171', borderColor: 'rgba(248,113,113,0.4)', background: 'rgba(239,68,68,0.1)' }}
                >
                  <Trash2 size={15} />
                  <span>Remove Photo</span>
                </button>
              )}
            </div>

            {showUrlInput && (
              <div style={{ marginTop: 12, display: 'flex', gap: 8, maxWidth: 500 }}>
                <input
                  type="url"
                  placeholder="https://example.com/my-photo.jpg"
                  value={customUrlInput}
                  onChange={e => setCustomUrlInput(e.target.value)}
                  className="form-control"
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
                />
                <button
                  type="button"
                  onClick={handleApplyCustomUrl}
                  className="btn btn-teal btn-sm"
                >
                  Apply
                </button>
              </div>
            )}

            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', marginTop: 10 }}>
              💡 You can automatically load your Email Profile Picture (Gravatar), upload a photo file from your phone/computer, or enter a photo web link.
            </div>
          </div>
        )}
      </div>

      {/* READ-ONLY VIEW MODE */}
      {!isEditing ? (
        <>
          <div className="card fade-in" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid var(--gray-200)', paddingBottom: 12 }}>
              <h3 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <User size={20} style={{ color: 'var(--primary-600)' }} /> Account Details & Jurisdiction Info
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)', background: 'var(--gray-100)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
                🔒 Read-Only View
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 10 }}>
              <div style={{ background: 'var(--gray-50)', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: 4 }}>Full Name</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--gray-900)' }}>{user?.name || 'Not specified'}</div>
              </div>

              {/* Email with OTP Change Button */}
              <div style={{ background: 'var(--gray-50)', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Email Address</div>
                  <button
                    type="button"
                    onClick={() => handleOpenContactModal('email')}
                    style={{ background: 'none', border: 'none', color: 'var(--teal-600)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <Lock size={12} /> Change
                  </button>
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-700)', wordBreak: 'break-all' }}>{user?.email || 'Not specified'}</div>
              </div>

              {/* Phone with OTP Change Button */}
              <div style={{ background: 'var(--gray-50)', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Phone Number</div>
                  <button
                    type="button"
                    onClick={() => handleOpenContactModal('phone')}
                    style={{ background: 'none', border: 'none', color: 'var(--teal-600)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <Lock size={12} /> Change
                  </button>
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--gray-900)' }}>{formatIndianPhone(user?.phone) || 'Not provided'}</div>
              </div>

              <div style={{ background: 'var(--gray-50)', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: 4 }}>City / District</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--gray-900)' }}>{user?.district || user?.city || 'Chennai'}</div>
              </div>

              <div style={{ background: 'var(--gray-50)', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: 4 }}>Assigned Area / Ward</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--teal-700)' }}>{user?.area || 'Not specified'}</div>
              </div>

              <div style={{ background: 'var(--gray-50)', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: 4 }}>Account Role</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'capitalize' }}>{user?.role || 'Citizen'}</div>
              </div>
            </div>

            <div style={{ marginTop: 24, textAlign: 'right' }}>
              <button onClick={handleStartEditing} className="btn btn-teal">
                <Edit2 size={16} /> Edit Profile Details & Picture
              </button>
            </div>
          </div>

          {/* PASSWORD & SECURITY SECTION */}
          <div className="card fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--gray-200)', paddingBottom: 12 }}>
              <h3 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Shield size={20} style={{ color: 'var(--teal-600)' }} /> Password & Security Management
              </h3>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  background: user?.hasPassword ? 'var(--teal-50)' : '#fef3c7',
                  color: user?.hasPassword ? 'var(--teal-800)' : '#92400e',
                  border: user?.hasPassword ? '1px solid var(--teal-200)' : '1px solid #fde68a'
                }}
              >
                {user?.hasPassword ? '🔑 Password Set' : '🌐 Google OAuth Only'}
              </span>
            </div>

            {/* Account Password Status Explanation Banner */}
            <div style={{ background: 'var(--gray-50)', padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', marginBottom: 20, fontSize: '0.85rem', color: 'var(--gray-700)' }}>
              {user?.hasPassword ? (
                <div>
                  <strong>Password Protection Active:</strong> Your account has a password set. You can sign in using Email + Password or Continue with Google.
                </div>
              ) : (
                <div>
                  <strong>Google OAuth Account:</strong> You signed in via Google and do not have an Email + Password credential yet. Set a password below to enable direct email sign-in.
                </div>
              )}
            </div>

            <form onSubmit={handlePasswordSubmit}>
              {user?.hasPassword && (
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label" htmlFor="profile-currpass">Current Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                    <input
                      id="profile-currpass"
                      className="form-control"
                      type={showCurrentPass ? 'text' : 'password'}
                      placeholder="Enter your current password"
                      value={passForm.currentPassword}
                      onChange={e => setPassForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      style={{ paddingLeft: 42, paddingRight: 44 }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer' }}
                    >
                      {showCurrentPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="profile-newpass">
                    {user?.hasPassword ? 'New Password' : 'Create New Password'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                    <input
                      id="profile-newpass"
                      className="form-control"
                      type={showNewPass ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      value={passForm.newPassword}
                      onChange={e => setPassForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      style={{ paddingLeft: 42, paddingRight: 44 }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer' }}
                    >
                      {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="profile-confirmpass">Confirm Password</label>
                  <input
                    id="profile-confirmpass"
                    className="form-control"
                    type={showNewPass ? 'text' : 'password'}
                    placeholder="Re-enter new password"
                    value={passForm.confirmPassword}
                    onChange={e => setPassForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <button className="btn btn-teal" type="submit" disabled={passLoading} style={{ gap: 8 }}>
                  <ShieldCheck size={16} />
                  <span>{passLoading ? 'Saving Password...' : user?.hasPassword ? 'Change Password' : 'Set Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </>
      ) : (
        /* EDIT MODE FORM */
        <div className="card fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid var(--gray-200)', paddingBottom: 12 }}>
            <h3 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Edit2 size={20} style={{ color: 'var(--teal-600)' }} /> Edit Personal Details
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--teal-700)', background: 'var(--teal-50)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
              ✏️ Edit Mode Active
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, marginBottom: 20 }}>
              {/* Full Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="profile-name">
                  Full Name <span style={{ color: 'var(--error-500)' }}>*</span>
                </label>
                <input
                  id="profile-name"
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Phone Number */}
              <div className="form-group">
                <label className="form-label" htmlFor="profile-phone">Phone Number</label>
                <input
                  id="profile-phone"
                  type="tel"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                />
              </div>

              {/* District */}
              <div className="form-group">
                <label className="form-label" htmlFor="profile-district">District / City</label>
                <input
                  id="profile-district"
                  type="text"
                  name="district"
                  className="form-control"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="e.g. Chennai"
                />
              </div>

              {/* Local Area */}
              <div className="form-group">
                <label className="form-label" htmlFor="profile-area">Assigned Area / Ward</label>
                <select
                  id="profile-area"
                  name="area"
                  className="form-control"
                  value={formData.area}
                  onChange={handleChange}
                >
                  <option value="">-- Select Area / Ward --</option>
                  {TAMIL_NADU_AREAS.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Profile Photo Quick Selection Card */}
            <div className="form-group" style={{ marginBottom: 24, padding: 16, background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                <Camera size={18} style={{ color: 'var(--teal-600)' }} /> Profile Picture Selection
              </label>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginTop: 10 }}>
                <button
                  type="button"
                  onClick={handleUseGravatar}
                  className="btn btn-teal btn-sm"
                  style={{ gap: 6 }}
                >
                  <Mail size={15} /> Use Email Profile Picture (Gravatar)
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: 6 }}
                >
                  <Upload size={15} /> Choose Photo from Device
                </button>

                {formData.avatar && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: 6, color: 'var(--error-600)' }}
                  >
                    <Trash2 size={15} /> Reset Photo
                  </button>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid var(--gray-200)', paddingTop: 16 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancelEditing}
                disabled={saving}
              >
                <X size={16} /> Cancel
              </button>
              <button
                type="submit"
                className="btn btn-teal"
                disabled={saving}
                style={{ minWidth: 140, justifyContent: 'center' }}
              >
                {saving ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SECURITY-VERIFIED CONTACT CHANGE MODAL */}
      {contactModal.show && (
        <div
          className="fade-in"
          style={{
            position: 'fixed',
            inset: 0,
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
              onClick={() => setContactModal(prev => ({ ...prev, show: false }))}
              style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, background: 'var(--teal-50)', color: 'var(--teal-600)', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <KeyRound size={22} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--gray-900)' }}>
                Security Verification ({contactModal.type === 'email' ? 'Email Address' : 'Phone Number'})
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', margin: '4px 0 0 0' }}>
                {contactModal.step === 1 ? 'Enter your new contact value and verify security' : 'Enter 6-digit code sent to your new contact'}
              </p>
            </div>

            {contactModal.step === 1 ? (
              <form onSubmit={handleRequestContactOTP}>
                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label">
                    New {contactModal.type === 'email' ? 'Email Address' : 'Phone Number'}
                  </label>
                  <input
                    className="form-control"
                    type={contactModal.type === 'email' ? 'email' : 'tel'}
                    placeholder={contactModal.type === 'email' ? 'newemail@example.com' : '+91 98765 43210'}
                    value={contactModal.newValue}
                    onChange={e => setContactModal(prev => ({ ...prev, newValue: e.target.value }))}
                    required
                  />
                </div>

                {user?.hasPassword && (
                  <div className="form-group" style={{ marginBottom: 20 }}>
                    <label className="form-label">Current Password (Required for Security)</label>
                    <input
                      className="form-control"
                      type="password"
                      placeholder="Enter current password"
                      value={contactModal.currentPassword}
                      onChange={e => setContactModal(prev => ({ ...prev, currentPassword: e.target.value }))}
                      required
                    />
                  </div>
                )}

                <button className="btn btn-teal btn-lg w-full" type="submit" disabled={contactModal.loading} style={{ justifyContent: 'center' }}>
                  {contactModal.loading ? 'Sending Code...' : 'Send Verification OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyContactOTP}>
                <div style={{ background: 'var(--teal-50)', padding: 10, borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--teal-900)', marginBottom: 16 }}>
                  Verification code sent to <strong>{contactModal.newValue}</strong>
                </div>

                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label className="form-label">6-Digit Verification Code (OTP)</label>
                  <input
                    className="form-control"
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={contactModal.otp}
                    onChange={e => setContactModal(prev => ({ ...prev, otp: e.target.value.replace(/\D/g, '') }))}
                    style={{ letterSpacing: 4, fontWeight: 700, textAlign: 'center', fontSize: '1.1rem' }}
                    required
                  />
                </div>

                <button className="btn btn-teal btn-lg w-full" type="submit" disabled={contactModal.loading} style={{ justifyContent: 'center' }}>
                  {contactModal.loading ? 'Verifying Code...' : `Verify Code & Update ${contactModal.type === 'email' ? 'Email' : 'Phone'}`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* CIRCULAR IMAGE CROP MODAL */}
      {showCropModal && (
        <div
          className="fade-in"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.88)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            backdropFilter: 'blur(8px)'
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: 440,
              width: '100%',
              background: '#1e293b',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: 24,
              borderRadius: 'var(--radius-lg)'
            }}
          >
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Camera size={20} style={{ color: 'var(--teal-400)' }} /> Crop Photo for Circle Frame
              </h3>
              <button
                onClick={() => setShowCropModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ fontSize: '0.825rem', color: 'rgba(255,255,255,0.75)', marginBottom: 16, textAlign: 'center' }}>
              🖐️ Drag/touch photo to position inside circle. Use slider below to zoom in or out.
            </div>

            <div
              onMouseDown={handlePointerDown}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onMouseLeave={handlePointerUp}
              onTouchStart={handlePointerDown}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
              style={{
                width: 260,
                height: 260,
                borderRadius: '50%',
                border: '4px solid var(--teal-400)',
                position: 'relative',
                overflow: 'hidden',
                cursor: isDragging ? 'grabbing' : 'grab',
                boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.75), 0 6px 20px rgba(0,0,0,0.4)',
                userSelect: 'none',
                touchAction: 'none',
                background: '#0f172a',
                margin: '10px 0 20px 0'
              }}
            >
              {rawImageForCrop && (
                <img
                  src={rawImageForCrop}
                  alt="Crop Target"
                  draggable={false}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: `translate(calc(-50% + ${cropPos.x}px), calc(-50% + ${cropPos.y}px)) scale(${cropZoom})`,
                    maxWidth: 'none',
                    maxHeight: 'none',
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    pointerEvents: 'none'
                  }}
                />
              )}
            </div>

            <div style={{ width: '100%', maxWidth: 300, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--teal-300)', marginBottom: 8, alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><ZoomOut size={14} /> Zoom Out</span>
                <span>{Math.round(cropZoom * 100)}%</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Zoom In <ZoomIn size={14} /></span>
              </div>
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={cropZoom}
                onChange={e => setCropZoom(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--teal-400)', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, width: '100%', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowCropModal(false)}
                className="btn btn-secondary btn-sm"
                style={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCrop}
                className="btn btn-teal btn-sm"
                style={{ gap: 6 }}
              >
                <Check size={16} /> Crop & Apply Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Full Size Photo Modal */}
      {showLightbox && (
        <div
          className="fade-in"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(10px)',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
          onClick={() => setShowLightbox(false)}
        >
          <div
            style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowLightbox(false)}
              style={{
                position: 'absolute',
                top: -46,
                right: 0,
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                borderRadius: '50%',
                width: 38,
                height: 38,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <img
              src={lightboxSrc}
              alt={`${user?.name}'s Profile Picture`}
              style={{
                maxWidth: '340px',
                maxHeight: '340px',
                width: '85vw',
                height: '85vw',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid var(--teal-400)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                imageRendering: '-webkit-optimize-contrast'
              }}
            />
            <p style={{ color: 'white', marginTop: 16, fontWeight: 600, fontSize: '1rem' }}>
              {user?.name}'s Profile Picture
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
