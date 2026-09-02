import Complaint from '../models/Complaint.js';
import Evidence from '../models/Evidence.js';
import TimelineEvent from '../models/TimelineEvent.js';
import Notification from '../models/Notification.js';
import Feedback from '../models/Feedback.js';
import ComplaintSupport from '../models/ComplaintSupport.js';
import Department from '../models/Department.js';
import User from '../models/User.js';
import { analyzeComplaint } from '../services/aiEngine.js';

function generateComplaintId() {
  const year = new Date().getFullYear();
  const num = String(Math.floor(Math.random() * 99999)).padStart(5, '0');
  return `CP-${year}-${num}`;
}

export async function createComplaint(req, res) {
  try {
    const { title, description, category, subcategory, severity, latitude, longitude, address, district, area, evidenceUrls } = req.body;
    if (!title || !description || !category || !latitude || !longitude) {
      return res.status(400).json({ error: 'Title, description, category, and location are required' });
    }

    const nearbyComplaints = await Complaint.find({
      latitude: { $gte: latitude - 0.05, $lte: latitude + 0.05 },
      longitude: { $gte: longitude - 0.05, $lte: longitude + 0.05 }
    }).lean();

    const analysis = analyzeComplaint(title, description, category, severity || 'medium', latitude, longitude, nearbyComplaints);

    const dept = await Department.findOne({ name: analysis.department });
    const slaDeadline = new Date(Date.now() + analysis.slaHours * 60 * 60 * 1000);

    // AI Auto-Dispatch: Immediately find best matching field officer in this department
    let assignedOfficer = null;
    if (dept) {
      assignedOfficer = await User.findOne({
        role: 'officer',
        departmentId: dept._id
      });
    }
    if (!assignedOfficer) {
      // Fallback to any available officer
      assignedOfficer = await User.findOne({ role: 'officer' });
    }

    const complaint = await Complaint.create({
      complaintId: generateComplaintId(),
      title,
      description,
      category,
      subcategory: subcategory || '',
      severity: severity || 'medium',
      priority: analysis.suggestedPriority,
      status: assignedOfficer ? 'assigned' : 'ai_analyzed',
      latitude,
      longitude,
      address: address || '',
      district: district || 'Chennai',
      area: area || '',
      citizenId: req.userId,
      departmentId: dept?._id,
      officerId: assignedOfficer?._id || undefined,
      aiScore: analysis.aiScore,
      duplicateProbability: analysis.duplicateProbability,
      slaDeadline
    });

    // Determine appropriate category proof URL
    const lowerCat = (category || '').toLowerCase();
    const lowerTitle = (title || '').toLowerCase();
    let defaultCategoryProof = '/demo/before-pothole.svg';
    if (lowerCat.includes('street') || lowerCat.includes('elect') || lowerTitle.includes('light') || lowerTitle.includes('lamp')) {
      defaultCategoryProof = '/demo/streetlight-reported.svg';
    } else if (lowerCat.includes('water') || lowerCat.includes('drain') || lowerTitle.includes('water') || lowerTitle.includes('leak')) {
      defaultCategoryProof = '/demo/water-leak.svg';
    }

    // Save initial submitted evidence proof
    if (evidenceUrls && Array.isArray(evidenceUrls) && evidenceUrls.length > 0) {
      for (const url of evidenceUrls) {
        await Evidence.create({
          complaintId: complaint._id,
          type: 'image',
          url: url || defaultCategoryProof,
          uploadedBy: req.userId,
          stage: 'report'
        });
      }
    } else {
      // Category matched proof placeholder
      await Evidence.create({
        complaintId: complaint._id,
        type: 'image',
        url: defaultCategoryProof,
        uploadedBy: req.userId,
        stage: 'report'
      });
    }

    const timelineEvents = [
      { complaintId: complaint._id, status: 'submitted', message: 'Complaint submitted by citizen with location & photo proof', createdBy: req.userId, createdByName: req.user.name },
      { complaintId: complaint._id, status: 'ai_analyzed', message: `AI Analysis: ${analysis.suggestedPriority} priority, auto-routed to ${analysis.department}`, createdByName: 'CivicPulse AI' }
    ];

    if (assignedOfficer) {
      timelineEvents.push({
        complaintId: complaint._id,
        status: 'assigned',
        message: `🤖 AI Auto-Dispatched: Work order assigned to Field Officer ${assignedOfficer.name} (${dept?.name || 'Department'})`,
        createdByName: 'CivicPulse AI Auto-Dispatcher'
      });
    }

    await TimelineEvent.create(timelineEvents);

    res.status(201).json({ complaint, analysis });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ error: 'Failed to create complaint' });
  }
}

