import { Router } from 'express';
import auth from '../middleware/auth.js';
import {
  createComplaint, getComplaints, getComplaintById, updateComplaint,
  getNearbyComplaints, getTimeline, addTimelineEvent, uploadEvidence,
  verifyResolution, submitFeedback, supportComplaint, getAllComplaintsPublic
} from '../controllers/complaintController.js';

const router = Router();

router.get('/public', getAllComplaintsPublic);
router.get('/nearby', auth, getNearbyComplaints);
router.post('/', auth, createComplaint);
router.get('/', auth, getComplaints);
router.get('/:id', auth, getComplaintById);
router.put('/:id', auth, updateComplaint);
router.get('/:id/timeline', auth, getTimeline);
router.post('/:id/timeline', auth, addTimelineEvent);
router.post('/:id/evidence', auth, uploadEvidence);
router.post('/:id/verify', auth, verifyResolution);
router.post('/:id/feedback', auth, submitFeedback);
router.post('/:id/support', auth, supportComplaint);

export default router;
