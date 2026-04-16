import express from 'express';
import bcrypt from 'bcryptjs';
import * as database from '../config/database.js';

const router = express.Router();

/* GET login page */
router.get('/login', (req, res) => {
  res.render('auth/login', { error: req.query.error || null });
});

/* POST login */
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const db = database.getDb();

  try {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (!user || !bcrypt.compareSync(password, user.password)) {
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
router.get('/register', (req, res) => {
  res.render('auth/register', { error: null });
});

/* POST register */
router.post('/register', (req, res) => {
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
    const errorMsg = err.message?.includes('UNIQUE constraint')
      ? 'Username or email already exists'
      : 'An error occurred during registration';
    res.render('auth/register', { error: errorMsg });
  }
});

/* GET logout */
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Logout error:', err);
    res.redirect('/');
  });
});

export default router;
