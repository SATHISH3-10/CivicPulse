import Complaint from '../models/Complaint.js';
import { analyzeComplaint, detectDuplicates } from '../services/aiEngine.js';

export async function analyze(req, res) {
  try {
    const { title, description, category, severity, latitude, longitude } = req.body;
    const nearbyComplaints = await Complaint.find({
      latitude: { $gte: latitude - 0.05, $lte: latitude + 0.05 },
      longitude: { $gte: longitude - 0.05, $lte: longitude + 0.05 }
    }).lean();

    const analysis = analyzeComplaint(title, description, category, severity || 'medium', latitude, longitude, nearbyComplaints);
    res.json({ analysis });
  } catch (error) {
    res.status(500).json({ error: 'AI analysis failed' });
  }
}

export async function checkDuplicates(req, res) {
  try {
    const { title, description, category, latitude, longitude } = req.body;
    const nearbyComplaints = await Complaint.find({
      latitude: { $gte: latitude - 0.05, $lte: latitude + 0.05 },
      longitude: { $gte: longitude - 0.05, $lte: longitude + 0.05 }
    }).lean();

    const duplicates = detectDuplicates({ title, description, category, latitude, longitude }, nearbyComplaints);
    res.json({ duplicates });
  } catch (error) {
    res.status(500).json({ error: 'Duplicate detection failed' });
  }
}
