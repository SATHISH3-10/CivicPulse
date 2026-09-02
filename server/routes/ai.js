import { Router } from 'express';
import auth from '../middleware/auth.js';
import { analyze, checkDuplicates } from '../controllers/aiController.js';

const router = Router();
router.post('/analyze', auth, analyze);
router.post('/detect-duplicate', auth, checkDuplicates);

export default router;
