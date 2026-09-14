import { Router } from 'express';
import {
  register,
  login,
  googleLogin,
  getMe,
  getDepartmentsPublic,
  updateProfile,
  completeProfile,
  setPassword,
  changePassword,
  requestForgotPasswordOTP,
  verifyForgotPasswordOTP,
  requestContactOTP,
  verifyContactOTP
} from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfile);
router.post('/complete-profile', auth, completeProfile);
router.post('/set-password', auth, setPassword);
router.post('/change-password', auth, changePassword);
router.post('/forgot-password/request-otp', requestForgotPasswordOTP);
router.post('/forgot-password/verify-otp', verifyForgotPasswordOTP);
router.post('/request-contact-otp', auth, requestContactOTP);
router.post('/verify-contact-otp', auth, verifyContactOTP);
router.get('/departments', getDepartmentsPublic);

export default router;
