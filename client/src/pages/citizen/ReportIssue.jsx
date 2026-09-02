import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext.jsx';
import api from '../../services/api.js';
import { CATEGORIES } from '../../components/shared.jsx';
import VoiceInput from '../../components/VoiceInput.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { ArrowLeft, ArrowRight, Upload, X, MapPin, Brain, CheckCircle, Image, AlertTriangle } from 'lucide-react';

const STEPS = ['Issue Details', 'Upload Evidence', 'Location', 'AI Analysis'];
const SUBCATEGORIES = {
  'Roads': ['Pothole', 'Road Crack', 'Speed Breaker', 'Unpaved Road', 'Road Marking'],
  'Streetlights': ['Not Working', 'Flickering', 'Damaged Pole', 'Missing Light'],
  'Garbage': ['Not Collected', 'Overflowing Bin', 'Illegal Dumping', 'Dead Animal'],
  'Water': ['No Supply', 'Pipeline Leak', 'Contamination', 'Low Pressure'],
  'Drainage': ['Blocked Drain', 'Overflow', 'Open Manhole', 'Sewage Leak'],
  'Traffic': ['Signal Malfunction', 'Missing Sign', 'Parking Issue', 'Road Block'],
  'Public Safety': ['Unsafe Structure', 'Stray Animals', 'Open Wire', 'Crime Spot'],
  'Parks': ['Broken Bench', 'Overgrown', 'Damaged Playground', 'Littering'],
  'Public Buildings': ['Maintenance', 'Broken Toilet', 'No Water', 'Unsafe'],
  'Other': ['Other']
};

