import express from 'express';
import * as requestController from '../controllers/requestController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { createRequestRules, updateStatusRules, validate } from '../validators/requestValidator.js';

const router = express.Router();

router.post('/', protect, createRequestRules, validate, requestController.publish);
router.get('/', protect, requestController.getAll);
router.get('/:id', protect, requestController.getOne);
router.get('/:id/compatible-donors', protect, requestController.getCompatibleDonors);
router.put('/:id/status', protect, updateStatusRules, validate, requestController.updateStatus);

export default router;