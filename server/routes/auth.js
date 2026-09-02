import { Router } from 'express';
import { register, login, googleLogin, getMe, getDepartmentsPublic, updateProfile } from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfile);
router.get('/departments', getDepartmentsPublic);

export default router;
