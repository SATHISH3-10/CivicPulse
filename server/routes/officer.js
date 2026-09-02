import { Router } from 'express';
import auth from '../middleware/auth.js';
import roleGuard from '../middleware/roleGuard.js';
import {
  getOfficerComplaints,
  getOfficerStats,
  updateComplaintStatus,
  uploadOfficerEvidence,
  claimComplaint
} from '../controllers/officerController.js';

const router = Router();
router.use(auth, roleGuard('officer'));

router.get('/complaints', getOfficerComplaints);
router.get('/stats', getOfficerStats);
router.put('/complaints/:id/status', updateComplaintStatus);
router.put('/complaints/:id/claim', claimComplaint);
router.post('/complaints/:id/evidence', uploadOfficerEvidence);

export default router;
