const { body, param } = require('express-validator');

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

const projectCreateRules = [
  body('title').trim().notEmpty(),
  body('description').optional().isString(),
  body('deadline').optional().isISO8601().toDate(),
  body('status')
    .optional()
    .isIn(['planning', 'active', 'completed', 'on_hold']),
  body('members').optional().isArray(),
];

const projectUpdateRules = [
  body('title').optional().trim().notEmpty(),
  body('description').optional().isString(),
  body('deadline').optional().isISO8601().toDate(),
  body('status')
    .optional()
    .isIn(['planning', 'active', 'completed', 'on_hold']),
  body('members').optional().isArray(),
];

const taskCreateRules = [
  body('title').trim().notEmpty(),
  body('description').optional().isString(),
  body('assignedTo').isMongoId(),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed']),
  body('dueDate').optional().isISO8601().toDate(),
];

const taskUpdateRules = [
  body('title').optional().trim().notEmpty(),
  body('description').optional().isString(),
  body('assignedTo').optional().isMongoId(),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed']),
  body('dueDate').optional().isISO8601().toDate(),
];

const mongoIdParam = (name = 'id') => [param(name).isMongoId()];

const validate = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors
        .array()
        .map((e) => e.msg)
        .join(', '),
      errors: errors.array(),
    });
  }
  next();
};

module.exports = {
  registerRules,
  loginRules,
  projectCreateRules,
  projectUpdateRules,
  taskCreateRules,
  taskUpdateRules,
  mongoIdParam,
  validate,
};
