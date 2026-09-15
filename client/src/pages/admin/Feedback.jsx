import { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { formatDate, timeAgo } from '../../components/shared.jsx';
import {
  MessageSquare, Mail, Phone, Clock, CheckCircle2, AlertCircle, Send,
  User, Search, Filter, RefreshCw, ChevronRight, Inbox, Shield, ArrowRight
} from 'lucide-react';

export default function AdminFeedback() {
  const { addToast } = useToast();
  const [inquiries, setInquiries] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, reviewed: 0, resolved: 0 });
  const [adminEmail, setAdminEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected Inquiry Modal / Reply State
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, []);

  async function fetchFeedback() {
    try {
      setLoading(true);
      const res = await api.get('/admin/feedback');
      setInquiries(res.data.inquiries || []);
      setStats(res.data.stats || { total: 0, pending: 0, reviewed: 0, resolved: 0 });
      setAdminEmail(res.data.adminEmail || 'support@civicpulse.org');
    } catch (err) {
      console.error('Failed to load feedback:', err);
      addToast('Failed to load user feedback and inquiries', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id, newStatus) {
    try {
      await api.put(`/admin/feedback/${id}/status`, { status: newStatus });
      addToast(`Inquiry status updated to "${newStatus}"`, 'success');
      setInquiries(prev => prev.map(item => item._id === id ? { ...item, status: newStatus } : item));
      if (selectedInquiry && selectedInquiry._id === id) {
        setSelectedInquiry(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  }

  async function handleSendReply(e) {
    e.preventDefault();
    if (!selectedInquiry || !replyText.trim()) return;

    try {
      setSendingReply(true);
      const res = await api.post(`/admin/feedback/${selectedInquiry._id}/reply`, { replyMessage: replyText });
      addToast(`Reply successfully emailed to ${selectedInquiry.email}!`, 'success');
      
      const updatedInquiry = res.data.inquiry;
      setInquiries(prev => prev.map(item => item._id === updatedInquiry._id ? updatedInquiry : item));
      setSelectedInquiry(updatedInquiry);
      setReplyText('');
    } catch (err) {
      console.error('Send reply error:', err);
      addToast(err.response?.data?.error || 'Failed to send email reply', 'error');
    } finally {
      setSendingReply(false);
    }
  }

  const filteredInquiries = inquiries.filter(item => {
    const matchesStatus = statusFilter === 'all' || (item.status || 'pending') === statusFilter;
    const matchesSearch = searchQuery === '' ||
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.message?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="fade-in">
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <MessageSquare className="text-teal-600" size={28} /> User Feedback & Support Inquiries
          </h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Incoming messages from the website contact form and citizens
          </p>
        </div>

        <button onClick={fetchFeedback} className="btn btn-secondary" style={{ gap: 8 }}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Admin Email Notification Banner */}
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-lg)', padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, background: '#dcfce7', color: '#15803d', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Mail size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#14532d', fontSize: '0.95rem' }}>Connected Admin Email Address</div>
            <div style={{ fontSize: '0.85rem', color: '#166534' }}>
              All citizen feedback submitted via the Contact Form is automatically forwarded to: <strong style={{ color: '#0f172a' }}>{adminEmail}</strong>
            </div>
          </div>
        </div>
        <span className="badge badge-success" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Active Connection</span>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--teal-100)', color: 'var(--teal-700)' }}><Inbox size={22} /></div>
          <div className="stat-info">
            <div className="stat-label">Total Messages</div>
            <div className="stat-value">{stats.total || 0}</div>
          </div>
        </div>

        <div className="stat-card" onClick={() => setStatusFilter('pending')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon" style={{ background: '#FEF3C7', color: '#D97706' }}><Clock size={22} /></div>
          <div className="stat-info">
            <div className="stat-label">Pending Review</div>
            <div className="stat-value" style={{ color: '#D97706' }}>{stats.pending || 0}</div>
          </div>
        </div>

        <div className="stat-card" onClick={() => setStatusFilter('reviewed')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon" style={{ background: '#E0F2FE', color: '#0284C7' }}><AlertCircle size={22} /></div>
          <div className="stat-info">
            <div className="stat-label">Reviewed</div>
            <div className="stat-value" style={{ color: '#0284C7' }}>{stats.reviewed || 0}</div>
          </div>
        </div>

        <div className="stat-card" onClick={() => setStatusFilter('resolved')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon" style={{ background: '#DCFCE7', color: '#16A34A' }}><CheckCircle2 size={22} /></div>
          <div className="stat-info">
            <div className="stat-label">Resolved / Replied</div>
            <div className="stat-value" style={{ color: '#16A34A' }}>{stats.resolved || 0}</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1, minWidth: 260 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, email, or message..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: 36 }}
            />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: 6, background: 'var(--gray-100)', padding: 4, borderRadius: 'var(--radius-md)' }}>
          {['all', 'pending', 'reviewed', 'resolved'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                border: 'none',
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: statusFilter === status ? 'white' : 'transparent',
                color: statusFilter === status ? 'var(--primary-700)' : 'var(--gray-600)',
                boxShadow: statusFilter === status ? 'var(--shadow-xs)' : 'none',
                textTransform: 'capitalize'
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Feedback Grid List */}
      {loading ? (
        <div style={{ padding: 40 }}>{[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 90, marginBottom: 12 }} />)}</div>
      ) : filteredInquiries.length === 0 ? (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--gray-500)' }}>
          <Inbox size={48} style={{ margin: '0 auto 16px', opacity: 0.4, color: 'var(--teal-600)' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-800)', marginBottom: 6 }}>No feedback messages found</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
            {searchQuery || statusFilter !== 'all' ? 'Try adjusting your search or filter options.' : 'User feedback submitted through the contact page will appear here.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {filteredInquiries.map(inquiry => {
            const isPending = (inquiry.status || 'pending') === 'pending';
            const isResolved = inquiry.status === 'resolved';

            return (
              <div
                key={inquiry._id}
                className="card fade-in"
                style={{
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  borderTop: `4px solid ${isPending ? '#f59e0b' : isResolved ? '#10b981' : '#0284c7'}`,
                  transition: 'transform 0.15s, box-shadow 0.15s'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--gray-900)', margin: 0 }}>
                        {inquiry.subject || 'Support Inquiry'}
                      </h4>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: 2 }}>
                        Received {timeAgo(inquiry.createdAt)} ({formatDate(inquiry.createdAt)})
                      </div>
                    </div>

                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 20,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background: isPending ? '#FEF3C7' : isResolved ? '#DCFCE7' : '#E0F2FE',
                        color: isPending ? '#D97706' : isResolved ? '#16A34A' : '#0284C7'
                      }}
                    >
                      {inquiry.status || 'pending'}
                    </span>
                  </div>

                  <div style={{ background: 'var(--gray-50)', padding: 12, borderRadius: 'var(--radius-md)', marginBottom: 12, fontSize: '0.85rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <User size={14} className="text-teal-600" /> {inquiry.name}
                    </div>
                    <div style={{ color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <Mail size={14} /> <a href={`mailto:${inquiry.email}`} style={{ color: 'var(--teal-600)', textDecoration: 'none' }}>{inquiry.email}</a>
                    </div>
                    {inquiry.phone && (
                      <div style={{ color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        <Phone size={14} /> {inquiry.phone}
                      </div>
                    )}
                  </div>

                  <p style={{ fontSize: '0.875rem', color: 'var(--gray-700)', lineHeight: 1.5, margin: '0 0 16px 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    "{inquiry.message}"
                  </p>

                  {/* Replies count */}
                  {inquiry.replies && inquiry.replies.length > 0 && (
                    <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
                      <CheckCircle2 size={14} /> {inquiry.replies.length} email response sent
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: '1px solid var(--gray-100)' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => setSelectedInquiry(inquiry)}
                  >
                    View & Reply
                  </button>

                  <select
                    className="form-control"
                    value={inquiry.status || 'pending'}
                    onChange={e => handleStatusChange(inquiry._id, e.target.value)}
                    style={{ width: 'auto', fontSize: '0.75rem', padding: '4px 8px', fontWeight: 600 }}
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inquiry Detail & Email Reply Modal */}
      {selectedInquiry && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card fade-in" style={{ maxWidth: 640, width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: 28, background: 'white', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <span className="badge badge-teal" style={{ marginBottom: 6 }}>Contact Inquiry Details</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gray-900)', margin: 0 }}>
                  {selectedInquiry.subject || 'Support Inquiry'}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: 4 }}>
                  Submitted on {formatDate(selectedInquiry.createdAt)}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: 'var(--gray-400)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Citizen Sender Info */}
            <div style={{ background: 'var(--gray-50)', padding: 16, borderRadius: 'var(--radius-md)', marginBottom: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase' }}>Sender Name</div>
                  <div style={{ fontWeight: 700, color: 'var(--gray-900)' }}>{selectedInquiry.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase' }}>Email Address</div>
                  <div style={{ fontWeight: 700, color: 'var(--teal-700)' }}>
                    <a href={`mailto:${selectedInquiry.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>{selectedInquiry.email}</a>
                  </div>
                </div>
                {selectedInquiry.phone && (
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase' }}>Phone Number</div>
                    <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{selectedInquiry.phone}</div>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase' }}>Current Status</div>
                  <div style={{ marginTop: 2 }}>
                    <select
                      className="form-control"
                      value={selectedInquiry.status || 'pending'}
                      onChange={e => handleStatusChange(selectedInquiry._id, e.target.value)}
                      style={{ fontSize: '0.8rem', padding: '2px 6px' }}
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Original Citizen Message */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gray-800)', marginBottom: 8 }}>Original Message from Citizen:</div>
              <div style={{ padding: 16, background: '#f8fafc', borderLeft: '4px solid var(--teal-500)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', color: 'var(--gray-800)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {selectedInquiry.message}
              </div>
            </div>

            {/* Previous Replies if any */}
            {selectedInquiry.replies && selectedInquiry.replies.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gray-800)', marginBottom: 8 }}>Previous Municipal Responses:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {selectedInquiry.replies.map((reply, idx) => (
                    <div key={idx} style={{ padding: 14, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#166534', fontWeight: 700, marginBottom: 4 }}>
                        <span>Reply from {reply.repliedBy || 'Admin'}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>{timeAgo(reply.createdAt)}</span>
                      </div>
                      <div style={{ color: '#14532d', whiteSpace: 'pre-wrap' }}>{reply.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reply Form */}
            <form onSubmit={handleSendReply} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--gray-900)' }}>
                Send Official Email Response to <span style={{ color: 'var(--teal-600)' }}>{selectedInquiry.email}</span>
              </label>
              <textarea
                className="form-control"
                rows={4}
                placeholder="Type your official response here. This message will be emailed directly to the citizen..."
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                required
              />

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 4 }}>
                <button type="button" onClick={() => setSelectedInquiry(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-teal" disabled={sendingReply || !replyText.trim()} style={{ gap: 8 }}>
                  <Send size={16} /> {sendingReply ? 'Sending Email...' : 'Send Email Response'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
