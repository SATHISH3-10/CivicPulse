// Client-side Mock Store for Netlify Standalone Demo Mode
// Provides fallback data when deployed statically without a live Express API server.

const DEMO_USERS = {
  'thiruvengadasuburamaninan@gmail.com': {
    _id: 'usr_thiru',
    name: 'Thiruvengadasuburamaninan',
    email: 'thiruvengadasuburamaninan@gmail.com',
    phone: '9876543219',
    role: 'admin',
    city: 'Chennai'
  },
  'thlruvengadasuburamaninan@gmail.com': {
    _id: 'usr_thiru',
    name: 'Thiruvengadasuburamaninan',
    email: 'thiruvengadasuburamaninan@gmail.com',
    phone: '9876543219',
    role: 'admin',
    city: 'Chennai'
  },
  'sathish.kurmbur2006@gmail.com': {
    _id: 'usr_sathish_officer',
    name: 'Sathish Officer',
    email: 'sathish.kurmbur2006@gmail.com',
    phone: '9876543218',
    role: 'officer',
    city: 'Chennai',
    department: 'Roads & Infrastructure',
    area: 'Anna Nagar',
    badgeNumber: 'FO-501'
  },
  'sathishm.ug.24.it@francisxavier.ac.in': {
    _id: 'usr_johan_citizen',
    name: 'Johan Citizen',
    email: 'sathishm.ug.24.it@francisxavier.ac.in',
    phone: '9876543210',
    role: 'citizen',
    city: 'Chennai'
  },
  'citizen@civicpulse.org': {
    _id: 'usr_citizen_default',
    name: 'Citizen User',
    email: 'citizen@civicpulse.org',
    phone: '9876543210',
    role: 'citizen',
    city: 'Chennai'
  },
  'officer1@civicpulse.org': {
    _id: 'usr_officer_suresh',
    name: 'Suresh Babu',
    email: 'officer1@civicpulse.org',
    phone: '9876543211',
    role: 'officer',
    city: 'Chennai',
    department: 'Roads & Infrastructure',
    area: 'Anna Nagar',
    badgeNumber: 'FO-402'
  },
  'admin@civicpulse.org': {
    _id: 'usr_admin_lakshmi',
    name: 'Dr. Lakshmi Narayan',
    email: 'admin@civicpulse.org',
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
    _id: 'cmp_101',
    complaintId: 'CP-2026-101',
    title: 'Severe Pothole on Anna Nagar 2nd Avenue Main Road',
    description: 'Deep hazardous pothole near the roundabout causing traffic slowdowns and vehicle damage.',
    category: 'Roads',
    subcategory: 'Potholes',
    severity: 'critical',
    priority: 'P1',
    status: 'assigned',
    latitude: 13.0850,
    longitude: 80.2101,
    address: 'Anna Nagar 2nd Avenue, Chennai',
    district: 'Chennai',
    area: 'Anna Nagar',
    citizenId: { _id: 'usr_thiru', name: 'Thiruvengadasuburamaninan', email: 'thiruvengadasuburamaninan@gmail.com' },
    departmentId: { _id: 'dept_1', name: 'Roads & Infrastructure' },
    officerId: { _id: 'usr_officer_suresh', name: 'Suresh Babu', email: 'officer1@civicpulse.org' },
    aiScore: 92,
    duplicateProbability: 0.1,
    slaDeadline: sla(12),
    supportCount: 14,
    createdAt: d(2),
    updatedAt: d(1)
  },
  {
    _id: 'cmp_102',
    complaintId: 'CP-2026-102',
    title: 'Water Main Pipe Leakage near Pondy Bazaar',
    description: 'Fresh water leaking continuously from underground pipeline joint onto the street.',
    category: 'Water',
    subcategory: 'Pipe Leak',
    severity: 'high',
    priority: 'P2',
    status: 'in_progress',
    latitude: 13.0418,
    longitude: 80.2341,
    address: 'Pondy Bazaar, T. Nagar, Chennai',
    district: 'Chennai',
    area: 'T. Nagar',
    citizenId: { _id: 'usr_citizen_default', name: 'Citizen User', email: 'citizen@civicpulse.org' },
    departmentId: { _id: 'dept_2', name: 'Water Supply Department' },
    officerId: { _id: 'usr_officer_suresh', name: 'Suresh Babu', email: 'officer1@civicpulse.org' },
    aiScore: 88,
    duplicateProbability: 0.05,
    slaDeadline: sla(8),
    supportCount: 9,
    createdAt: d(3),
    updatedAt: d(1)
  },
  {
    _id: 'cmp_103',
    complaintId: 'CP-2026-103',
    title: 'Broken Streetlight Row on LB Road Adyar',
    description: 'Five consecutive streetlights are out, creating dark unsafe conditions at night.',
    category: 'Streetlights',
    subcategory: 'Outage',
    severity: 'medium',
    priority: 'P3',
    status: 'submitted',
    latitude: 13.0012,
    longitude: 80.2565,
    address: 'Lattice Bridge Road, Adyar, Chennai',
    district: 'Chennai',
    area: 'Adyar',
    citizenId: { _id: 'usr_thiru', name: 'Thiruvengadasuburamaninan', email: 'thiruvengadasuburamaninan@gmail.com' },
    departmentId: { _id: 'dept_3', name: 'Electrical Department' },
    aiScore: 75,
    duplicateProbability: 0,
    slaDeadline: sla(36),
    supportCount: 5,
    createdAt: d(1),
    updatedAt: d(1)
  },
  {
    _id: 'cmp_104',
    complaintId: 'CP-2026-104',
    title: 'Garbage Dump Overflow at Velachery Main Bus Stop',
    description: 'Municipal trash bin overflowing with domestic waste for over 3 days.',
    category: 'Garbage',
    subcategory: 'Overflowing Bin',
    severity: 'high',
    priority: 'P2',
    status: 'resolved',
    latitude: 12.9815,
    longitude: 80.2180,
    address: 'Velachery Bus Terminus Road, Chennai',
    district: 'Chennai',
    area: 'Velachery',
    citizenId: { _id: 'usr_citizen_default', name: 'Citizen User', email: 'citizen@civicpulse.org' },
    departmentId: { _id: 'dept_4', name: 'Sanitation Department' },
    officerId: { _id: 'usr_officer_suresh', name: 'Suresh Babu', email: 'officer1@civicpulse.org' },
    aiScore: 85,
    duplicateProbability: 0,
    slaDeadline: sla(-10),
    supportCount: 22,
    createdAt: d(5),
    updatedAt: d(1)
  },
  {
    _id: 'cmp_105',
    complaintId: 'CP-2026-105',
    title: 'Clogged Stormwater Drain Overflow in Mylapore',
    description: 'Blocked drain causing stagnant sewage water accumulation on Luz Church Road.',
    category: 'Drainage',
    subcategory: 'Clogged Drain',
    severity: 'critical',
    priority: 'P1',
    status: 'escalated',
    latitude: 13.0339,
    longitude: 80.2676,
    address: 'Luz Church Road, Mylapore, Chennai',
    district: 'Chennai',
    area: 'Mylapore',
    citizenId: { _id: 'usr_thiru', name: 'Thiruvengadasuburamaninan', email: 'thiruvengadasuburamaninan@gmail.com' },
    departmentId: { _id: 'dept_5', name: 'Drainage & Sewage Department' },
    aiScore: 95,
    duplicateProbability: 0.15,
    slaDeadline: sla(-2),
    supportCount: 31,
    createdAt: d(4),
    updatedAt: d(1)
  }
];

