require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { doubleCsrf } = require('csrf-csrf');
const rateLimit = require('express-rate-limit');
const SqliteStore = require('better-sqlite3-session-store')(session);
const logger = require('./utils/logger');

// Fail fast if session secret missing in production
if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
  logger.error('FATAL: SESSION_SECRET environment variable is required in production');
  process.exit(1);
}

// Initialize database
const database = require('./config/database');
database.initDatabase();

const app = express();
const port = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';
const isTestRunner = !!process.env.VITEST;

// Security headers via helmet (sec-003)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", 'https://cdn.jsdelivr.net', "'unsafe-inline'"],
      scriptSrc: ["'self'", 'https://cdn.jsdelivr.net'],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'", 'https://cdn.jsdelivr.net'],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  hsts: isProduction ? { maxAge: 31536000, includeSubDomains: true } : false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

// HTTPS enforcement in production (sec-013)
if (isProduction) {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(301, `https://${req.header('host')}${req.url}`);
    }
    next();
  });
}

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parser middleware (Express built-in)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Session middleware with persistent SQLite store (sec-002: hardened cookies)
const sessionDb = database.getDb();
app.use(session({
  store: new SqliteStore({ client: sessionDb, expired: { clear: true, intervalMs: 900000 } }),
  secret: process.env.SESSION_SECRET || 'hackathon-dev-fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
  },
}));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Make session user available to all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// CSRF protection (double-submit cookie pattern) (sec-002: hardened CSRF cookie)
app.use(cookieParser(process.env.SESSION_SECRET || 'hackathon-dev-fallback-secret'));
const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.SESSION_SECRET || 'hackathon-dev-fallback-secret',
  getSessionIdentifier: (req) => req.session?.id || '',
  cookieName: '_csrf',
  cookieOptions: { sameSite: 'strict', secure: isProduction, httpOnly: true },
  getTokenFromRequest: (req) => req.body._csrf || req.headers['x-csrf-token'],
});

// Make CSRF token available to all views
app.use((req, res, next) => {
  res.locals.csrfToken = generateCsrfToken(req, res);
  next();
});

// Apply CSRF protection (sec-006: use VITEST flag, not NODE_ENV)
if (!isTestRunner) {
  app.use(doubleCsrfProtection);
}

// Rate limiting (sec-009: expanded to cover write endpoints)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTestRunner,
});
const authLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts. Please try again in 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTestRunner,
});
const authRegisterLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many registration attempts. Please try again in 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTestRunner,
});
const writeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: 'Too many requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTestRunner,
});

// Apply general rate limit
app.use(generalLimiter);

// Mount routes
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const hackathonRoutes = require('./routes/hackathons');
const teamRoutes = require('./routes/teams');
const participantRoutes = require('./routes/participants');
const submissionRoutes = require('./routes/submissions');
const judgingRoutes = require('./routes/judging');

app.use('/', indexRoutes);
app.use('/auth/login', authLoginLimiter);
app.use('/auth/register', authRegisterLimiter);
app.use('/auth', authRoutes);
app.use('/', hackathonRoutes);
app.use('/', teamRoutes);
app.use('/', participantRoutes);
app.use('/hackathons', writeLimiter);
app.use('/', submissionRoutes);
app.use('/', judgingRoutes);

// 404 handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handling middleware (sec-008: sanitize error responses)
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).render('error', {
      message: 'Invalid or missing CSRF token. Please go back and try again.',
      error: { status: 403 },
    });
  }
  const status = err.status || 500;
  res.status(status);
  res.render('error', {
    message: isProduction && status === 500 ? 'An unexpected error occurred.' : err.message,
    error: { status },
  });
});

if (require.main === module) {
  app.listen(port, () => {
    logger.info('Server running on port ' + port);
  });
}

module.exports = app;
