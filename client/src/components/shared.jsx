import { useState } from 'react';

export const STATUS_CONFIG = {
  submitted: { label: 'Submitted', color: '#6B7280', bg: '#F3F4F6', icon: '📝' },
  ai_analyzed: { label: 'AI Analyzed', color: '#8B5CF6', bg: '#EDE9FE', icon: '🤖' },
  assigned: { label: 'Assigned', color: '#3B82F6', bg: '#DBEAFE', icon: '👤' },
  officer_accepted: { label: 'Officer Accepted', color: '#0EA5E9', bg: '#E0F2FE', icon: '🔧' },
  in_progress: { label: 'In Progress', color: '#F59E0B', bg: '#FEF3C7', icon: '⚡' },
  resolution_submitted: { label: 'Resolution Submitted', color: '#10B981', bg: '#D1FAE5', icon: '📸' },
  awaiting_verification: { label: 'Awaiting Verification', color: '#06B6D4', bg: '#CFFAFE', icon: '🔍' },
  resolved: { label: 'Resolved', color: '#059669', bg: '#ECFDF5', icon: '✅' },
  reopened: { label: 'Reopened', color: '#EF4444', bg: '#FEE2E2', icon: '🔄' },
  escalated: { label: 'Escalated', color: '#DC2626', bg: '#FEE2E2', icon: '⚠️' }
};

export const PRIORITY_CONFIG = {
  P1: { label: 'P1 — Critical', color: '#DC2626', bg: '#FEE2E2', sla: '24h' },
  P2: { label: 'P2 — High', color: '#EA580C', bg: '#FFEDD5', sla: '48h' },
  P3: { label: 'P3 — Medium', color: '#D97706', bg: '#FEF3C7', sla: '72h' },
  P4: { label: 'P4 — Low', color: '#059669', bg: '#ECFDF5', sla: '120h' }
};

export const CATEGORIES = [
  { value: 'Roads', label: 'Roads & Footpaths', icon: '🛣️' },
  { value: 'Streetlights', label: 'Streetlights & Electrical', icon: '💡' },
  { value: 'Garbage', label: 'Garbage & Sanitation', icon: '🗑️' },
  { value: 'Water', label: 'Water Supply', icon: '💧' },
  { value: 'Drainage', label: 'Drainage & Sewage', icon: '🚰' },
  { value: 'Traffic', label: 'Traffic & Signage', icon: '🚦' },
  { value: 'Public Safety', label: 'Public Safety Hazards', icon: '⚠️' },
  { value: 'Parks', label: 'Parks & Greenery', icon: '🌳' },
  { value: 'Public Buildings', label: 'Public Buildings', icon: '🏛️' },
  { value: 'Other', label: 'Other Civic Issues', icon: '📌' }
];

export function getComplaintProofImage(complaint, evidenceList) {
  // 1. If explicit valid evidence url is provided and not a broken link
  if (evidenceList && evidenceList.length > 0) {
    const reportEvidence = evidenceList.find(e => e.stage === 'report' || e.stage === 'before');
    if (reportEvidence?.url && !reportEvidence.url.endsWith('.jpg') && !reportEvidence.url.includes('before-pothole')) {
      return reportEvidence.url;
    }
  }

  // 2. Check title / category keyword mapping
  const title = (complaint?.title || '').toLowerCase();
  const category = (complaint?.category || '').toLowerCase();
  const desc = (complaint?.description || '').toLowerCase();

  if (title.includes('light') || title.includes('lamp') || category.includes('street') || category.includes('elect') || desc.includes('street light') || desc.includes('lamp')) {
    return '/demo/streetlight-reported.svg';
  }
  if (title.includes('water') || category.includes('water') || desc.includes('water')) {
    return '/demo/water-leak.svg';
  }
  if (title.includes('garbage') || category.includes('garbage') || category.includes('sanitation') || desc.includes('garbage')) {
    return '/demo/garbage-overflow.svg';
  }
  return '/demo/before-pothole.svg';
}

export function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, color: '#6B7280', bg: '#F3F4F6' };
  return (
    <span
      className="badge"
      style={{ background: config.bg, color: config.color, border: `1px solid ${config.color}30` }}
    >
      {config.icon} {config.label}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const config = PRIORITY_CONFIG[priority] || { label: priority, color: '#6B7280', bg: '#F3F4F6' };
  return (
    <span
      className="badge"
      style={{ background: config.bg, color: config.color, border: `1px solid ${config.color}30` }}
    >
      {config.label}
    </span>
  );
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const past = new Date(dateStr);
  const diffMs = now - past;
  const mins = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'yesterday';
  return `${days}d ago`;
}

export function timeAgoSimple(dateStr) {
  return timeAgo(dateStr);
}
