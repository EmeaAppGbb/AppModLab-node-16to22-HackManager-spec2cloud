import express from 'express';
import path from 'path';
import session from 'express-session';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize database (async with sql.js)
import * as database from './config/database.js';

import indexRoutes from './routes/index.js';
import authRoutes from './routes/auth.js';
import hackathonRoutes from './routes/hackathons.js';
import teamRoutes from './routes/teams.js';
import participantRoutes from './routes/participants.js';
import submissionRoutes from './routes/submissions.js';
import judgingRoutes from './routes/judging.js';

database.initDatabase().then(function() {
  const app = express();
  const port = process.env.PORT || 3000;

  // View engine setup
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));

  // Body parser middleware (use Express built-in instead of deprecated body-parser)
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  // Session middleware
  // TODO: use a proper session store for production (connect-redis, etc.)
  app.use(session({
    secret: 'hackathon-secret-key-2023',
    resave: false,
    saveUninitialized: false
  }));

  // Static files
  app.use(express.static(path.join(__dirname, 'public')));

  // Make session user available to all views
  app.use(function(req, res, next) {
    res.locals.user = req.session.user || null;
    next();
  });

  // TODO: add CSRF protection middleware
  // TODO: add request logging middleware (morgan)

  // Mount routes
  app.use('/', indexRoutes);
  app.use('/auth', authRoutes);
  app.use('/', hackathonRoutes);
  app.use('/', teamRoutes);
  app.use('/', participantRoutes);
  app.use('/', submissionRoutes);
  app.use('/', judgingRoutes);

  // 404 handler
  app.use(function(req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // Error handling middleware
  // TODO: improve error handling for production
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: app.get('env') === 'development' ? err : {}
    });
  });

  app.listen(port, function() {
    console.log('Server running on port ' + port);
  });
}).catch(function(err) {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
