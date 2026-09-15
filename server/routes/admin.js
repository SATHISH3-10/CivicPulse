import { Router } from 'express';
import auth from '../middleware/auth.js';
import roleGuard from '../middleware/roleGuard.js';
import { getAnalytics, getHotspots, getDepartments, getAllComplaints, assignComplaint, getOfficers, getUsers, updateUserPermit } from '../controllers/adminController.js';
import { getAdminFeedback, updateInquiryStatus, replyToInquiry } from '../controllers/feedbackController.js';

const router = Router();
router.use(auth, roleGuard('admin'));

router.get('/analytics', getAnalytics);
router.get('/hotspots', getHotspots);
router.get('/departments', getDepartments);
router.get('/complaints', getAllComplaints);
router.put('/complaints/:id/assign', assignComplaint);
router.get('/officers', getOfficers);
router.get('/users', getUsers);
router.put('/users/:userId/permit', updateUserPermit);

// Admin Feedback & Inquiries
router.get('/feedback', getAdminFeedback);
router.put('/feedback/:id/status', updateInquiryStatus);
router.post('/feedback/:id/reply', replyToInquiry);

export default router;

