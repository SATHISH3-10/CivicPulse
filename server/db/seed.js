import bcrypt from 'bcryptjs';
import connectDB from './connection.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Officer from '../models/Officer.js';
import Complaint from '../models/Complaint.js';
import Evidence from '../models/Evidence.js';
import TimelineEvent from '../models/TimelineEvent.js';
import Feedback from '../models/Feedback.js';
import Notification from '../models/Notification.js';
import ComplaintSupport from '../models/ComplaintSupport.js';

async function seed() {
  await connectDB();
  console.log('Seeding database...');

  // Keep the seed safe to run repeatedly and preserve existing application data.
  const existingDemoUser = await User.findOne({ email: 'citizen@civicpulse.demo' });
  if (existingDemoUser) {
    console.log('Demo data already exists; skipping seed.');
    return;
  }

  const passwordHash = await bcrypt.hash('password123', 10);

  // ─── USERS ───
  const [citizen, officer1, officer2, officer3, officer4, officer5, admin, citizen2, citizen3] = await User.create([
    { name: 'Citizen User', email: 'citizen@civicpulse.demo', phone: '9876543210', passwordHash, role: 'citizen', city: 'Chennai' },
    { name: 'Suresh Babu', email: 'officer@civicpulse.demo', phone: '9876543211', passwordHash, role: 'officer', city: 'Chennai' },
    { name: 'Priya Rajan', email: 'officer2@civicpulse.demo', phone: '9876543212', passwordHash, role: 'officer', city: 'Chennai' },
    { name: 'Karthik Nair', email: 'officer3@civicpulse.demo', phone: '9876543213', passwordHash, role: 'officer', city: 'Chennai' },
    { name: 'Meena Devi', email: 'officer4@civicpulse.demo', phone: '9876543214', passwordHash, role: 'officer', city: 'Chennai' },
    { name: 'Arun Prakash', email: 'officer5@civicpulse.demo', phone: '9876543215', passwordHash, role: 'officer', city: 'Chennai' },
    { name: 'Dr. Lakshmi Narayan', email: 'admin@civicpulse.demo', phone: '9876543216', passwordHash, role: 'admin', city: 'Chennai' },
    { name: 'Anitha Selvam', email: 'anitha@civicpulse.demo', phone: '9876543217', passwordHash, role: 'citizen', city: 'Chennai' },
    { name: 'Mohan Raj', email: 'mohan@civicpulse.demo', phone: '9876543218', passwordHash, role: 'citizen', city: 'Chennai' }
  ]);

  // ─── DEPARTMENTS ───
  const [roadsD, waterD, electricalD, sanitationD, drainageD] = await Department.create([
    { name: 'Roads & Infrastructure', category: 'Roads', head: 'Mr. Venkatesh', icon: '🛣️', description: 'Road maintenance, potholes, and infrastructure' },
    { name: 'Water Supply Department', category: 'Water', head: 'Mrs. Padmini', icon: '💧', description: 'Water supply, pipelines, and water quality' },
    { name: 'Electrical Department', category: 'Streetlights', head: 'Mr. Rajesh', icon: '💡', description: 'Streetlights, electrical infrastructure' },
    { name: 'Sanitation Department', category: 'Garbage', head: 'Mr. Ganesh', icon: '🗑️', description: 'Waste collection, cleanliness, and sanitation' },
    { name: 'Drainage & Sewage Department', category: 'Drainage', head: 'Mrs. Kavitha', icon: '🚰', description: 'Drainage systems, sewage, and flood prevention' }
  ]);

  // ─── OFFICERS ───
  await Officer.create([
    { userId: officer1._id, departmentId: roadsD._id, availability: 'available', latitude: 13.0604, longitude: 80.2496 },
    { userId: officer2._id, departmentId: waterD._id, availability: 'available', latitude: 13.0878, longitude: 80.2785 },
    { userId: officer3._id, departmentId: electricalD._id, availability: 'available', latitude: 13.0500, longitude: 80.2121 },
    { userId: officer4._id, departmentId: sanitationD._id, availability: 'busy', latitude: 13.0674, longitude: 80.2376 },
    { userId: officer5._id, departmentId: drainageD._id, availability: 'available', latitude: 13.0418, longitude: 80.2341 }
  ]);

  // ─── COMPLAINTS ───
  const now = new Date();
  const h = (hours) => new Date(now - hours * 60 * 60 * 1000);
  const d = (days) => new Date(now - days * 24 * 60 * 60 * 1000);
  const sla = (hours) => new Date(now.getTime() + hours * 60 * 60 * 1000);

  const complaintsData = [
    // ── Anna Nagar hotspot cluster (Roads) ──
    { complaintId: 'CP-2026-00101', title: 'Large pothole near Anna Nagar junction', description: 'Dangerous pothole on the main road near Anna Nagar signal junction. Multiple vehicles have been damaged. Urgent repair needed.', category: 'Roads', severity: 'critical', priority: 'P1', status: 'in_progress', lat: 13.0850, lng: 80.2101, address: 'Anna Nagar Main Road, Chennai', citizenId: citizen._id, departmentId: roadsD._id, officerId: officer1._id, aiScore: 82, dupProb: 15, sla: sla(-6), created: d(3) },
    { complaintId: 'CP-2026-00102', title: 'Road surface damaged after rain', description: 'Road surface has been badly damaged after recent heavy rain. Asphalt breaking apart on 2nd Avenue.', category: 'Roads', severity: 'high', priority: 'P2', status: 'assigned', lat: 13.0862, lng: 80.2115, address: '2nd Avenue, Anna Nagar, Chennai', citizenId: citizen2._id, departmentId: roadsD._id, officerId: officer1._id, aiScore: 65, dupProb: 45, sla: sla(18), created: d(2) },
    { complaintId: 'CP-2026-00103', title: 'Cracked pavement on Anna Nagar 3rd Street', description: 'Pavement is cracked and uneven. Pedestrians and elderly residents are at risk of tripping.', category: 'Roads', severity: 'medium', priority: 'P2', status: 'submitted', lat: 13.0845, lng: 80.2090, address: '3rd Street, Anna Nagar, Chennai', citizenId: citizen3._id, departmentId: roadsD._id, aiScore: 55, dupProb: 38, sla: sla(42), created: d(1) },
    { complaintId: 'CP-2026-00104', title: 'Speed breaker damaged on Anna Nagar Road', description: 'Speed breaker near school zone is damaged and creating a hazard for school buses and children.', category: 'Roads', severity: 'high', priority: 'P1', status: 'assigned', lat: 13.0855, lng: 80.2108, address: 'Near DAV School, Anna Nagar, Chennai', citizenId: citizen._id, departmentId: roadsD._id, officerId: officer1._id, aiScore: 78, dupProb: 22, sla: sla(10), created: d(1) },

    // ── T. Nagar area (Water/Drainage) ──
    { complaintId: 'CP-2026-00105', title: 'Water pipeline burst on Pondy Bazaar', description: 'Major water pipeline burst causing flooding on Pondy Bazaar main road. Water wasting continuously.', category: 'Water', severity: 'critical', priority: 'P1', status: 'in_progress', lat: 13.0418, lng: 80.2341, address: 'Pondy Bazaar, T. Nagar, Chennai', citizenId: citizen2._id, departmentId: waterD._id, officerId: officer2._id, aiScore: 88, dupProb: 8, sla: sla(-2), created: d(2) },
    { complaintId: 'CP-2026-00106', title: 'No water supply for 3 days', description: 'Our area has not received water supply for the past 3 days. Multiple households affected. Urgent attention needed.', category: 'Water', severity: 'high', priority: 'P1', status: 'officer_accepted', lat: 13.0430, lng: 80.2355, address: 'Thyagaraya Nagar 4th Cross, Chennai', citizenId: citizen3._id, departmentId: waterD._id, officerId: officer2._id, aiScore: 75, dupProb: 12, sla: sla(6), created: d(1) },
    { complaintId: 'CP-2026-00107', title: 'Drainage overflow in T. Nagar', description: 'Drainage overflowing near bus stop causing foul smell and health hazard. Sewage water on the road.', category: 'Drainage', severity: 'high', priority: 'P1', status: 'assigned', lat: 13.0425, lng: 80.2348, address: 'Near T. Nagar Bus Depot, Chennai', citizenId: citizen._id, departmentId: drainageD._id, officerId: officer5._id, aiScore: 80, dupProb: 10, sla: sla(14), created: d(1) },

    // ── Adyar (Streetlights/Garbage) ──
    { complaintId: 'CP-2026-00108', title: 'Multiple streetlights not working', description: 'Entire stretch of streetlights on Adyar 1st Main Road are not working for the past week. Very unsafe at night.', category: 'Streetlights', severity: 'high', priority: 'P2', status: 'in_progress', lat: 13.0012, lng: 80.2565, address: '1st Main Road, Adyar, Chennai', citizenId: citizen._id, departmentId: electricalD._id, officerId: officer3._id, aiScore: 68, dupProb: 5, sla: sla(24), created: d(4) },
    { complaintId: 'CP-2026-00109', title: 'Garbage not collected for 5 days', description: 'Garbage has not been collected from our street for 5 days. Piling up and attracting stray animals. Health concern.', category: 'Garbage', severity: 'high', priority: 'P2', status: 'assigned', lat: 13.0025, lng: 80.2578, address: '2nd Cross Street, Adyar, Chennai', citizenId: citizen2._id, departmentId: sanitationD._id, officerId: officer4._id, aiScore: 62, dupProb: 8, sla: sla(30), created: d(3) },
    { complaintId: 'CP-2026-00110', title: 'Overflowing public dustbin at Adyar', description: 'Public dustbin near Adyar bus stand is overflowing. Garbage spread all over sidewalk. Terrible smell.', category: 'Garbage', severity: 'medium', priority: 'P3', status: 'submitted', lat: 13.0030, lng: 80.2570, address: 'Near Adyar Bus Stand, Chennai', citizenId: citizen3._id, departmentId: sanitationD._id, aiScore: 48, dupProb: 18, sla: sla(52), created: d(2) },

    // ── Resolved complaints ──
    { complaintId: 'CP-2026-00111', title: 'Broken streetlight at Mylapore', description: 'Single streetlight pole broken and fallen near temple entrance. Electrical hazard.', category: 'Streetlights', severity: 'critical', priority: 'P1', status: 'resolved', lat: 13.0339, lng: 80.2676, address: 'Near Kapaleeshwarar Temple, Mylapore', citizenId: citizen._id, departmentId: electricalD._id, officerId: officer3._id, aiScore: 85, dupProb: 3, sla: sla(-48), created: d(7) },
    { complaintId: 'CP-2026-00112', title: 'Water leak on ECR Road', description: 'Continuous water leak from underground pipe on ECR service road. Wasting water for weeks.', category: 'Water', severity: 'medium', priority: 'P3', status: 'resolved', lat: 12.9855, lng: 80.2505, address: 'ECR Service Road, Chennai', citizenId: citizen2._id, departmentId: waterD._id, officerId: officer2._id, aiScore: 45, dupProb: 5, sla: sla(-72), created: d(10) },
    { complaintId: 'CP-2026-00113', title: 'Pothole fixed - Velachery Main Road', description: 'Large pothole on Velachery main road near railway station causing traffic jams.', category: 'Roads', severity: 'high', priority: 'P2', status: 'resolved', lat: 12.9815, lng: 80.2180, address: 'Velachery Main Road, Chennai', citizenId: citizen3._id, departmentId: roadsD._id, officerId: officer1._id, aiScore: 70, dupProb: 10, sla: sla(-96), created: d(14) },
    { complaintId: 'CP-2026-00114', title: 'Garbage cleared at Besant Nagar Beach', description: 'Garbage and plastic waste accumulating near Besant Nagar beach entrance.', category: 'Garbage', severity: 'medium', priority: 'P3', status: 'resolved', lat: 13.0002, lng: 80.2660, address: 'Besant Nagar Beach Road, Chennai', citizenId: citizen._id, departmentId: sanitationD._id, officerId: officer4._id, aiScore: 42, dupProb: 6, sla: sla(-120), created: d(18) },
    { complaintId: 'CP-2026-00115', title: 'Drain blockage cleared at Nungambakkam', description: 'Storm water drain blocked causing water stagnation during rains.', category: 'Drainage', severity: 'high', priority: 'P2', status: 'resolved', lat: 13.0569, lng: 80.2425, address: 'Nungambakkam High Road, Chennai', citizenId: citizen2._id, departmentId: drainageD._id, officerId: officer5._id, aiScore: 65, dupProb: 8, sla: sla(-144), created: d(20) },
    { complaintId: 'CP-2026-00116', title: 'Streetlight repaired at Guindy', description: 'Row of streetlights on Guindy industrial estate road were not functioning.', category: 'Streetlights', severity: 'medium', priority: 'P3', status: 'resolved', lat: 13.0067, lng: 80.2206, address: 'Guindy Industrial Estate, Chennai', citizenId: citizen3._id, departmentId: electricalD._id, officerId: officer3._id, aiScore: 50, dupProb: 4, sla: sla(-168), created: d(22) },
    { complaintId: 'CP-2026-00117', title: 'Water supply restored at Ashok Nagar', description: 'Intermittent water supply affecting 200+ households in Ashok Nagar.', category: 'Water', severity: 'high', priority: 'P2', status: 'resolved', lat: 13.0388, lng: 80.2112, address: 'Ashok Nagar 5th Avenue, Chennai', citizenId: citizen._id, departmentId: waterD._id, officerId: officer2._id, aiScore: 72, dupProb: 15, sla: sla(-192), created: d(25) },
    { complaintId: 'CP-2026-00118', title: 'Road repaired at KK Nagar', description: 'Badly damaged road surface at KK Nagar main road intersection.', category: 'Roads', severity: 'medium', priority: 'P3', status: 'resolved', lat: 13.0390, lng: 80.2025, address: 'KK Nagar Main Road, Chennai', citizenId: citizen2._id, departmentId: roadsD._id, officerId: officer1._id, aiScore: 55, dupProb: 7, sla: sla(-216), created: d(28) },

    // ── Awaiting verification ──
    { complaintId: 'CP-2026-00119', title: 'Pothole repaired on Mount Road', description: 'Deep pothole on Mount Road near Express Avenue causing accidents.', category: 'Roads', severity: 'high', priority: 'P1', status: 'awaiting_verification', lat: 13.0580, lng: 80.2610, address: 'Mount Road, Near Express Avenue, Chennai', citizenId: citizen._id, departmentId: roadsD._id, officerId: officer1._id, aiScore: 78, dupProb: 12, sla: sla(-20), created: d(4) },
    { complaintId: 'CP-2026-00120', title: 'Garbage collection resumed at Porur', description: 'Irregular garbage collection in Porur residential area for the past 2 weeks.', category: 'Garbage', severity: 'medium', priority: 'P3', status: 'awaiting_verification', lat: 13.0382, lng: 80.1567, address: 'Porur 3rd Street, Chennai', citizenId: citizen2._id, departmentId: sanitationD._id, officerId: officer4._id, aiScore: 48, dupProb: 5, sla: sla(-36), created: d(6) },

    // ── Escalated / SLA Breached ──
    { complaintId: 'CP-2026-00121', title: 'Sewage overflow at Chromepet', description: 'Severe sewage overflow on Chromepet main road. Entire road flooded with sewage water. Public health emergency.', category: 'Drainage', severity: 'critical', priority: 'P1', status: 'escalated', lat: 12.9516, lng: 80.1462, address: 'Chromepet Main Road, Chennai', citizenId: citizen3._id, departmentId: drainageD._id, officerId: officer5._id, aiScore: 92, dupProb: 3, sla: sla(-48), created: d(5) },
    { complaintId: 'CP-2026-00122', title: 'Dangerous exposed electric wire', description: 'Electric wire fallen and exposed near children park at Vadapalani. Extreme danger to public.', category: 'Streetlights', severity: 'critical', priority: 'P1', status: 'escalated', lat: 13.0498, lng: 80.2121, address: 'Near Vadapalani Park, Chennai', citizenId: citizen._id, departmentId: electricalD._id, officerId: officer3._id, aiScore: 95, dupProb: 2, sla: sla(-72), created: d(6) },

    // ── More diverse complaints ──
    { complaintId: 'CP-2026-00123', title: 'Traffic signal malfunction at Tambaram', description: 'Traffic signal at Tambaram junction blinking orange continuously. Causing traffic confusion.', category: 'Traffic', severity: 'high', priority: 'P2', status: 'assigned', lat: 12.9249, lng: 80.1000, address: 'Tambaram Junction, Chennai', citizenId: citizen2._id, departmentId: electricalD._id, officerId: officer3._id, aiScore: 68, dupProb: 4, sla: sla(20), created: d(1) },
    { complaintId: 'CP-2026-00124', title: 'Park bench broken at Semmozhi Poonga', description: 'Multiple park benches broken at Semmozhi Poonga botanical garden. Sharp edges exposed.', category: 'Parks', severity: 'medium', priority: 'P3', status: 'submitted', lat: 13.0610, lng: 80.2530, address: 'Semmozhi Poonga, Cathedral Road, Chennai', citizenId: citizen3._id, departmentId: roadsD._id, aiScore: 38, dupProb: 2, sla: sla(68), created: d(1) },
    { complaintId: 'CP-2026-00125', title: 'Public toilet not maintained', description: 'Public toilet near Egmore railway station is in terrible condition. No water, broken doors, very unhygienic.', category: 'Public Buildings', severity: 'medium', priority: 'P3', status: 'submitted', lat: 13.0732, lng: 80.2609, address: 'Near Egmore Railway Station, Chennai', citizenId: citizen._id, departmentId: sanitationD._id, aiScore: 45, dupProb: 6, sla: sla(62), created: h(12) }
  ];

  const complaints = [];
  for (const cd of complaintsData) {
    const complaint = await Complaint.create({
      complaintId: cd.complaintId, title: cd.title, description: cd.description,
      category: cd.category, severity: cd.severity, priority: cd.priority, status: cd.status,
      latitude: cd.lat, longitude: cd.lng, address: cd.address,
      citizenId: cd.citizenId, departmentId: cd.departmentId, officerId: cd.officerId || undefined,
      aiScore: cd.aiScore, duplicateProbability: cd.dupProb,
      slaDeadline: cd.sla, supportCount: Math.floor(Math.random() * 15),
      createdAt: cd.created, updatedAt: cd.status === 'resolved' ? new Date(cd.created.getTime() + 48 * 60 * 60 * 1000) : now
    });
    complaints.push(complaint);
  }

  // ─── TIMELINE EVENTS ───
  for (const c of complaints) {
    const events = [{ status: 'submitted', message: 'Complaint submitted by citizen', ts: c.createdAt }];
    events.push({ status: 'ai_analyzed', message: `AI Analysis: ${c.priority} priority — ${c.category}`, ts: new Date(c.createdAt.getTime() + 2000) });

    if (['assigned', 'officer_accepted', 'in_progress', 'resolution_submitted', 'awaiting_verification', 'resolved', 'escalated', 'reopened'].includes(c.status)) {
      events.push({ status: 'assigned', message: `Assigned to ${c.departmentId ? 'department officer' : 'field team'}`, ts: new Date(c.createdAt.getTime() + 3600000) });
    }
    if (['officer_accepted', 'in_progress', 'resolution_submitted', 'awaiting_verification', 'resolved'].includes(c.status)) {
      events.push({ status: 'officer_accepted', message: 'Officer accepted the assignment', ts: new Date(c.createdAt.getTime() + 7200000) });
    }
    if (['in_progress', 'resolution_submitted', 'awaiting_verification', 'resolved'].includes(c.status)) {
      events.push({ status: 'in_progress', message: 'Work started on the issue', ts: new Date(c.createdAt.getTime() + 14400000) });
    }
    if (['resolution_submitted', 'awaiting_verification', 'resolved'].includes(c.status)) {
      events.push({ status: 'resolution_submitted', message: 'Resolution evidence uploaded', ts: new Date(c.createdAt.getTime() + 28800000) });
    }
    if (['awaiting_verification', 'resolved'].includes(c.status)) {
      events.push({ status: 'awaiting_verification', message: 'Awaiting citizen verification', ts: new Date(c.createdAt.getTime() + 32400000) });
    }
    if (c.status === 'resolved') {
      events.push({ status: 'resolved', message: 'Resolution verified by citizen. Issue resolved.', ts: new Date(c.createdAt.getTime() + 43200000) });
    }
    if (c.status === 'escalated') {
      events.push({ status: 'escalated', message: 'SLA breached — escalated to department head', ts: new Date(c.createdAt.getTime() + 86400000) });
    }

    for (const ev of events) {
      await TimelineEvent.create({
        complaintId: c._id, status: ev.status, message: ev.message,
        createdByName: ev.status === 'ai_analyzed' ? 'CivicPulse AI' : ev.status === 'submitted' ? 'Citizen' : 'System',
        timestamp: ev.ts
      });
    }
  }

  // ─── EVIDENCE ───
  const resolvedComplaints = complaints.filter(c => ['resolved', 'awaiting_verification'].includes(c.status));
  for (const c of resolvedComplaints) {
    await Evidence.create([
      { complaintId: c._id, type: 'image', url: '/demo/before-pothole.svg', uploadedBy: c.citizenId, stage: 'report', uploadedAt: c.createdAt },
      { complaintId: c._id, type: 'image', url: '/demo/after-fixed.svg', uploadedBy: c.officerId || officer1._id, stage: 'after', uploadedAt: new Date(c.createdAt.getTime() + 30000000) }
    ]);
  }

  // ─── FEEDBACK ───
  const resolvedOnly = complaints.filter(c => c.status === 'resolved');
  for (const c of resolvedOnly) {
    await Feedback.create({
      complaintId: c._id, citizenId: c.citizenId,
      rating: Math.floor(Math.random() * 2) + 4,
      comment: ['Great work, fixed quickly!', 'Satisfactory resolution.', 'Good job by the team.', 'Took a while but resolved properly.', 'Excellent response time!'][Math.floor(Math.random() * 5)],
      createdAt: new Date(c.createdAt.getTime() + 50000000)
    });
  }

  // ─── NOTIFICATIONS ───
  await Notification.create([
    { userId: citizen._id, complaintId: complaints[0]._id, type: 'status_update', message: `${complaints[0].complaintId}: Work has started on your complaint`, isRead: false },
    { userId: citizen._id, complaintId: complaints[18]._id, type: 'verification', message: `${complaints[18].complaintId}: Your complaint needs verification — please check resolution`, isRead: false },
    { userId: citizen._id, complaintId: complaints[10]._id, type: 'resolved', message: `${complaints[10].complaintId}: Your complaint has been resolved`, isRead: true },
    { userId: citizen._id, complaintId: complaints[3]._id, type: 'assignment', message: `${complaints[3].complaintId}: Your complaint has been assigned to a field officer`, isRead: true },
    { userId: citizen._id, complaintId: complaints[21]._id, type: 'escalation', message: `${complaints[21].complaintId}: Your complaint has been escalated due to SLA breach`, isRead: false },
    { userId: officer1._id, complaintId: complaints[0]._id, type: 'assignment', message: `New complaint assigned: ${complaints[0].complaintId} - ${complaints[0].title}`, isRead: false },
    { userId: officer1._id, complaintId: complaints[1]._id, type: 'assignment', message: `New complaint assigned: ${complaints[1].complaintId} - ${complaints[1].title}`, isRead: true },
    { userId: officer1._id, complaintId: complaints[3]._id, type: 'assignment', message: `New complaint assigned: ${complaints[3].complaintId} - ${complaints[3].title}`, isRead: false },
    { userId: admin._id, complaintId: complaints[20]._id, type: 'escalation', message: `SLA ESCALATION: ${complaints[20].complaintId} — No action within SLA deadline`, isRead: false },
    { userId: admin._id, complaintId: complaints[21]._id, type: 'escalation', message: `SLA ESCALATION: ${complaints[21].complaintId} — Critical safety issue unresolved`, isRead: false },
    { userId: admin._id, type: 'system', message: 'Daily report: 3 new complaints submitted today', isRead: true }
  ]);

  console.log('✅ Seed completed successfully!');
  console.log(`   Users: 9`);
  console.log(`   Departments: 5`);
  console.log(`   Officers: 5`);
  console.log(`   Complaints: ${complaints.length}`);
  console.log('');
  console.log('Demo Credentials:');
  console.log('   Citizen:  citizen@civicpulse.demo / password123');
  console.log('   Officer:  officer@civicpulse.demo / password123');
  console.log('   Admin:    admin@civicpulse.demo / password123');

  process.exit(0);
}

seed().catch(err => { console.error('Seed error:', err); process.exit(1); });
