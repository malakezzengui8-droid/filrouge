import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import { updateStatusRules, validate } from '../validators/requestValidator.js';

const router = express.Router();

// Every route here requires: 1) a valid token, 2) the ADMIN role
router.get('/users', protect, authorize('ADMIN'), adminController.getAllUsers);
router.get('/users/:id', protect, authorize('ADMIN'), adminController.getUser);
router.put('/users/:id', protect, authorize('ADMIN'), adminController.updateUser);
router.delete('/users/:id', protect, authorize('ADMIN'), adminController.deleteUser);

router.get('/requests', protect, authorize('ADMIN'), adminController.getAllRequests);
router.put('/requests/:id/status', protect, authorize('ADMIN'), updateStatusRules, validate, adminController.updateRequestStatus);

router.get('/statistics', protect, authorize('ADMIN'), adminController.getStatistics);

export default router;