// Client-side Mock Store for Netlify Standalone Demo Mode
// Provides fallback data when deployed statically without a live Express API server.

const DEMO_USERS = {
  'citizen@civicpulse.demo': {
    _id: 'usr_citizen_demo',
    name: 'Citizen User',
    email: 'citizen@civicpulse.demo',
    phone: '9876543210',
    role: 'citizen',
    city: 'Chennai'
  },
  'officer@civicpulse.demo': {
    _id: 'usr_officer_demo',
    name: 'Suresh Babu',
    email: 'officer@civicpulse.demo',
    phone: '9876543211',
    role: 'officer',
    city: 'Chennai',
    department: 'Roads & Infrastructure',
    area: 'Anna Nagar'
  },
  'admin@civicpulse.demo': {
    _id: 'usr_admin_demo',
    name: 'Dr. Lakshmi Narayan',
    email: 'admin@civicpulse.demo',
    phone: '9876543216',
    role: 'admin',
    city: 'Chennai'
  }
};

const DEMO_DEPARTMENTS = [
  { _id: 'dept_1', name: 'Roads & Infrastructure', category: 'Roads', head: 'Mr. Venkatesh', icon: '🛣️', description: 'Road maintenance, potholes, and infrastructure' },
  { _id: 'dept_2', name: 'Water Supply Department', category: 'Water', head: 'Mrs. Padmini', icon: '💧', description: 'Water supply, pipelines, and water quality' },
  { _id: 'dept_3', name: 'Electrical Department', category: 'Streetlights', head: 'Mr. Rajesh', icon: '💡', description: 'Streetlights, electrical infrastructure' },
  { _id: 'dept_4', name: 'Sanitation Department', category: 'Garbage', head: 'Mr. Ganesh', icon: '🗑️', description: 'Waste collection, cleanliness, and sanitation' },
  { _id: 'dept_5', name: 'Drainage & Sewage Department', category: 'Drainage', head: 'Mrs. Kavitha', icon: '🚰', description: 'Drainage systems, sewage, and flood prevention' }
];

const now = new Date();
const d = days => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
const sla = hours => new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString();