function getStoredComplaints() {
  try {
    const data = localStorage.getItem('civicpulse_mock_complaints');
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  localStorage.setItem('civicpulse_mock_complaints', JSON.stringify(INITIAL_COMPLAINTS));
  return INITIAL_COMPLAINTS;
}

function saveComplaints(complaints) {
  localStorage.setItem('civicpulse_mock_complaints', JSON.stringify(complaints));
}

function getStoredUsers() {
  let list = [];
  try {
    const data = localStorage.getItem('civicpulse_mock_users');
    if (data) list = JSON.parse(data);
  } catch {}

  // Filter out legacy demo accounts
  list = list.filter(u => !u.email?.includes('civicpulse.demo'));

  // Ensure default demo users are always present in the stored directory with their correct roles
  Object.values(DEMO_USERS).forEach(demoUser => {
    const idx = list.findIndex(u => u.email?.toLowerCase() === demoUser.email.toLowerCase());
    if (idx !== -1) {
      list[idx] = { ...demoUser, ...list[idx], role: demoUser.role };
    } else {
      list.push(demoUser);
    }
  });

  localStorage.setItem('civicpulse_mock_users', JSON.stringify(list));
  return list;
}

function saveStoredUsers(users) {
  localStorage.setItem('civicpulse_mock_users', JSON.stringify(users));
}

export function handleMockRequest(url, method = 'GET', body = null) {
  const cleanUrl = url.replace(/^\/api/, '');

  // Auth me
  if (cleanUrl.startsWith('/auth/me')) {
    const savedUserStr = localStorage.getItem('civicpulse_user');
    const user = savedUserStr ? JSON.parse(savedUserStr) : null;
    if (!user) {
      return { status: 401, data: { error: 'Authentication required' } };
    }
    return { status: 200, data: { user } };
  }

  // Auth Login
  if (cleanUrl.startsWith('/auth/login')) {
    const email = body?.email?.toLowerCase()?.trim();
    let matchedUser = DEMO_USERS[email];
    if (!matchedUser) {
      const users = getStoredUsers();
      matchedUser = users.find(u => u.email?.toLowerCase() === email);
    }

    if (!matchedUser) {
      matchedUser = {
        _id: 'usr_' + Date.now(),
        name: email ? email.split('@')[0] : 'User',
        email: email || 'user@civicpulse.org',
        role: 'citizen', // New custom accounts default strictly to citizen
        city: 'Chennai'
      };
      const users = getStoredUsers();
      users.unshift(matchedUser);
      saveStoredUsers(users);
    }

    // Save as active logged in user in localStorage session
    localStorage.setItem('civicpulse_token', 'jwt-token-' + matchedUser._id);
    localStorage.setItem('civicpulse_user', JSON.stringify(matchedUser));

    return {
      status: 200,
      data: {
        token: 'jwt-token-' + matchedUser._id,
        user: matchedUser
      }
    };
  }

  // Auth Google OAuth Callback
  if (cleanUrl.startsWith('/auth/google')) {
    const email = (body?.email || 'user@google.com').toLowerCase().trim();
    const users = getStoredUsers();
    let matchedUser = DEMO_USERS[email] || users.find(u => u.email?.toLowerCase() === email);

    // Retain existing role if user exists, otherwise default to citizen
    let role = matchedUser?.role || 'citizen';

    const googleUser = {
      _id: matchedUser?._id || 'usr_google_' + Date.now(),
      name: body?.name || matchedUser?.name || email.split('@')[0],
      email: email,
      role: role,
      city: matchedUser?.city || 'Chennai',
      avatar: body?.avatar || matchedUser?.avatar || ''
    };

    const existingIdx = users.findIndex(u => u.email?.toLowerCase() === email);
    if (existingIdx !== -1) {
      users[existingIdx] = { ...users[existingIdx], ...googleUser, role };
    } else {
      users.unshift(googleUser);
    }
    saveStoredUsers(users);

    localStorage.setItem('civicpulse_token', 'jwt-google-' + googleUser._id);
    localStorage.setItem('civicpulse_user', JSON.stringify(googleUser));

    return {
      status: 200,
      data: {
        token: 'jwt-google-' + googleUser._id,
        user: googleUser
      }
    };
  }

  // Update Profile
  if (cleanUrl.startsWith('/auth/profile') && method === 'PUT') {
    const savedUserStr = localStorage.getItem('civicpulse_user');
    let currentUser = savedUserStr ? JSON.parse(savedUserStr) : DEMO_USERS['citi@123'];
    const updatedUser = {
      ...currentUser,
      ...(body || {})
    };
    localStorage.setItem('civicpulse_user', JSON.stringify(updatedUser));
    return {
      status: 200,
      data: {
        message: 'Profile updated successfully',
        user: updatedUser
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
      citizenId: DEMO_USERS['citi@123'],
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
        officerInfo: DEMO_USERS['off@123']
      }
    };
  }

  // Admin users list
  if (cleanUrl === '/admin/users' || cleanUrl.startsWith('/admin/users?')) {
    const users = getStoredUsers();
    return { status: 200, data: { users, total: users.length } };
  }

  // Admin permit promotion / role update
  if (cleanUrl.match(/\/admin\/users\/[^/]+\/permit/) && method === 'PUT') {
    const userId = cleanUrl.split('/')[3];
    const users = getStoredUsers();
    const idx = users.findIndex(u => u._id === userId || u.id === userId);
    if (idx !== -1) {
      users[idx] = {
        ...users[idx],
        role: body?.role || users[idx].role,
        department: body?.departmentName || body?.department || users[idx].department,
        badgeNumber: body?.badgeNumber || users[idx].badgeNumber || `FO-${Math.floor(100 + Math.random() * 900)}`,
        area: body?.area || users[idx].area || 'Anna Nagar'
      };
      saveStoredUsers(users);

      // If current logged-in user was updated, update active session too
      const currentSavedStr = localStorage.getItem('civicpulse_user');
      if (currentSavedStr) {
        try {
          const currentSaved = JSON.parse(currentSavedStr);
          if (currentSaved._id === userId || currentSaved.id === userId || currentSaved.email === users[idx].email) {
            localStorage.setItem('civicpulse_user', JSON.stringify({ ...currentSaved, ...users[idx] }));
          }
        } catch {}
      }

      return { status: 200, data: { message: `User permit updated to ${users[idx].role}`, user: users[idx] } };
    }
    return { status: 404, data: { error: 'User not found' } };
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
      user: DEMO_USERS['citi@123']
    }
  };
}
