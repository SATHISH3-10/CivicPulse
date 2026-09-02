import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import {
  MapPin,
  ArrowRight,
  Shield,
  Search,
  CheckCircle,
  Eye,
  Users,
  Clock,
  BarChart3,
  AlertTriangle,
  Globe,
  Menu,
  X,
  Crosshair,
  Navigation,
  Loader2
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const { lang, toggleLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div>
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <div className="landing-logo-icon">CP</div>
          <span>CivicPulse AI</span>
        </div>

        {/* Desktop Nav Links */}
        <div className="landing-nav-links">
          <a href="#how-it-works">How It Works</a>
          <a href="#categories">Issues</a>
          <a href="#map">Map</a>
          <a href="#impact">Impact</a>

          {/* Language Toggle Button */}
          <button
            onClick={() => toggleLanguage()}
            className="btn btn-secondary btn-sm"
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <Globe size={14} />
            <span style={{ color: lang === 'en' ? 'var(--teal-400)' : 'var(--gray-400)' }}>EN</span>
            <span>|</span>
            <span style={{ color: lang === 'ta' ? 'var(--teal-400)' : 'var(--gray-400)' }}>தமிழ்</span>
          </button>

          <Link to="/login" className="btn btn-teal btn-sm">{t('login')}</Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          className="landing-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="landing-mobile-dropdown fade-in">
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
            <a href="#categories" onClick={() => setMobileMenuOpen(false)}>Civic Issues</a>
            <a href="#map" onClick={() => setMobileMenuOpen(false)}>Live Map</a>
            <a href="#impact" onClick={() => setMobileMenuOpen(false)}>Impact</a>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <button
                onClick={() => { toggleLanguage(); setMobileMenuOpen(false); }}
                className="btn btn-secondary btn-sm"
                style={{ gap: 6, color: 'white', borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)' }}
              >
                <Globe size={16} />
                <span>Language: {lang === 'en' ? 'English' : 'தமிழ்'}</span>
              </button>

              <Link
                to="/login"
                className="btn btn-teal btn-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('login')}
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-content fade-in">
          <div className="hero-tag"><Shield size={16} /> {t('tagline')}</div>
          <h1 className="hero-title">{lang === 'ta' ? 'உங்கள் நகரம். உங்கள் குரல்.' : 'Your City. Your Voice.'}<br/><span>{lang === 'ta' ? 'உங்கள் தாக்கம்.' : 'Your Impact.'}</span></h1>
          <p className="hero-subtitle">{t('heroSubtitle')}</p>
          <div className="hero-buttons">
            <button className="hero-btn-primary" onClick={() => navigate('/login')}>
              <AlertTriangle size={20} /> {t('reportIssue')}
            </button>
            <button className="hero-btn-secondary" onClick={() => navigate('/login')}>
              <Search size={20} /> {t('exploreIssues')}
            </button>
          </div>
        </div>
      </section>

      {/* Live Civic Pulse */}
      <section className="landing-section" id="pulse">
        <h2 className="section-title">Live Civic Pulse</h2>
        <p className="section-subtitle">Real-time status of civic issue management across the city</p>
        <div className="pulse-stats">
          <CounterStat icon="📊" value={12480} label="Active Complaints" />
          <CounterStat icon="✅" value={10920} label="Issues Resolved" />
          <CounterStat icon="⏱️" value={31} label="Avg Resolution (hrs)" />
          <CounterStat icon="👥" value={8450} label="Citizens Participating" />
        </div>
      </section>

      {/* How It Works */}
      <section style={{ background: 'var(--gray-50)', padding: '80px 24px' }} id="how-it-works">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Five simple steps from problem to resolution</p>
          <div className="steps-grid">
            {[
              { num: 1, title: 'Report', desc: 'Submit your civic complaint with photos and location', icon: '📝' },
              { num: 2, title: 'Locate', desc: 'Pin the exact location on the interactive map', icon: '📍' },
              { num: 3, title: 'Track', desc: 'Follow every status update in real-time', icon: '🔍' },
              { num: 4, title: 'Resolve', desc: 'Field officers fix the issue with accountability', icon: '🔧' },
              { num: 5, title: 'Verify', desc: 'Confirm the resolution and rate the service', icon: '✅' }
            ].map(step => (
              <div key={step.num} className="step-card">
                <div className="step-number">{step.num}</div>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{step.icon}</div>
                <h4 className="step-title">{step.title}</h4>
                <p className="step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="landing-section" id="categories">
        <h2 className="section-title">Civic Issue Categories</h2>
        <p className="section-subtitle">Report problems across all municipal departments</p>
        <div className="categories-grid">
          {[
            { icon: '🛣️', name: 'Potholes' }, { icon: '💡', name: 'Streetlights' },
            { icon: '🗑️', name: 'Garbage' }, { icon: '💧', name: 'Water Leakage' },
            { icon: '🚰', name: 'Drainage' }, { icon: '🛤️', name: 'Road Damage' },
            { icon: '🚦', name: 'Traffic Signals' }, { icon: '🏗️', name: 'Public Infrastructure' }
          ].map(cat => (
            <div key={cat.name} className="category-card" onClick={() => navigate('/login')}>
              <div className="category-icon">{cat.icon}</div>
              <div className="category-name">{cat.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Map Section */}
      <section className="map-section" id="map">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 className="section-title" style={{ marginBottom: 8 }}>Live City Map</h2>
          <p className="section-subtitle" style={{ marginBottom: 20 }}>
            View reported civic issues across the city or locate your current position on the map
          </p>
          <div className="map-container" style={{ height: 'auto', minHeight: 520, borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
            <LandingMap />
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="impact-section" id="impact">
        <h2 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'white', marginBottom: 8 }}>
          Every report creates measurable change.
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'var(--font-size-lg)', marginBottom: 48 }}>
          Together, citizens are building a better, more responsive city.
        </p>
        <div className="impact-grid">
          <div className="impact-stat"><div className="impact-value">12,480</div><div className="impact-label">Issues Reported</div></div>
          <div className="impact-stat"><div className="impact-value">10,920</div><div className="impact-label">Issues Resolved</div></div>
          <div className="impact-stat"><div className="impact-value">87%</div><div className="impact-label">Resolution Rate</div></div>
          <div className="impact-stat"><div className="impact-value">4.2★</div><div className="impact-label">Citizen Satisfaction</div></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <div style={{ width: 28, height: 28, background: 'var(--teal-500)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 13 }}>CP</div>
              CivicPulse AI
            </div>
            <p className="footer-desc">Smart Civic Complaint & Resolution Platform. Empowering citizens to build better cities through transparent governance.</p>
          </div>
          <div>
            <h4 className="footer-title">Platform</h4>
            <ul className="footer-links">
              <li><a href="#">About CivicPulse</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#categories">Departments</a></li>
              <li><a href="#map">Live Map</a></li>
            </ul>
          </div>
          <div>
            <h4 className="footer-title">Support</h4>
            <ul className="footer-links">
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <h4 className="footer-title">Emergency</h4>
            <p className="footer-desc" style={{ fontSize: '0.8rem' }}>For life-threatening emergencies, call <strong style={{ color: 'var(--error-500)' }}>112</strong> immediately. CivicPulse is for non-emergency civic issues only.</p>
          </div>
        </div>
        <div className="footer-bottom">© 2026 CivicPulse AI. Built for Hackspora 2.0. All rights reserved.</div>
      </footer>
    </div>
  );
}

function CounterStat({ icon, value, label }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const duration = 2000;
        const step = (timestamp) => {
          if (!start) start = timestamp;
          const progress = Math.min((timestamp - start) / duration, 1);
          setCount(Math.floor(progress * value));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div className="pulse-stat" ref={ref}>
      <div className="pulse-stat-icon">{icon}</div>
      <div className="pulse-stat-value">{count.toLocaleString()}</div>
      <div className="pulse-stat-label">{label}</div>
    </div>
  );
}

function LandingMap() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const userMarkerRef = useRef(null);
  const { addToast } = useToast();
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (mapInstance.current || !mapRef.current) return;
    let cancelled = false;

    function initMap(L) {
      if (cancelled || mapInstance.current || !mapRef.current) return;
      const map = L.map(mapRef.current, { scrollWheelZoom: true, touchZoom: true }).setView([13.0827, 80.2707], 12);
      mapInstance.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      const markers = [
        { lat: 13.0850, lng: 80.2101, title: 'Large pothole', status: 'critical', color: '#DC2626' },
        { lat: 13.0418, lng: 80.2341, title: 'Water pipeline burst', status: 'critical', color: '#DC2626' },
        { lat: 13.0012, lng: 80.2565, title: 'Streetlights not working', status: 'high', color: '#EA580C' },
        { lat: 13.0580, lng: 80.2610, title: 'Pothole on Mount Road', status: 'medium', color: '#D97706' },
        { lat: 13.0339, lng: 80.2676, title: 'Broken streetlight (Fixed)', status: 'resolved', color: '#059669' },
        { lat: 12.9855, lng: 80.2505, title: 'Water leak (Fixed)', status: 'resolved', color: '#059669' },
        { lat: 12.9815, lng: 80.2180, title: 'Road repair complete', status: 'resolved', color: '#059669' },
        { lat: 13.0569, lng: 80.2425, title: 'Drainage overflow', status: 'high', color: '#EA580C' },
        { lat: 13.0025, lng: 80.2578, title: 'Garbage not collected', status: 'medium', color: '#D97706' },
        { lat: 12.9516, lng: 80.1462, title: 'Sewage overflow', status: 'critical', color: '#DC2626' },
      ];

      markers.forEach(m => {
        const icon = L.divIcon({
          className: '',
          html: `<div style="width:14px;height:14px;border-radius:50%;background:${m.color};border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
          iconSize: [14, 14]
        });
        L.marker([m.lat, m.lng], { icon }).addTo(map)
          .bindPopup(`<strong>${m.title}</strong><br/><span style="text-transform:capitalize;color:${m.color};font-weight:600">${m.status}</span>`);
      });
    }

    const L = window.L || (typeof require !== 'undefined' ? require('leaflet') : null);
    if (!L) {
      import('leaflet').then(mod => initMap(mod.default));
    } else {
      initMap(L);
    }

    return () => {
      cancelled = true;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  function handleLocateUser() {
    if (!navigator.geolocation) {
      addToast('Geolocation is not supported by your browser', 'error');
      return;
    }
    setLocating(true);
    addToast('Detecting your GPS location...', 'info');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setLocating(false);

        if (!mapInstance.current) return;
        const L = window.L || (typeof require !== 'undefined' ? require('leaflet') : null);

        mapInstance.current.flyTo([latitude, longitude], 15, {
          animate: true,
          duration: 1.5
        });

        if (userMarkerRef.current) {
          mapInstance.current.removeLayer(userMarkerRef.current);
        }

        if (L) {
          const userIcon = L.divIcon({
            className: '',
            html: `
              <div style="position:relative;width:26px;height:26px;">
                <div style="position:absolute;top:0;left:0;width:26px;height:26px;border-radius:50%;background:rgba(0,180,216,0.35);box-shadow:0 0 12px rgba(0,180,216,0.8);"></div>
                <div style="position:absolute;top:4px;left:4px;width:18px;height:18px;border-radius:50%;background:var(--teal-500);border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>
              </div>
            `,
            iconSize: [26, 26],
            iconAnchor: [13, 13]
          });

          const marker = L.marker([latitude, longitude], { icon: userIcon }).addTo(mapInstance.current);
          marker.bindPopup(`
            <div style="text-align:center;padding:4px;">
              <strong style="color:var(--teal-700);font-size:0.95rem;">📍 You Are Here</strong><br/>
              <span style="font-size:0.8rem;color:#64748b;">GPS Location Found (±${Math.round(accuracy)}m)</span>
            </div>
          `).openPopup();

          userMarkerRef.current = marker;
        }

        addToast('Your current GPS location found & map centered!', 'success');
      },
      (err) => {
        setLocating(false);
        console.error('Geolocation error:', err);
        addToast('Could not retrieve GPS location. Please allow location permissions in your browser.', 'error');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  function handleResetCenter() {
    if (mapInstance.current) {
      mapInstance.current.flyTo([13.0827, 80.2707], 12, { animate: true });
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 480 }}>
      {/* Map Controls Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, padding: '12px 16px', background: '#0f172a', color: 'white', borderTopLeftRadius: 'var(--radius-xl)', borderTopRightRadius: 'var(--radius-xl)' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleLocateUser}
            disabled={locating}
            className="btn btn-teal btn-sm"
            style={{ gap: 6 }}
          >
            {locating ? <Loader2 size={14} className="spin" /> : <Crosshair size={14} />}
            <span>{locating ? 'Finding GPS...' : 'Locate My Current Position'}</span>
          </button>

          <button
            type="button"
            onClick={handleResetCenter}
            className="btn btn-secondary btn-sm"
            style={{ gap: 6, color: 'white', borderColor: 'rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)' }}
          >
            <Navigation size={14} />
            <span>Center City</span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10, fontSize: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#DC2626', display: 'inline-block' }}></span> Critical</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#EA580C', display: 'inline-block' }}></span> High</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#D97706', display: 'inline-block' }}></span> Medium</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#059669', display: 'inline-block' }}></span> Resolved</span>
        </div>
      </div>

      {/* Leaflet Map Target Div */}
      <div ref={mapRef} style={{ flex: 1, minHeight: 430, width: '100%' }} />
    </div>
  );
}