const INITIAL_COMPLAINTS = [
  {
    _id: 'cmp_1',
    complaintId: 'CP-2026-00101',
    title: 'Large pothole near Anna Nagar junction',
    description: 'Dangerous pothole on the main road near Anna Nagar signal junction. Multiple vehicles have been damaged. Urgent repair needed.',
    category: 'Roads',
    severity: 'critical',
    priority: 'P1',
    status: 'in_progress',
    latitude: 13.0850,
    longitude: 80.2101,
    address: 'Anna Nagar Main Road, Chennai',
    area: 'Anna Nagar',
    citizenId: { _id: 'usr_citizen_demo', name: 'Citizen User', email: 'citizen@civicpulse.demo' },
    departmentId: DEMO_DEPARTMENTS[0],
    officerId: { _id: 'usr_officer_demo', name: 'Suresh Babu', email: 'officer@civicpulse.demo' },
    aiScore: 82,
    duplicateProbability: 15,
    slaDeadline: sla(-6),
    supportCount: 14,
    createdAt: d(3),
    updatedAt: d(1),
    evidence: [{ _id: 'ev_1', url: '/demo/before-pothole.svg', stage: 'report', uploadedAt: d(3) }]
  },
  {
    _id: 'cmp_2',
    complaintId: 'CP-2026-00102',
    title: 'Road surface damaged after rain',
    description: 'Road surface has been badly damaged after recent heavy rain. Asphalt breaking apart on 2nd Avenue.',
    category: 'Roads',
    severity: 'high',
    priority: 'P2',
    status: 'assigned',
    latitude: 13.0862,
    longitude: 80.2115,
    address: '2nd Avenue, Anna Nagar, Chennai',
    area: 'Anna Nagar',
    citizenId: { _id: 'usr_citizen_demo', name: 'Citizen User', email: 'citizen@civicpulse.demo' },
    departmentId: DEMO_DEPARTMENTS[0],
    officerId: { _id: 'usr_officer_demo', name: 'Suresh Babu', email: 'officer@civicpulse.demo' },
    aiScore: 65,
    duplicateProbability: 45,
    slaDeadline: sla(18),
    supportCount: 8,
    createdAt: d(2),
    updatedAt: d(1),
    evidence: [{ _id: 'ev_2', url: '/demo/before-pothole.svg', stage: 'report', uploadedAt: d(2) }]
  },
  {
    _id: 'cmp_3',
    complaintId: 'CP-2026-00105',
    title: 'Water pipeline burst on Pondy Bazaar',
    description: 'Major water pipeline burst causing flooding on Pondy Bazaar main road. Water wasting continuously.',
    category: 'Water',
    severity: 'critical',
    priority: 'P1',
    status: 'in_progress',
    latitude: 13.0418,
    longitude: 80.2341,
    address: 'Pondy Bazaar, T. Nagar, Chennai',
    area: 'T. Nagar',
    citizenId: { _id: 'usr_citizen_demo', name: 'Citizen User', email: 'citizen@civicpulse.demo' },
    departmentId: DEMO_DEPARTMENTS[1],
    officerId: null,
    aiScore: 88,
    duplicateProbability: 8,
    slaDeadline: sla(-2),
    supportCount: 12,
    createdAt: d(2),
    updatedAt: d(1),
    evidence: [{ _id: 'ev_3', url: '/demo/after-fixed.svg', stage: 'report', uploadedAt: d(2) }]
  },
  {
    _id: 'cmp_4',
    complaintId: 'CP-2026-00108',
    title: 'Multiple streetlights not working',
    description: 'Entire stretch of streetlights on Adyar 1st Main Road are not working for the past week. Very unsafe at night.',
    category: 'Streetlights',
    severity: 'high',
    priority: 'P2',
    status: 'assigned',
    latitude: 13.0012,
    longitude: 80.2565,
    address: '1st Main Road, Adyar, Chennai',
    area: 'Adyar',
    citizenId: { _id: 'usr_citizen_demo', name: 'Citizen User', email: 'citizen@civicpulse.demo' },
    departmentId: DEMO_DEPARTMENTS[2],
    officerId: null,
    aiScore: 68,
    duplicateProbability: 5,
    slaDeadline: sla(24),
    supportCount: 5,
    createdAt: d(4),
    updatedAt: d(2)
  },
  {
    _id: 'cmp_5',
    complaintId: 'CP-2026-00111',
    title: 'Broken streetlight at Mylapore',
    description: 'Single streetlight pole broken and fallen near temple entrance. Electrical hazard.',
    category: 'Streetlights',
    severity: 'critical',
    priority: 'P1',
    status: 'resolved',
    latitude: 13.0339,
    longitude: 80.2676,
    address: 'Near Kapaleeshwarar Temple, Mylapore',
    area: 'Mylapore',
    citizenId: { _id: 'usr_citizen_demo', name: 'Citizen User', email: 'citizen@civicpulse.demo' },
    departmentId: DEMO_DEPARTMENTS[2],
    officerId: { _id: 'usr_officer_demo', name: 'Suresh Babu', email: 'officer@civicpulse.demo' },
    aiScore: 85,
    duplicateProbability: 3,
    slaDeadline: sla(-48),
    supportCount: 19,
    createdAt: d(7),
    updatedAt: d(5),
    evidence: [
      { _id: 'ev_5a', url: '/demo/before-pothole.svg', stage: 'report', uploadedAt: d(7) },
      { _id: 'ev_5b', url: '/demo/after-fixed.svg', stage: 'after', uploadedAt: d(5) }
    ]
  }
];

function getStoredComplaints() {
  try {
    const data = localStorage.getItem('civicpulse_mock_complaints');
    if (data) return JSON.parse(data);
  } catch {}
  localStorage.setItem('civicpulse_mock_complaints', JSON.stringify(INITIAL_COMPLAINTS));
  return INITIAL_COMPLAINTS;
}

function saveComplaints(complaints) {
  localStorage.setItem('civicpulse_mock_complaints', JSON.stringify(complaints));
}

