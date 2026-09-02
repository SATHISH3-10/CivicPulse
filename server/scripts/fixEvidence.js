import connectDB from '../db/connection.js';

async function fixAllStreetlightEvidence() {
  await connectDB();

  const Complaint = (await import('../models/Complaint.js')).default;
  const Evidence = (await import('../models/Evidence.js')).default;

  const streetlightComplaints = await Complaint.find({
    $or: [
      { complaintId: 'CP-2026-86816' },
      { category: 'Streetlights' },
      { title: { $regex: 'light|lamp', $options: 'i' } }
    ]
  });

  console.log(`Found ${streetlightComplaints.length} streetlight complaints.`);
  for (const c of streetlightComplaints) {
    await Evidence.deleteMany({ complaintId: c._id });
    await Evidence.create({
      complaintId: c._id,
      type: 'image',
      url: '/demo/streetlight-reported.svg',
      uploadedBy: c.citizenId,
      stage: 'report'
    });
    console.log(`Updated evidence for: ${c.complaintId} — ${c.title}`);
  }

  process.exit(0);
}

fixAllStreetlightEvidence().catch(console.error);
