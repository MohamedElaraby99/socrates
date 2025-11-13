import { Router } from "express";

const router = Router();
import { register, login, logout, refreshToken, getProfile, forgotPassword, resetPassword, changePassword, updateUser, getAllUsers } from '../controllers/user.controller.js';
import { requireCaptchaVerification } from '../controllers/captcha.controller.js';
import { isLoggedIn } from "../middleware/auth.middleware.js";
import upload from '../middleware/multer.middleware.js';
import { requireDeviceFingerprint, logDeviceFingerprint } from '../middleware/deviceFingerprint.middleware.js';

router.post('/register', upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'idPhoto', maxCount: 1 }]), requireCaptchaVerification, logDeviceFingerprint, requireDeviceFingerprint, register);
router.post('/login', logDeviceFingerprint, requireDeviceFingerprint, login);
router.get('/logout', logout);
router.post('/refresh-token', refreshToken);
router.get('/me', isLoggedIn, getProfile);
router.get('/', isLoggedIn, getAllUsers);
router.post('/reset', forgotPassword);
router.post('/reset/:resetToken', resetPassword);
router.post('/change-password', isLoggedIn, changePassword);
router.post('/update/:id', isLoggedIn, upload.single("avatar"), updateUser);

export default router;