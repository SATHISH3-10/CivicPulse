import { Router } from 'express';
import { submitContactInquiry } from '../controllers/feedbackController.js';

const router = Router();

// Public route to submit contact inquiry / feedback
router.post('/submit', submitContactInquiry);

export default router;
