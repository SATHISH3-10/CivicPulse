import { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import api from '../../services/api.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const res = await api.get('/admin/analytics');
      setAnalytics(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  if (loading) return <div>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 300, marginBottom: 16 }} />)}</div>;
  if (!analytics) return <div className="empty-state"><div className="empty-state-title">No data available</div></div>;

  const { overTime, byCategory, byStatus, stats } = analytics;

  const lineData = {
    labels: overTime?.map(d => d.date.slice(5)) || [],
    datasets: [
      { label: 'Submitted', data: overTime?.map(d => d.submitted) || [], borderColor: '#3B82F6', backgroundColor: 'rgba(59,130,246,0.1)', fill: true, tension: 0.4 },
      { label: 'Resolved', data: overTime?.map(d => d.resolved) || [], borderColor: '#10B981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4 }
    ]
  };

  const categoryColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#F97316', '#14B8A6', '#6366F1'];
  const cats = Object.entries(byCategory || {}).sort((a, b) => b[1] - a[1]);
  const doughnutData = {
    labels: cats.map(c => c[0]),
    datasets: [{
      data: cats.map(c => c[1]),
      backgroundColor: categoryColors.slice(0, cats.length),
      borderWidth: 2, borderColor: '#fff'
    }]
  };

  const statuses = Object.entries(byStatus || {}).sort((a, b) => b[1] - a[1]);
  const barData = {
    labels: statuses.map(s => s[0].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())),
    datasets: [{
      label: 'Complaints', data: statuses.map(s => s[1]),
      backgroundColor: ['#6B7280', '#8B5CF6', '#3B82F6', '#0EA5E9', '#F59E0B', '#10B981', '#06B6D4', '#059669', '#EF4444', '#DC2626'],
      borderRadius: 6
    }]
  };

  const chartOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { padding: 16, font: { size: 12, family: 'Inter' } } } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true } } };
  const pieOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { padding: 12, font: { size: 11, family: 'Inter' } } } } };

  return (
    <div className="fade-in">
      <h1 className="page-title">Analytics</h1>
      <p className="page-subtitle">Comprehensive view of civic complaint data</p>

      {/* KPI Row */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-info"><div className="stat-label">Resolution Rate</div><div className="stat-value" style={{ color: 'var(--success-600)' }}>{stats.resolutionRate}%</div></div></div>
        <div className="stat-card"><div className="stat-info"><div className="stat-label">Avg Resolution</div><div className="stat-value">{stats.avgResolutionHours}h</div></div></div>
        <div className="stat-card"><div className="stat-info"><div className="stat-label">Satisfaction</div><div className="stat-value" style={{ color: 'var(--warning-600)' }}>{stats.avgSatisfaction} ⭐</div></div></div>
        <div className="stat-card"><div className="stat-info"><div className="stat-label">SLA Compliance</div><div className="stat-value" style={{ color: stats.total - stats.slaBreached > stats.slaBreached ? 'var(--success-600)' : 'var(--error-600)' }}>{stats.total > 0 ? Math.round(((stats.total - stats.slaBreached) / stats.total) * 100) : 0}%</div></div></div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-card-title">Complaints Over Time (30 days)</div>
          <div style={{ height: 300 }}><Line data={lineData} options={chartOpts} /></div>
        </div>
        <div className="chart-card">
          <div className="chart-card-title">Complaints by Category</div>
          <div style={{ height: 300 }}><Doughnut data={doughnutData} options={pieOpts} /></div>
        </div>
        <div className="chart-card">
          <div className="chart-card-title">Complaints by Status</div>
          <div style={{ height: 300 }}><Bar data={barData} options={{ ...chartOpts, indexAxis: 'y' }} /></div>
        </div>
      </div>
    </div>
  );
}
