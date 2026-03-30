const { body, validationResult } = require('express-validator');

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    req.flash_errors = messages;
    return res.status(400).render('error', {
      message: messages.join(', '),
      error: { status: 400 },
    });
  }
  next();
}

const loginRules = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const registerRules = [
  body('username').trim().notEmpty().withMessage('Username is required').isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/\d/).withMessage('Password must contain a number'),
  body('confirm_password')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
];

const hackathonRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 200 }).withMessage('Name too long'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('start_date').isISO8601().withMessage('Valid start date is required'),
  body('end_date').isISO8601().withMessage('Valid end date is required'),
  body('location').trim().optional(),
  body('max_teams').optional().isInt({ min: 1 }).withMessage('Max teams must be a positive number').toInt(),
  body('status').optional().isIn(['upcoming', 'active', 'completed']).withMessage('Invalid status'),
];

const teamRules = [
  body('name').trim().notEmpty().withMessage('Team name is required').isLength({ max: 200 }).withMessage('Name too long'),
  body('project_name').trim().optional(),
  body('project_description').trim().optional(),
  body('repo_url').trim().optional().isURL().withMessage('Invalid repository URL'),
];

const submissionRules = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }).withMessage('Title too long'),
  body('description').trim().optional(),
  body('demo_url').trim().optional().isURL().withMessage('Invalid demo URL'),
  body('repo_url').trim().optional().isURL().withMessage('Invalid repository URL'),
  body('team_id').notEmpty().withMessage('Team is required').isInt().withMessage('Invalid team'),
];

const scoreRules = [
  body('innovation').isInt({ min: 0, max: 10 }).withMessage('Innovation score must be 0-10').toInt(),
  body('technical').isInt({ min: 0, max: 10 }).withMessage('Technical score must be 0-10').toInt(),
  body('presentation').isInt({ min: 0, max: 10 }).withMessage('Presentation score must be 0-10').toInt(),
  body('impact').isInt({ min: 0, max: 10 }).withMessage('Impact score must be 0-10').toInt(),
  body('comments').trim().optional(),
];

module.exports = {
  handleValidationErrors,
  loginRules,
  registerRules,
  hackathonRules,
  teamRules,
  submissionRules,
  scoreRules,
};
