import express from 'express';
import * as donorController from '../controllers/donorController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { filterRules, validate } from '../validators/donorValidator.js';

const router = express.Router();

router.get('/', protect, filterRules, validate, donorController.getDonors);

export default router;