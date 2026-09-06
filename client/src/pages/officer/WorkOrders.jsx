import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { PriorityBadge, StatusBadge } from '../../components/shared.jsx';
import { CheckCircle, MapPin, Play, Search, Timer } from 'lucide-react';

function SLA({ deadline }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(timer); }, []);
  if (!deadline) return <span style={{ color: 'var(--gray-400)' }}>No SLA</span>;
  const delta = new Date(deadline).getTime() - now;
  const hours = Math.floor(Math.abs(delta) / 3600000);
  const mins = Math.floor((Math.abs(delta) % 3600000) / 60000);
  return <span style={{ color: delta < 0 ? 'var(--error-600)' : hours < 8 ? 'var(--warning-600)' : 'var(--success-600)', fontWeight: 700 }}>{delta < 0 ? `Breached ${hours}h` : `${hours}h ${mins}m left`}</span>;
}

export default function WorkOrders() {
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState('');

  async function load() {
    try { const res = await api.get('/officer/complaints'); setOrders(res.data.complaints || []); }
    catch { addToast('Unable to load work orders', 'error'); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  async function action(order, status) {
    setBusy(order._id);
    try {
      if (status === 'officer_accepted') await api.put(`/officer/complaints/${order.complaintId}/claim`);
      else await api.put(`/officer/complaints/${order.complaintId}/status`, { status });
      addToast(status === 'in_progress' ? 'Work order started' : 'Work order claimed', 'success');
      load();
    } catch (e) { addToast(e.response?.data?.error || 'Could not update work order', 'error'); }
    finally { setBusy(''); }
  }
  const visible = useMemo(() => orders.filter(o => `${o.complaintId} ${o.title} ${o.address}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => {
    const rank = { P1: 0, P2: 1, P3: 2 }; return (rank[a.priority] ?? 3) - (rank[b.priority] ?? 3) || new Date(a.slaDeadline) - new Date(b.slaDeadline);
  }), [orders, search]);

  return <div className="fade-in">
    <h1 className="page-title">Assigned Work Orders</h1>
    <p className="page-subtitle">Priority-sorted field tasks for your ward. SLA timers update live.</p>
    <div className="search-input" style={{ maxWidth: 460, marginBottom: 20 }}><Search size={18} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order, issue or location" /></div>
    {loading ? <div className="skeleton skeleton-card" style={{ height: 260 }} /> : visible.length === 0 ? <div className="empty-state"><div className="empty-state-title">No assigned work orders</div><div className="empty-state-text">New work assigned to your ward will appear here.</div></div> : <div style={{ display: 'grid', gap: 12 }}>
      {visible.map(order => <div className="card" key={order._id} style={{ padding: 18, borderLeft: `4px solid ${order.priority === 'P1' ? 'var(--error-500)' : order.priority === 'P2' ? 'var(--warning-500)' : 'var(--teal-500)'}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}><div style={{ minWidth: 230, flex: 1 }}><div style={{ color: 'var(--primary-600)', fontSize: '.78rem', fontWeight: 800 }}>{order.complaintId}</div><Link to={`/officer/complaints/${order.complaintId}`} style={{ color: 'var(--gray-900)', fontWeight: 700, fontSize: '1.02rem', textDecoration: 'none' }}>{order.title}</Link><div style={{ color: 'var(--gray-500)', fontSize: '.82rem', marginTop: 7, display: 'flex', gap: 5, alignItems: 'center' }}><MapPin size={14} />{order.address || 'Location tagged'}</div></div><div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}><PriorityBadge priority={order.priority} /><StatusBadge status={order.status} /></div></div>
        <div style={{ borderTop: '1px solid var(--gray-100)', marginTop: 14, paddingTop: 12, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '.8rem' }}><Timer size={15} /><SLA deadline={order.slaDeadline} /></span><span style={{ flex: 1 }} />{['assigned'].includes(order.status) && <button disabled={busy === order._id} onClick={() => action(order, 'officer_accepted')} className="btn btn-primary btn-sm"><CheckCircle size={15} /> Claim</button>}{['officer_accepted', 'assigned'].includes(order.status) && <button disabled={busy === order._id} onClick={() => action(order, 'in_progress')} className="btn btn-teal btn-sm"><Play size={15} /> In Progress</button>}<Link className="btn btn-ghost btn-sm" to={`/officer/complaints/${order.complaintId}`}>Open order</Link></div>
      </div>)}
    </div>}
  </div>;
}
