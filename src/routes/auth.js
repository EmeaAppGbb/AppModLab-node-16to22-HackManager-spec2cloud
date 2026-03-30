var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var database = require('../config/database');

/* GET login page */
router.get('/login', function(req, res) {
  res.render('auth/login', { error: req.query.error || null });
});

/* POST login */
router.post('/login', function(req, res) {
  const { username, password } = req.body;
  const db = database.getDb();

  try {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (!user) {
      return res.render('auth/login', { error: 'Invalid username or password' });
    }

    if (!bcrypt.compareSync(password, user.password)) {
      return res.render('auth/login', { error: 'Invalid username or password' });
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    res.redirect('/');
  } catch (err) {
    console.error('Login error:', err);
    res.render('auth/login', { error: 'An error occurred during login' });
  }
});

/* GET register page */
router.get('/register', function(req, res) {
  res.render('auth/register', { error: null });
});

/* POST register */
router.post('/register', function(req, res) {
  const { username, email, password, role } = req.body;
  const db = database.getDb();

  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const userRole = role || 'participant';

    db.prepare(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)'
    ).run(username, email, hashedPassword, userRole);

    res.redirect('/auth/login');
  } catch (err) {
    console.error('Registration error:', err);
    let errorMsg = 'An error occurred during registration';
    if (err.message && err.message.includes('UNIQUE constraint')) {
      errorMsg = 'Username or email already exists';
    }
    res.render('auth/register', { error: errorMsg });
  }
});

/* GET logout */
router.get('/logout', function(req, res) {
  req.session.destroy(function(err) {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/');
  });
});

module.exports = router;
