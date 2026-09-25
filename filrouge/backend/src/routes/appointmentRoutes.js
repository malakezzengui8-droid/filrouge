import express from 'express';
import * as appointmentController from '../controllers/appointmentController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { confirmRules, validate } from '../validators/appointmentValidator.js';

const router = express.Router();

router.get('/me', protect, appointmentController.getMyAppointments);
router.put('/:id/confirm', protect, confirmRules, validate, appointmentController.confirmAppointment);
router.put('/:id/reject', protect, appointmentController.rejectAppointment);
router.put('/:id/cancel', protect, appointmentController.cancelAppointment);
router.put('/:id/complete', protect, appointmentController.completeAppointment);

export default router;
