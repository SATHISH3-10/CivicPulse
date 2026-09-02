import connectDB from '../db/connection.js';

async function autoDispatchExisting() {
  await connectDB();

  const Complaint = (await import('../models/Complaint.js')).default;
  const TimelineEvent = (await import('../models/TimelineEvent.js')).default;
  const User = (await import('../models/User.js')).default;
  const Department = (await import('../models/Department.js')).default;

  const electricalDept = await Department.findOne({ name: /electrical/i });
  const electricalOfficer = await User.findOne({ 
    role: 'officer',
    $or: [
      { departmentId: electricalDept?._id },
      { name: /priya|suresh/i }
    ]
  });

  const complaint = await Complaint.findOne({ complaintId: 'CP-2026-86816' });
  if (complaint && electricalOfficer) {
    complaint.officerId = electricalOfficer._id;
    complaint.departmentId = electricalDept?._id || complaint.departmentId;
    complaint.status = 'assigned';
    await complaint.save();

    // Check if timeline event for 'assigned' exists
    const existingAssignedEvent = await TimelineEvent.findOne({
      complaintId: complaint._id,
      status: 'assigned'
    });

    if (!existingAssignedEvent) {
      await TimelineEvent.create({
        complaintId: complaint._id,
        status: 'assigned',
        message: `🤖 AI Auto-Dispatched to Field Officer ${electricalOfficer.name} (Electrical Department) for immediate action`,
        createdByName: 'CivicPulse AI Auto-Dispatcher',
        timestamp: new Date()
      });
    }
    console.log(`Auto-dispatched ${complaint.complaintId} to ${electricalOfficer.name}`);
  }

  // Also auto-dispatch any other stuck 'ai_analyzed' complaints
  const stuckComplaints = await Complaint.find({ status: 'ai_analyzed' }).populate('departmentId');
  for (const c of stuckComplaints) {
    const officer = await User.findOne({ role: 'officer' });
    if (officer) {
      c.officerId = officer._id;
      c.status = 'assigned';
      await c.save();
      await TimelineEvent.create({
        complaintId: c._id,
        status: 'assigned',
        message: `🤖 AI Auto-Dispatched to Field Officer ${officer.name} (${c.departmentId?.name || 'Department'})`,
        createdByName: 'CivicPulse AI Auto-Dispatcher',
        timestamp: new Date()
      });
      console.log(`Auto-dispatched ${c.complaintId} to ${officer.name}`);
    }
  }

  process.exit(0);
}

autoDispatchExisting().catch(console.error);