export async function getComplaints(req, res) {
  try {
    const { status, category, priority, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (req.user.role === 'citizen') filter.citizenId = req.userId;
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const total = await Complaint.countDocuments(filter);
    const rawComplaints = await Complaint.find(filter)
      .populate('departmentId', 'name icon')
      .populate('citizenId', 'name email')
      .populate('officerId', 'name phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    // Attach evidence items for previewing
    const complaintIds = rawComplaints.map(c => c._id);
    const allEvidence = await Evidence.find({ complaintId: { $in: complaintIds } }).lean();

    const complaints = rawComplaints.map(c => ({
      ...c,
      evidence: allEvidence.filter(e => String(e.complaintId) === String(c._id))
    }));

    res.json({ complaints, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
}

export async function getComplaintById(req, res) {
  try {
    const idParam = req.params.id;
    let complaint = await Complaint.findOne({ complaintId: idParam })
      .populate('departmentId', 'name icon head')
      .populate('citizenId', 'name email phone')
      .populate('officerId', 'name email phone')
      .lean();

    if (!complaint) {
      complaint = await Complaint.findById(idParam);
      if (complaint) {
        complaint = await Complaint.findOne({ _id: complaint._id })
          .populate('departmentId', 'name icon head')
          .populate('citizenId', 'name email phone')
          .populate('officerId', 'name email phone')
          .lean();
      }
    }

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const [timeline, evidence, feedback, supportCount] = await Promise.all([
      TimelineEvent.find({ complaintId: complaint._id }).sort({ timestamp: 1 }).lean(),
      Evidence.find({ complaintId: complaint._id }).sort({ uploadedAt: 1 }).lean(),
      Feedback.findOne({ complaintId: complaint._id }).lean(),
      ComplaintSupport.countDocuments({ complaintId: complaint._id })
    ]);

    res.json({ complaint, timeline, evidence, feedback, supportCount });
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({ error: 'Failed to fetch complaint' });
  }
}

export async function updateComplaint(req, res) {
  try {
    const complaint = await Complaint.findOne({ complaintId: req.params.id });
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    const updates = req.body;
    const oldStatus = complaint.status;

    Object.assign(complaint, updates);
    await complaint.save();

    if (updates.status && updates.status !== oldStatus) {
      await TimelineEvent.create({
        complaintId: complaint._id,
        status: updates.status,
        message: updates.message || `Status changed to ${updates.status}`,
        createdBy: req.userId,
        createdByName: req.user.name
      });

      if (complaint.citizenId) {
        await Notification.create({
          userId: complaint.citizenId,
          complaintId: complaint._id,
          type: 'status_update',
          message: `Your complaint ${complaint.complaintId} status updated to: ${formatStatus(updates.status)}`
        });
      }
    }

    res.json({ complaint });
  } catch (error) {
    console.error('Update complaint error:', error);
    res.status(500).json({ error: 'Failed to update complaint' });
  }
}

export async function getNearbyComplaints(req, res) {
  try {
    const { lat, lng, radius = 2 } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'Latitude and longitude required' });

    const delta = radius / 111;
    const complaints = await Complaint.find({
      latitude: { $gte: Number(lat) - delta, $lte: Number(lat) + delta },
      longitude: { $gte: Number(lng) - delta, $lte: Number(lng) + delta }
    }).populate('departmentId', 'name icon').sort({ createdAt: -1 }).limit(50).lean();

    res.json({ complaints });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch nearby complaints' });
  }
}

export async function getTimeline(req, res) {
  try {
    const complaint = await Complaint.findOne({ complaintId: req.params.id });
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    const timeline = await TimelineEvent.find({ complaintId: complaint._id }).sort({ timestamp: 1 }).lean();
    res.json({ timeline });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
}

export async function addTimelineEvent(req, res) {
  try {
    const complaint = await Complaint.findOne({ complaintId: req.params.id });
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    const { status, message } = req.body;
    const event = await TimelineEvent.create({
      complaintId: complaint._id, status, message,
      createdBy: req.userId, createdByName: req.user.name
    });

    if (status) {
      complaint.status = status;
      await complaint.save();
    }

    res.status(201).json({ event });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add timeline event' });
  }
}

export async function uploadEvidence(req, res) {
  try {
    const complaint = await Complaint.findOne({ complaintId: req.params.id });
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    const { stage, url } = req.body;
    const evidence = await Evidence.create({
      complaintId: complaint._id,
      type: 'image',
      url: url || (req.file ? `/uploads/${req.file.filename}` : '/demo/before-pothole.svg'),
      uploadedBy: req.userId,
      stage: stage || 'report'
    });

    res.status(201).json({ evidence });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload evidence' });
  }
}

export async function verifyResolution(req, res) {
  try {
    const complaint = await Complaint.findOne({ complaintId: req.params.id });
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    const { resolved, reason } = req.body;

    if (resolved) {
      complaint.status = 'resolved';
      await complaint.save();
      await TimelineEvent.create({
        complaintId: complaint._id, status: 'resolved',
        message: 'Resolution verified by citizen', createdBy: req.userId, createdByName: req.user.name
      });
    } else {
      complaint.status = 'reopened';
      await complaint.save();
      await TimelineEvent.create({
        complaintId: complaint._id, status: 'reopened',
        message: `Citizen rejected resolution: ${reason || 'Issue still exists'}`,
        createdBy: req.userId, createdByName: req.user.name
      });
      if (complaint.officerId) {
        await Notification.create({
          userId: complaint.officerId, complaintId: complaint._id,
          type: 'reopened', message: `Complaint ${complaint.complaintId} has been reopened by citizen`
        });
      }
    }

    res.json({ complaint });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify resolution' });
  }
}

export async function submitFeedback(req, res) {
  try {
    const complaint = await Complaint.findOne({ complaintId: req.params.id });
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    const { rating, comment } = req.body;
    const feedback = await Feedback.findOneAndUpdate(
      { complaintId: complaint._id, citizenId: req.userId },
      { rating, comment, createdAt: new Date() },
      { upsert: true, new: true }
    );

    res.json({ feedback });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
}

export async function supportComplaint(req, res) {
  try {
    const complaint = await Complaint.findOne({ complaintId: req.params.id });
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    const existing = await ComplaintSupport.findOne({ complaintId: complaint._id, userId: req.userId });
    if (existing) return res.status(400).json({ error: 'Already supported' });

    await ComplaintSupport.create({ complaintId: complaint._id, userId: req.userId });
    complaint.supportCount = (complaint.supportCount || 0) + 1;
    await complaint.save();

    res.json({ supportCount: complaint.supportCount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to support complaint' });
  }
}

export async function getAllComplaintsPublic(req, res) {
  try {
    const { status, category, priority } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const complaints = await Complaint.find(filter)
      .populate('departmentId', 'name icon')
      .select('-description')
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    res.json({ complaints });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
}

function formatStatus(status) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}
