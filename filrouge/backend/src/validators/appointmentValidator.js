import { body, validationResult } from 'express-validator';

const confirmRules = [
  body('appointmentDate').isISO8601().withMessage('A valid appointment date is required'),
  body('location').optional().trim()
];

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

export { confirmRules, validate };