export function handleMockRequest(url, method = 'GET', body = null) {
  const cleanUrl = url.replace(/^\/api/, '');

  // Auth me
  if (cleanUrl.startsWith('/auth/me')) {
    const savedUser = localStorage.getItem('civicpulse_user');
    const user = savedUser ? JSON.parse(savedUser) : DEMO_USERS['citizen@civicpulse.demo'];
    return { status: 200, data: { user } };
  }

  // Auth Login
  if (cleanUrl.startsWith('/auth/login')) {
    const email = body?.email;
    const matchedUser = DEMO_USERS[email] || {
      _id: 'usr_custom_demo',
      name: email?.split('@')[0] || 'Demo User',
      email: email || 'user@civicpulse.demo',
      role: 'citizen',
      city: 'Chennai'
    };
    return {
      status: 200,
      data: {
        token: 'demo-jwt-token-' + matchedUser.role,
        user: matchedUser
      }
    };
  }

  // Auth Google OAuth Callback
  if (cleanUrl.startsWith('/auth/google')) {
    const role = body?.role || localStorage.getItem('pending_login_role') || 'citizen';
    const googleUser = {
      _id: 'usr_google_demo_' + Date.now(),
      name: 'Google User',
      email: 'user@google.com',
      role: role,
      city: 'Chennai'
    };
    return {
      status: 200,
      data: {
        token: 'demo-jwt-google-' + role,
        user: googleUser
      }
    };
  }

  // Complaints
  if (cleanUrl === '/complaints' || cleanUrl.startsWith('/complaints?')) {
    const complaints = getStoredComplaints();
    return { status: 200, data: { complaints, total: complaints.length } };
  }

  // Complaint Detail
  if (cleanUrl.match(/\/complaints\/CP-\d+-\d+/) || cleanUrl.match(/\/complaints\/cmp_\d+/)) {
    const id = cleanUrl.split('/')[2];
    const complaints = getStoredComplaints();
    const complaint = complaints.find(c => c._id === id || c.complaintId === id) || complaints[0];
    return {
      status: 200,
      data: {
        complaint,
        timeline: [
          { status: 'submitted', message: 'Complaint submitted by citizen', createdByName: 'Citizen', timestamp: complaint.createdAt },
          { status: 'ai_analyzed', message: `AI Analysis: ${complaint.priority} priority — ${complaint.category}`, createdByName: 'CivicPulse AI', timestamp: complaint.createdAt },
          { status: complaint.status, message: `Status updated to ${complaint.status}`, createdByName: 'System', timestamp: complaint.updatedAt }
        ],
        evidence: complaint.evidence || [],
        feedback: null
      }
    };
  }

  // Submit Complaint
  if (cleanUrl === '/complaints' && method === 'POST') {
    const complaints = getStoredComplaints();
    const newComplaint = {
      _id: 'cmp_' + Date.now(),
      complaintId: 'CP-2026-' + Math.floor(10000 + Math.random() * 90000),
      title: body?.title || 'Reported Issue',
      description: body?.description || '',
      category: body?.category || 'Roads',
      severity: body?.severity || 'medium',
      priority: body?.priority || 'P2',
      status: 'submitted',
      latitude: body?.latitude || 13.0827,
      longitude: body?.longitude || 80.2707,
      address: body?.address || 'Chennai',
      area: 'Anna Nagar',
      citizenId: DEMO_USERS['citizen@civicpulse.demo'],
      departmentId: DEMO_DEPARTMENTS[0],
      officerId: null,
      aiScore: 75,
      duplicateProbability: 10,
      slaDeadline: sla(48),
      supportCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      evidence: []
    };
    complaints.unshift(newComplaint);
    saveComplaints(complaints);
    return { status: 201, data: { complaint: newComplaint } };
  }

  // Officer stats
  if (cleanUrl.startsWith('/officer/stats')) {
    const complaints = getStoredComplaints();
    return {
      status: 200,
      data: {
        stats: {
          assigned: complaints.length,
          inProgress: complaints.filter(c => c.status === 'in_progress').length,
          resolved: complaints.filter(c => c.status === 'resolved').length,
          slaBreached: complaints.filter(c => new Date(c.slaDeadline) < now && c.status !== 'resolved').length
        }
      }
    };
  }

  // Officer complaints
  if (cleanUrl.startsWith('/officer/complaints')) {
    const complaints = getStoredComplaints();
    return {
      status: 200,
      data: {
        complaints: complaints,
        borderComplaints: complaints.filter(c => !c.officerId),
        officerInfo: DEMO_USERS['officer@civicpulse.demo']
      }
    };
  }

  // Admin stats / analytics
  if (cleanUrl.startsWith('/admin/analytics') || cleanUrl.startsWith('/admin/stats')) {
    const complaints = getStoredComplaints();
    return {
      status: 200,
      data: {
        stats: {
          total: complaints.length,
          active: complaints.filter(c => c.status !== 'resolved').length,
          resolved: complaints.filter(c => c.status === 'resolved').length,
          slaBreached: 1,
          critical: 2,
          avgResolutionHours: 18,
          resolutionRate: 78,
          avgSatisfaction: 4.8,
          resolvedToday: 3
        },
        byCategory: { Roads: 2, Water: 1, Streetlights: 2 },
        escalated: complaints.filter(c => c.severity === 'critical')
      }
    };
  }

  // Departments
  if (cleanUrl.startsWith('/departments')) {
    return { status: 200, data: { departments: DEMO_DEPARTMENTS } };
  }

  // Notifications
  if (cleanUrl.startsWith('/notifications')) {
    return {
      status: 200,
      data: {
        notifications: [
          { _id: 'n1', title: 'Welcome to CivicPulse Demo Mode', message: 'You are using netlify interactive demo mode.', isRead: false, createdAt: d(1) }
        ]
      }
    };
  }

  // AI Analyze
  if (cleanUrl.startsWith('/ai/analyze')) {
    return {
      status: 200,
      data: {
        analysis: {
          category: body?.category || 'Roads',
          severity: 'high',
          priority: 'P1',
          suggestedDepartment: 'Roads & Infrastructure',
          summary: 'Civic issue automatically classified with AI computer vision & spatial NLP.'
        }
      }
    };
  }

  // Generic fallback
  return {
    status: 200,
    data: {
      message: 'Demo mode request processed successfully',
      complaints: getStoredComplaints(),
      user: DEMO_USERS['citizen@civicpulse.demo']
    }
  };
}
