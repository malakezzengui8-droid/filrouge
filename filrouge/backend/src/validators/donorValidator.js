import { query, validationResult } from 'express-validator';

const filterRules = [
  query('city').optional().trim(),
  query('bloodType')
    .optional()
    .isIn(['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'])
    .withMessage('Invalid blood type')
];

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

export { filterRules, validate };