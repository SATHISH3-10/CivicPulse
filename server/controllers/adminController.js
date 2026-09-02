import Complaint from '../models/Complaint.js';
import Department from '../models/Department.js';
import User from '../models/User.js';
import Officer from '../models/Officer.js';
import Feedback from '../models/Feedback.js';
import TimelineEvent from '../models/TimelineEvent.js';
import Notification from '../models/Notification.js';
import { detectHotspots } from '../services/aiEngine.js';

export async function getAnalytics(req, res) {
  try {
    const all = await Complaint.find().lean();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const isValidDate = (d) => d && !isNaN(new Date(d).getTime());

    const resolved = all.filter(c => c.status === 'resolved');
    const active = all.filter(c => !['resolved'].includes(c.status));
    const critical = all.filter(c => c.priority === 'P1' && c.status !== 'resolved');
    const slaBreached = all.filter(c => isValidDate(c.slaDeadline) && new Date(c.slaDeadline) < now && c.status !== 'resolved');
    const resolvedToday = resolved.filter(c => isValidDate(c.updatedAt) && new Date(c.updatedAt) >= todayStart);

    // Average resolution time (hours)
    const resolvedWithTime = resolved.filter(c => isValidDate(c.createdAt) && isValidDate(c.updatedAt));
    const avgResolutionHours = resolvedWithTime.length > 0
      ? Math.round(resolvedWithTime.reduce((sum, c) => sum + (new Date(c.updatedAt) - new Date(c.createdAt)) / (1000 * 60 * 60), 0) / resolvedWithTime.length)
      : 0;

    // Complaints by category
    const byCategory = {};
    all.forEach(c => {
      const cat = c.category || 'Uncategorized';
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    });

    // Complaints by status
    const byStatus = {};
    all.forEach(c => {
      const st = c.status || 'submitted';
      byStatus[st] = (byStatus[st] || 0) + 1;
    });

    // Complaints over time (last 30 days)
    const overTime = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const count = all.filter(c => isValidDate(c.createdAt) && new Date(c.createdAt).toISOString().split('T')[0] === dateStr).length;
      const resolvedCount = resolved.filter(c => isValidDate(c.updatedAt) && new Date(c.updatedAt).toISOString().split('T')[0] === dateStr).length;
      overTime.push({ date: dateStr, submitted: count, resolved: resolvedCount });
    }

    // Satisfaction
    const feedbacks = await Feedback.find().lean();
    const avgSatisfaction = feedbacks.length > 0
      ? (feedbacks.reduce((sum, f) => sum + (Number(f.rating) || 0), 0) / feedbacks.length).toFixed(1)
      : 0;

    // Recent escalations
    const escalated = all.filter(c => c.status === 'escalated' || (isValidDate(c.slaDeadline) && new Date(c.slaDeadline) < now && !['resolved'].includes(c.status)))
      .sort((a, b) => (isValidDate(b.updatedAt) ? new Date(b.updatedAt) : 0) - (isValidDate(a.updatedAt) ? new Date(a.updatedAt) : 0))
      .slice(0, 10);

    res.json({
      stats: {
        total: all.length,
        active: active.length,
        resolved: resolved.length,
        critical: critical.length,
        slaBreached: slaBreached.length,
        resolvedToday: resolvedToday.length,
        avgResolutionHours,
        avgSatisfaction,
        resolutionRate: all.length > 0 ? Math.round((resolved.length / all.length) * 100) : 0
      },
      byCategory,
      byStatus,
      overTime,
      escalated
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics: ' + error.message });
  }
}

export async function getHotspots(req, res) {
  try {
    const complaints = await Complaint.find().lean();
    const hotspots = detectHotspots(complaints);
    res.json({ hotspots });
  } catch (error) {
    res.status(500).json({ error: 'Failed to detect hotspots' });
  }
}

export async function getDepartments(req, res) {
  try {
    const departments = await Department.find().lean();
    const result = [];

    for (const dept of departments) {
      const complaints = await Complaint.find({ departmentId: dept._id }).lean();
      const resolved = complaints.filter(c => c.status === 'resolved');
      const active = complaints.filter(c => c.status !== 'resolved');
      const slaBreached = complaints.filter(c => c.slaDeadline && new Date(c.slaDeadline) < new Date() && c.status !== 'resolved');

      const resolvedWithTime = resolved.filter(c => c.createdAt && c.updatedAt);
      const avgResolutionHours = resolvedWithTime.length > 0
        ? Math.round(resolvedWithTime.reduce((sum, c) => sum + (new Date(c.updatedAt) - new Date(c.createdAt)) / (1000 * 60 * 60), 0) / resolvedWithTime.length)
        : 0;

      const feedbacks = await Feedback.find({ complaintId: { $in: complaints.map(c => c._id) } }).lean();
      const avgSatisfaction = feedbacks.length > 0 ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1) : 0;

      result.push({
        ...dept,
        totalComplaints: complaints.length,
        active: active.length,
        resolved: resolved.length,
        resolutionRate: complaints.length > 0 ? Math.round((resolved.length / complaints.length) * 100) : 0,
        slaBreached: slaBreached.length,
        avgResolutionHours,
        avgSatisfaction
      });
    }

    res.json({ departments: result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
}

export async function getAllComplaints(req, res) {
  try {
    const { status, category, priority, search, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { complaintId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Complaint.countDocuments(filter);
    const complaints = await Complaint.find(filter)
      .populate('departmentId', 'name icon')
      .populate('citizenId', 'name email')
      .populate('officerId', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    res.json({ complaints, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
}

export async function assignComplaint(req, res) {
  try {
    const { officerId, departmentId } = req.body;
    let complaint = await Complaint.findOne({ complaintId: req.params.id });
    if (!complaint) complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    const updateFields = { status: 'assigned' };
    if (officerId) updateFields.officerId = officerId;
    if (departmentId) updateFields.departmentId = departmentId;

    complaint = await Complaint.findOneAndUpdate(
      { _id: complaint._id },
      updateFields,
      { new: true }
    );

    const officer = officerId ? await User.findById(officerId) : null;
    const deptDoc = complaint.departmentId ? await Department.findById(complaint.departmentId) : null;

    await TimelineEvent.create({
      complaintId: complaint._id,
      status: 'assigned',
      message: `Assigned to ${officer ? officer.name : 'officer'} by admin`,
      createdBy: req.userId || req.user?._id,
      createdByName: req.user?.name || 'Administrator',
      department: deptDoc?.name || ''
    });

    if (officerId) {
      await Notification.create({
        userId: officerId,
        complaintId: complaint._id,
        type: 'assignment',
        message: `New complaint assigned: ${complaint.complaintId} - ${complaint.title}`
      });
    }
    if (complaint.citizenId) {
      await Notification.create({
        userId: complaint.citizenId,
        complaintId: complaint._id,
        type: 'status_update',
        message: `Your complaint ${complaint.complaintId} has been assigned to a field officer`
      });
    }

    res.json({ complaint, message: 'Complaint assigned successfully' });
  } catch (error) {
    console.error('Assign complaint error:', error);
    res.status(500).json({ error: 'Failed to assign complaint: ' + error.message });
  }
}

export async function getOfficers(req, res) {
  try {
    const officers = await Officer.find()
      .populate('userId', 'name email phone')
      .populate('departmentId', 'name')
      .lean();
    res.json({ officers });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch officers' });
  }
}

export async function getUsers(req, res) {
  try {
    const users = await User.find()
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ users });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}