export default function ReportIssue() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ title: '', description: '', category: '', subcategory: '', severity: 'medium', dateObserved: new Date().toISOString().split('T')[0] });
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState({ lat: null, lng: null, address: '' });
  const [analysis, setAnalysis] = useState(null);
  const [duplicates, setDuplicates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);

  function nextStep() {
    if (step === 0) {
      if (!form.title || !form.description || !form.category) { addToast('Please fill in required fields', 'warning'); return; }
    }
    if (step === 2) {
      if (!location.lat || !location.lng) { addToast('Please select a location', 'warning'); return; }
      runAnalysis();
    }
    if (step < 3) setStep(step + 1);
  }

  function prevStep() { if (step > 0) setStep(step - 1); }

  function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) { addToast('File too large (max 10MB)', 'warning'); return; }
      const reader = new FileReader();
      reader.onload = () => setImages(prev => [...prev, { file, preview: reader.result, name: file.name }]);
      reader.readAsDataURL(file);
    });
  }

  function removeImage(idx) { setImages(prev => prev.filter((_, i) => i !== idx)); }

  function getCurrentLocation() {
    if (!navigator.geolocation) { addToast('Geolocation not supported', 'error'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude, address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` });
        if (mapInstance.current) {
          mapInstance.current.setView([latitude, longitude], 16);
          updateMarker(latitude, longitude);
        }
        reverseGeocode(latitude, longitude);
      },
      () => { addToast('Could not get location. Please pin manually.', 'warning'); }
    );
  }

  async function reverseGeocode(lat, lng) {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data.display_name) setLocation(prev => ({ ...prev, address: data.display_name.split(',').slice(0, 3).join(', ') }));
    } catch (e) { /* use coordinates */ }
  }

  function updateMarker(lat, lng) {
    import('leaflet').then(L => {
      if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
      else {
        markerRef.current = L.default.marker([lat, lng], { draggable: true }).addTo(mapInstance.current);
        markerRef.current.on('dragend', () => {
          const pos = markerRef.current.getLatLng();
          setLocation({ lat: pos.lat, lng: pos.lng, address: `${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}` });
          reverseGeocode(pos.lat, pos.lng);
        });
      }
    });
  }

  useEffect(() => {
    if (step === 2 && mapRef.current && !mapInstance.current) {
      import('leaflet').then(L => {
        const map = L.default.map(mapRef.current).setView([13.0827, 80.2707], 13);
        L.default.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap'
        }).addTo(map);

        map.on('click', (e) => {
          const { lat, lng } = e.latlng;
          setLocation({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
          updateMarker(lat, lng);
          reverseGeocode(lat, lng);
        });

        mapInstance.current = map;
        if (location.lat) { map.setView([location.lat, location.lng], 16); updateMarker(location.lat, location.lng); }
      });
    }
    return () => { if (step !== 2 && mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; markerRef.current = null; } };
  }, [step]);

  async function runAnalysis() {
    setLoading(true);
    try {
      const res = await api.post('/ai/analyze', {
        title: form.title, description: form.description, category: form.category,
        severity: form.severity, latitude: location.lat, longitude: location.lng
      });
      setAnalysis(res.data.analysis);
      setDuplicates(res.data.analysis?.duplicates || []);
    } catch (e) {
      addToast('AI analysis failed, using defaults', 'warning');
      setAnalysis({ issueDetected: form.category, department: 'General Administration', severity: form.severity, estimatedPublicImpact: 'Medium', suggestedPriority: 'P3', duplicateProbability: 0, recommendedSLA: '72 Hours', reasons: ['Standard priority assessment'] });
    }
    setLoading(false);
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const evidenceUrls = images.map(img => img.preview).filter(Boolean);

      const res = await api.post('/complaints', {
        title: form.title,
        description: form.description,
        category: form.category,
        subcategory: form.subcategory,
        severity: form.severity,
        latitude: location.lat,
        longitude: location.lng,
        address: location.address,
        evidenceUrls: evidenceUrls.length > 0 ? evidenceUrls : undefined
      });
      setSubmittedData(res.data);
      setSubmitted(true);
      addToast('Complaint submitted successfully!', 'success');
    } catch (e) {
      addToast(e.response?.data?.error || 'Failed to submit complaint', 'error');
    }
    setLoading(false);
  }

  if (submitted && submittedData) {
    return (
      <div className="fade-in" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: '40px 0' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--success-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <CheckCircle size={40} style={{ color: 'var(--success-600)' }} />
        </div>
        <h2 style={{ marginBottom: 8 }}>Complaint Successfully Submitted! 🎉</h2>
        <p style={{ color: 'var(--gray-500)', marginBottom: 32 }}>Your complaint has been registered and is being processed.</p>

        <div className="card" style={{ textAlign: 'left', marginBottom: 24 }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-600)', marginBottom: 16 }}>
            {submittedData.complaint.complaintId}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.875rem' }}>
            <div><span style={{ color: 'var(--gray-500)' }}>Category:</span> <strong>{submittedData.complaint.category}</strong></div>
            <div><span style={{ color: 'var(--gray-500)' }}>Priority:</span> <strong>{submittedData.complaint.priority}</strong></div>
            <div><span style={{ color: 'var(--gray-500)' }}>Department:</span> <strong>{submittedData.analysis?.department || 'Pending'}</strong></div>
            <div><span style={{ color: 'var(--gray-500)' }}>SLA:</span> <strong>{submittedData.analysis?.recommendedSLA || '72 Hours'}</strong></div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => navigate(`/citizen/complaints/${submittedData.complaint.complaintId}`)}>Track Complaint</button>
          <button className="btn btn-secondary" onClick={() => navigate('/citizen/map')}>View on Map</button>
          <button className="btn btn-ghost" onClick={() => navigate('/citizen')}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ maxWidth: 720, margin: '0 auto' }}>
      <h1 className="page-title">Report a Civic Issue</h1>
      <p className="page-subtitle">Help improve your city by reporting problems</p>

      {/* Step Indicator */}
      <div className="step-indicator">
        {STEPS.map((s, i) => (
          <div key={i} style={{ display: 'contents' }}>
            <div className={`step-dot ${i < step ? 'completed' : i === step ? 'active' : ''}`}>
              {i < step ? '✓' : i + 1}
            </div>
            {i < STEPS.length - 1 && <div className={`step-line ${i < step ? 'completed' : ''}`} />}
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginBottom: 32, fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>{STEPS[step]}</div>

      {/* Step 0: Issue Details */}
      {step === 0 && (
        <div className="card">
          {/* Voice Speech-to-Text Input */}
          <VoiceInput
            onTranscription={(text) => {
              setForm(prev => ({
                ...prev,
                title: prev.title || text.slice(0, 70),
                description: text
              }));
            }}
            onCategoryDetect={(detectedCategory) => {
              setForm(prev => ({ ...prev, category: detectedCategory }));
            }}
          />

          <div className="form-group">
            <label className="form-label">Complaint Title *</label>
            <input className="form-input" placeholder="e.g., Large pothole near main junction" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea className="form-textarea" placeholder="Describe the issue in detail..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={4} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-select" value={form.category} onChange={e => setForm({...form, category: e.target.value, subcategory: ''})}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Subcategory</label>
              <select className="form-select" value={form.subcategory} onChange={e => setForm({...form, subcategory: e.target.value})}>
                <option value="">Select subcategory</option>
                {(SUBCATEGORIES[form.category] || []).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Severity</label>
              <select className="form-select" value={form.severity} onChange={e => setForm({...form, severity: e.target.value})}>
                <option value="low">Low — Minor inconvenience</option>
                <option value="medium">Medium — Affects daily life</option>
                <option value="high">High — Safety risk</option>
                <option value="critical">Critical — Immediate danger</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date Observed</label>
              <input className="form-input" type="date" value={form.dateObserved} onChange={e => setForm({...form, dateObserved: e.target.value})} />
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Upload Evidence */}
      {step === 1 && (
        <div className="card">
          <h4 style={{ marginBottom: 16 }}>Upload Photos or Videos</h4>
          <div style={{ border: '2px dashed var(--gray-300)', borderRadius: 'var(--radius-lg)', padding: 40, textAlign: 'center', marginBottom: 16, cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => document.getElementById('file-upload').click()}>
            <Upload size={40} style={{ color: 'var(--gray-400)', marginBottom: 12 }} />
            <p style={{ fontWeight: 600, color: 'var(--gray-600)' }}>Click to upload or drag files</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>PNG, JPG, MP4 up to 10MB</p>
            <input id="file-upload" type="file" accept="image/*,video/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} />
          </div>
          {images.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
              {images.map((img, i) => (
                <div key={i} style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--gray-200)' }}>
                  <img src={img.preview} alt={img.name} style={{ width: '100%', height: 100, objectFit: 'cover' }} />
                  <button onClick={() => removeImage(i)} style={{ position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="form-hint" style={{ marginTop: 12 }}>Evidence helps expedite the resolution process. You can skip this step.</p>
        </div>
      )}

      {/* Step 2: Location */}
      {step === 2 && (
        <div className="card">
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <button className="btn btn-teal" onClick={getCurrentLocation}><MapPin size={16} /> Use My Current Location</button>
            <span style={{ color: 'var(--gray-400)', alignSelf: 'center' }}>or click on the map</span>
          </div>
          <div ref={mapRef} style={{ height: 400, borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--gray-200)', marginBottom: 16 }} />
          {location.lat && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.875rem', background: 'var(--gray-50)', padding: 16, borderRadius: 'var(--radius-md)' }}>
              <div><span style={{ color: 'var(--gray-500)' }}>Latitude:</span> <strong>{location.lat?.toFixed(6)}</strong></div>
              <div><span style={{ color: 'var(--gray-500)' }}>Longitude:</span> <strong>{location.lng?.toFixed(6)}</strong></div>
              <div style={{ gridColumn: '1/-1' }}><span style={{ color: 'var(--gray-500)' }}>Address:</span> <strong>{location.address}</strong></div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: AI Analysis */}
      {step === 3 && (
        <div>
          {loading ? (
            <div className="card" style={{ textAlign: 'center', padding: 60 }}>
              <Brain size={48} style={{ color: 'var(--teal-500)', marginBottom: 16, animation: 'pulse 1.5s infinite' }} />
              <h3>Analyzing your complaint...</h3>
              <p style={{ color: 'var(--gray-500)' }}>CivicPulse AI is classifying the issue and calculating priority</p>
            </div>
          ) : analysis && (
            <div>
              <div className="card" style={{ marginBottom: 16, borderLeft: '4px solid var(--teal-500)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                  <Brain size={22} style={{ color: 'var(--teal-500)' }} /> AI Civic Analysis
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
                  <div><div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Issue Detected</div><div style={{ fontWeight: 700 }}>{analysis.issueDetected}</div></div>
                  <div><div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Department</div><div style={{ fontWeight: 700 }}>{analysis.department}</div></div>
                  <div><div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Severity</div><div style={{ fontWeight: 700, textTransform: 'capitalize' }}>{analysis.severity}</div></div>
                  <div><div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Public Impact</div><div style={{ fontWeight: 700 }}>{analysis.estimatedPublicImpact}</div></div>
                  <div><div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Suggested Priority</div><div style={{ fontWeight: 800, fontSize: '1.25rem', color: analysis.suggestedPriority === 'P1' ? 'var(--error-600)' : analysis.suggestedPriority === 'P2' ? 'var(--warning-600)' : 'var(--primary-600)' }}>{analysis.suggestedPriority}</div></div>
                  <div><div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Duplicate Probability</div><div style={{ fontWeight: 700 }}>{analysis.duplicateProbability}%</div></div>
                  <div><div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Recommended SLA</div><div style={{ fontWeight: 700 }}>{analysis.recommendedSLA}</div></div>
                </div>

                {analysis.reasons?.length > 0 && (
                  <div style={{ background: 'var(--gray-50)', padding: 16, borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 8 }}>Why {analysis.suggestedPriority} Priority?</div>
                    <ul style={{ paddingLeft: 20, margin: 0 }}>
                      {analysis.reasons.map((r, i) => <li key={i} style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 4 }}>{r}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              {/* Duplicate Detection */}
              {duplicates.length > 0 && (
                <div className="card" style={{ borderLeft: '4px solid var(--warning-500)', marginBottom: 16 }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: 'var(--warning-600)' }}>
                    <AlertTriangle size={20} /> We found similar issues nearby
                  </h4>
                  {duplicates.slice(0, 3).map((d, i) => (
                    <div key={i} style={{ padding: 12, background: 'var(--warning-50)', borderRadius: 'var(--radius-md)', marginBottom: 8, fontSize: '0.875rem' }}>
                      <div style={{ fontWeight: 600 }}>{d.title}</div>
                      <div style={{ color: 'var(--gray-500)', marginTop: 4 }}>
                        {d.complaintId} • {d.distance}m away • {d.similarity}% similar • Status: {d.status}
                      </div>
                    </div>
                  ))}
                  <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: 8 }}>
                    You can still submit your complaint to add community validation.
                  </p>
                </div>
              )}

              <button className="btn btn-primary btn-lg w-full" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Submitting...' : '✅ Submit Complaint'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
        {step > 0 ? <button className="btn btn-secondary" onClick={prevStep}><ArrowLeft size={16} /> Previous</button> : <div />}
        {step < 3 && <button className="btn btn-primary" onClick={nextStep}>Next <ArrowRight size={16} /></button>}
      </div>
    </div>
  );
}
