import { Router } from 'express';
import { verifyRecaptcha } from '../middlewares/recaptcha.js';
import * as Auth from '../controllers/auth.controller.js';

const router = Router();

router.post('/signup', verifyRecaptcha, Auth.signup);
router.post('/login', verifyRecaptcha, Auth.login);
router.post('/forgot', verifyRecaptcha, Auth.forgotPassword);
router.post('/reset/:token', Auth.resetPassword);

export default router;