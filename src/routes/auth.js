const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { loginRules, registerRules, handleValidationErrors } = require('../middleware/validation');
const logger = require('../utils/logger');

/* GET login page */
router.get('/login', (req, res) => {
  res.render('auth/login', { error: req.query.error || null });
});

/* POST login */
router.post('/login', loginRules, handleValidationErrors, async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await authService.authenticate(username, password);
    if (!user) {
      return res.render('auth/login', { error: 'Invalid username or password' });
    }
    req.session.user = user;
    res.redirect('/');
  } catch (err) {
    logger.error({ err }, 'Login error');
    res.render('auth/login', { error: 'An error occurred during login' });
  }
});

/* GET register page */
router.get('/register', (req, res) => {
  res.render('auth/register', { error: null });
});

/* POST register */
router.post('/register', registerRules, handleValidationErrors, async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    await authService.register(username, email, password, role);
    res.redirect('/auth/login');
  } catch (err) {
    logger.error({ err }, 'Registration error');
    const errorMsg =
      err.message && err.message.includes('UNIQUE constraint')
        ? 'Username or email already exists'
        : 'An error occurred during registration';
    res.render('auth/register', { error: errorMsg });
  }
});

/* GET logout */
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      logger.error({ err }, 'Logout error');
    }
    res.redirect('/');
  });
});

module.exports = router;
