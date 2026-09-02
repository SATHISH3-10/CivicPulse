import Complaint from '../models/Complaint.js';
import TimelineEvent from '../models/TimelineEvent.js';
import Evidence from '../models/Evidence.js';
import Notification from '../models/Notification.js';
import Officer from '../models/Officer.js';
import User from '../models/User.js';

// Haversine distance calculator in KM
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function getOfficerComplaints(req, res) {
  try {
    // Fetch officer profile details
    const officerProfile = await Officer.findOne({ userId: req.userId }).populate('departmentId');
    const officerUser = await User.findById(req.userId);

    const officerLat = officerProfile?.latitude || officerUser?.latitude || 13.0827;
    const officerLng = officerProfile?.longitude || officerUser?.longitude || 80.2707;
    const radiusKm = officerProfile?.jurisdictionRadiusKm || officerUser?.jurisdictionRadiusKm || 8;
    const departmentId = officerProfile?.departmentId?._id || officerUser?.departmentId;
    const officerArea = officerProfile?.area || officerUser?.area || '';
    const officerDistrict = officerProfile?.district || officerUser?.district || '';

    // 1. Directly assigned complaints
    const assignedComplaints = await Complaint.find({ officerId: req.userId })
      .populate('departmentId', 'name icon')
      .populate('citizenId', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    // 2. All active complaints in officer's department / border area
    const departmentFilter = departmentId ? { departmentId } : {};
    const candidateComplaints = await Complaint.find({
      ...departmentFilter,
      status: { $nin: ['resolved'] }
    })
      .populate('departmentId', 'name icon')
      .populate('citizenId', 'name email phone')
      .populate('officerId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    // Filter candidate complaints by geographic proximity or area match
    const borderComplaints = candidateComplaints.filter(c => {
      // If already assigned to this officer, exclude from border list to avoid duplication
      if (c.officerId && String(c.officerId._id || c.officerId) === String(req.userId)) {
        return false;
      }

      // Check text area match in address/area
      const addressMatch = (c.address && officerArea && c.address.toLowerCase().includes(officerArea.toLowerCase())) ||
        (c.area && officerArea && c.area.toLowerCase().includes(officerArea.toLowerCase()));

      // Check distance match
      const distance = getDistanceKm(officerLat, officerLng, c.latitude, c.longitude);
      const isWithinRadius = distance <= radiusKm;

      c.distanceKm = Number(distance.toFixed(1));
      return addressMatch || isWithinRadius;
    });

    res.json({
      complaints: assignedComplaints,
      borderComplaints,
      officerInfo: {
        district: officerDistrict,
        area: officerArea,
        radiusKm,
        department: officerProfile?.departmentId?.name || 'Assigned Department'
      }
    });
  } catch (error) {
    console.error('getOfficerComplaints error:', error);
    res.status(500).json({ error: 'Failed to fetch officer complaints' });
  }
}

export async function getOfficerStats(req, res) {
  try {
    const assigned = await Complaint.find({ officerId: req.userId }).lean();
    const officerProfile = await Officer.findOne({ userId: req.userId });
    const officerUser = await User.findById(req.userId);
    const departmentId = officerProfile?.departmentId || officerUser?.departmentId;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Count border unassigned issues
    const unassignedInDept = await Complaint.countDocuments({
      ...(departmentId ? { departmentId } : {}),
      status: { $in: ['submitted', 'ai_analyzed'] }
    });

    const stats = {
      total: assigned.length,
      assignedToday: assigned.filter(c => new Date(c.updatedAt) >= todayStart && c.status === 'assigned').length,
      pending: assigned.filter(c => ['assigned', 'officer_accepted'].includes(c.status)).length,
      inProgress: assigned.filter(c => c.status === 'in_progress').length,
      slaBreached: assigned.filter(c => c.slaDeadline && new Date(c.slaDeadline) < now && c.status !== 'resolved').length,
      resolved: assigned.filter(c => c.status === 'resolved').length,
      borderAvailable: unassignedInDept
    };

    res.json({ stats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
}

export async function claimComplaint(req, res) {
  try {
    const complaint = await Complaint.findOne({
      $or: [{ complaintId: req.params.id }, { _id: req.params.id }]
    });
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    complaint.officerId = req.userId;
    complaint.status = 'officer_accepted';
    await complaint.save();

    const userName = req.user?.name || 'Officer';

    await TimelineEvent.create({
      complaintId: complaint._id,
      status: 'officer_accepted',
      message: `Field Officer ${userName} accepted this issue from their patrol border`,
      createdBy: req.userId,
      createdByName: userName
    });

    const citizenUserId = complaint.citizenId?._id || complaint.citizenId;
    if (citizenUserId) {
      await Notification.create({
        userId: citizenUserId,
        complaintId: complaint._id,
        type: 'status_update',
        message: `${complaint.complaintId}: Field Officer ${userName} accepted your issue in their border area`
      });
    }

    res.json({ complaint, message: 'Issue claimed and accepted successfully!' });
  } catch (error) {
    console.error('claimComplaint error:', error);
    res.status(500).json({ error: error.message || 'Failed to claim complaint' });
  }
}

export async function updateComplaintStatus(req, res) {
  try {
    const complaint = await Complaint.findOne({
      $or: [{ complaintId: req.params.id }, { _id: req.params.id }]
    });

    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    // Auto-bind officer if not set
    if (!complaint.officerId) {
      complaint.officerId = req.userId;
    }

    const { status, message } = req.body;
    complaint.status = status;
    await complaint.save();

    const userName = req.user?.name || 'Officer';

    await TimelineEvent.create({
      complaintId: complaint._id,
      status,
      message: message || `Status updated to ${status.replace(/_/g, ' ')}`,
      createdBy: req.userId,
      createdByName: userName
    });

    const notifyStatuses = {
      'officer_accepted': 'An officer has accepted your complaint',
      'in_progress': 'Work has started on your complaint',
      'resolution_submitted': 'Resolution evidence uploaded for your complaint',
      'awaiting_verification': 'Your complaint needs verification — please check resolution',
      'resolved': 'Complaint marked resolved'
    };

    const citizenUserId = complaint.citizenId?._id || complaint.citizenId;
    if (notifyStatuses[status] && citizenUserId) {
      await Notification.create({
        userId: citizenUserId,
        complaintId: complaint._id,
        type: 'status_update',
        message: `${complaint.complaintId}: ${notifyStatuses[status]}`
      });
    }

    res.json({ complaint });
  } catch (error) {
    console.error('updateComplaintStatus error:', error);
    res.status(500).json({ error: error.message || 'Failed to update status' });
  }
}

export async function uploadOfficerEvidence(req, res) {
  try {
    const complaint = await Complaint.findOne({
      $or: [{ complaintId: req.params.id }, { _id: req.params.id }]
    });
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    const { stage, url } = req.body;
    const evidence = await Evidence.create({
      complaintId: complaint._id,
      type: 'image',
      url: url || (req.file ? `/uploads/${req.file.filename}` : '/demo/after-fixed.svg'),
      uploadedBy: req.userId,
      stage: stage || 'after'
    });

    const userName = req.user?.name || 'Officer';

    await TimelineEvent.create({
      complaintId: complaint._id,
      status: complaint.status,
      message: `${stage === 'before' ? 'Before' : 'After'} evidence uploaded by officer`,
      createdBy: req.userId,
      createdByName: userName,
      evidenceUrl: evidence.url
    });

    res.status(201).json({ evidence });
  } catch (error) {
    console.error('uploadOfficerEvidence error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload evidence' });
  }
}
