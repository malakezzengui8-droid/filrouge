import express from 'express';
import * as authController from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { registerRules, loginRules, validate } from '../validators/authValidator.js';

const router = express.Router();

// Public routes
router.post('/register', registerRules, validate, authController.register);
router.post('/login', loginRules, validate, authController.login);

// Protected routes (need a valid JWT)
router.get('/me', protect, authController.getMe);
router.get('/eligibility', protect, authController.getEligibility);
router.put('/me', protect, authController.updateMe);
router.delete('/me', protect, authController.deleteMe);

export default router;