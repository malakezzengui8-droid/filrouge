import { body, validationResult } from 'express-validator';

const BLOOD_TYPES = ['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'];
const STATUSES = ['ACTIVE', 'FULFILLED', 'CANCELLED'];

const createRequestRules = [
  body('bloodTypeNeeded').isIn(BLOOD_TYPES).withMessage('Invalid blood type'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('hospital').trim().notEmpty().withMessage('Hospital is required'),
  body('reason').optional().trim()
];

const updateStatusRules = [
  body('status').isIn(STATUSES).withMessage('Invalid status value')
];

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

export { createRequestRules, updateStatusRules, validate };