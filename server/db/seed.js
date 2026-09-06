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

async function seed() {
  await connectDB();
  console.log('Seeding database with clean account data...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // ─── USERS ───
  const userSpecs = [
    { name: 'Johan', email: 'sathishm.ug.24.it@francisxavier.ac.in', phone: '9876543210', passwordHash, role: 'citizen', city: 'Chennai' },
    { name: 'Sathish', email: 'sathish.kurmbur2006@gmail.com', phone: '9876543218', passwordHash, role: 'officer', city: 'Chennai' },
    { name: 'Thiruvengadasuburamaninan', email: 'thiruvengadasuburamaninan@gmail.com', phone: '9876543219', passwordHash, role: 'admin', city: 'Chennai' }
  ];

  const createdUsers = {};
  for (const spec of userSpecs) {
    let existing = await User.findOne({ email: spec.email.toLowerCase() });
    if (existing) {
      existing.name = spec.name;
      existing.role = spec.role;
      existing.phone = spec.phone;
      existing.city = spec.city;
      await User.findOneAndUpdate({ _id: existing._id }, existing);
      createdUsers[spec.email] = existing;
    } else {
      const newUser = await User.create(spec);
      createdUsers[spec.email] = newUser;
    }
  }

  const citizen = createdUsers['sathishm.ug.24.it@francisxavier.ac.in'];
  const officerUser = createdUsers['sathish.kurmbur2006@gmail.com'];
  const adminUser = createdUsers['thiruvengadasuburamaninan@gmail.com'];

  // ─── DEPARTMENTS ───
  const deptSpecs = [
    { name: 'Roads & Infrastructure', category: 'Roads', head: 'Mr. Venkatesh', icon: '🛣️', description: 'Road maintenance, potholes, and infrastructure' },
    { name: 'Water Supply Department', category: 'Water', head: 'Mrs. Padmini', icon: '💧', description: 'Water supply, pipelines, and water quality' },
    { name: 'Electrical Department', category: 'Streetlights', head: 'Mr. Rajesh', icon: '💡', description: 'Streetlights, electrical infrastructure' },
    { name: 'Sanitation Department', category: 'Garbage', head: 'Mr. Ganesh', icon: '🗑️', description: 'Waste collection, cleanliness, and sanitation' },
    { name: 'Drainage & Sewage Department', category: 'Drainage', head: 'Mrs. Kavitha', icon: '🚰', description: 'Drainage systems, sewage, and flood prevention' }
  ];

  const depts = [];
  for (const d of deptSpecs) {
    let existing = await Department.findOne({ name: d.name });
    if (!existing) {
      existing = await Department.create(d);
    }
    depts.push(existing);
  }

  const [roadsD] = depts;

  // ─── OFFICER PROFILE ───
  let existingOfficer = await Officer.findOne({ userId: officerUser._id });
  if (!existingOfficer) {
    await Officer.create({
      userId: officerUser._id,
      departmentId: roadsD._id,
      availability: 'available',
      latitude: 13.0827,
      longitude: 80.2707
    });
  }

  console.log('✅ Clean database setup complete!');
  console.log('   Users:');
  console.log(`   - Citizen: ${citizen.email} (${citizen.role})`);
  console.log(`   - Officer: ${officerUser.email} (${officerUser.role})`);
  console.log(`   - Admin:   ${adminUser.email} (${adminUser.role})`);
  process.exit(0);
}

seed().catch(err => { console.error('Seed error:', err); process.exit(1); });
