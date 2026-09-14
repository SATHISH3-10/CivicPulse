import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, ArrowLeft, Shield, Sparkles, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';
import { formatIndianPhone } from '../components/shared.jsx';

export default function Contact() {
  const { addToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      addToast('Please fill in your name, email, and message', 'warning');
      return;
    }
    setSubmitted(true);
    addToast('Thank you for contacting CivicPulse AI! Your message has been received.', 'success');
  }

  return (
    <div className="fade-in" style={{ minHeight: '100vh', background: 'var(--gray-50)', paddingBottom: 60 }}>
      {/* Top Navigation Bar */}
      <header style={{ background: '#0f172a', padding: '16px 24px', color: 'white' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'white' }}>
            <div style={{ width: 36, height: 36, background: 'var(--teal-500)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16 }}>CP</div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>CivicPulse AI</span>
          </Link>

          <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: '0.9rem' }}>
            <Link to="/help" style={{ color: 'var(--gray-300)', textDecoration: 'none' }}>Help Center</Link>
            <Link to="/login" className="btn btn-teal btn-sm">Sign In</Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: 1000, margin: '40px auto', padding: '0 20px' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--gray-500)', marginBottom: 20, fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Return to Home
        </Link>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: 8 }}>Contact CivicPulse Support</h1>
          <p style={{ color: 'var(--gray-600)', fontSize: '1rem', margin: 0 }}>
            Have questions about civic issue reporting, officer credentials, or municipal integration? Get in touch with our team.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {/* Contact Details Card */}
          <div className="card" style={{ padding: 28, background: 'white' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 20, color: 'var(--gray-900)' }}>Municipal Support Desk</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, background: 'var(--teal-50)', color: 'var(--teal-600)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Mail size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Email Support</div>
                  <div style={{ fontWeight: 700, color: 'var(--gray-900)' }}>support@civicpulse.org</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>Response within 24 hours</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, background: 'var(--teal-50)', color: 'var(--teal-600)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Phone size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Helpline Number</div>
                  <div style={{ fontWeight: 700, color: 'var(--gray-900)' }}>+91 1800-425-1919 (Toll-Free)</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>Available Mon–Sat: 8:00 AM – 8:00 PM</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, background: 'var(--teal-50)', color: 'var(--teal-600)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase' }}>Headquarters</div>
                  <div style={{ fontWeight: 700, color: 'var(--gray-900)' }}>CivicPulse Technology Hub</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>Ripon Building Campus, Chennai, Tamil Nadu - 600003</div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 24, padding: 16, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: '#991b1b' }}>
              <strong>Emergency Notice:</strong> For immediate life-threatening emergencies, dial <strong>112</strong> immediately. CivicPulse is for non-emergency public infrastructure reporting.
            </div>
          </div>

          {/* Contact Form Card */}
          <div className="card" style={{ padding: 28, background: 'white' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 20, color: 'var(--gray-900)' }}>Send Us a Message</h3>

            {submitted ? (
              <div className="fade-in" style={{ textAlign: 'center', padding: '32px 16px' }}>
                <div style={{ width: 56, height: 56, background: 'var(--teal-50)', color: 'var(--teal-600)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <CheckCircle2 size={32} />
                </div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8, color: 'var(--gray-900)' }}>Message Sent Successfully!</h4>
                <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem', marginBottom: 20 }}>
                  Our support desk has received your inquiry. We will reply to <strong>{form.email}</strong> as soon as possible.
                </p>
                <button type="button" onClick={() => setSubmitted(false)} className="btn btn-secondary btn-sm">Send Another Message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="form-label">Your Full Name <span style={{ color: 'red' }}>*</span></label>
                  <input type="text" className="form-control" placeholder="Anitha Sundaram" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>

                <div>
                  <label className="form-label">Email Address <span style={{ color: 'red' }}>*</span></label>
                  <input type="email" className="form-control" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>

                <div>
                  <label className="form-label">Phone Number (Optional)</label>
                  <input type="tel" className="form-control" placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm({ ...form, phone: formatIndianPhone(e.target.value) })} />
                </div>

                <div>
                  <label className="form-label">Subject / Topic</label>
                  <input type="text" className="form-control" placeholder="e.g. Question about complaint resolution SLA" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
                </div>

                <div>
                  <label className="form-label">Message <span style={{ color: 'red' }}>*</span></label>
                  <textarea className="form-control" rows={4} placeholder="Describe your question or feedback..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
                </div>

                <button type="submit" className="btn btn-teal btn-lg" style={{ justifyContent: 'center', gap: 8, marginTop: 4 }}>
                  <Send size={16} /> Submit Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
