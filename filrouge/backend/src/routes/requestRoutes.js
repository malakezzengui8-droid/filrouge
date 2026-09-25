import express from 'express';
import * as requestController from '../controllers/requestController.js';
import * as appointmentController from '../controllers/appointmentController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { createRequestRules, updateStatusRules, validate } from '../validators/requestValidator.js';

const router = express.Router();

router.post('/', protect, createRequestRules, validate, requestController.publish);
router.get('/', protect, requestController.getAll);
router.get('/me', protect, requestController.getMine);
router.get('/:id', protect, requestController.getOne);
router.get('/:id/compatible-donors', protect, requestController.getCompatibleDonors);
router.put('/:id/status', protect, updateStatusRules, validate, requestController.updateStatus);

// Appointments nested under a specific request
router.post('/:id/appointments', protect, appointmentController.createAppointment);
router.get('/:id/appointments', protect, appointmentController.getRequestAppointments);
router.post('/:id/invite', protect, appointmentController.inviteDonor);

export default router;