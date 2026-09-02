import { Router } from 'express';
import auth from '../middleware/auth.js';
import { getNotifications, markRead, markAllRead } from '../controllers/notificationController.js';

const router = Router();
router.use(auth);

router.get('/', getNotifications);
router.put('/:id/read', markRead);
router.put('/read-all', markAllRead);

export default router;
