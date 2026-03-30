/**
 * Authentication middleware for hackathon app
 */

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  next();
}

function requireJudge(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  if (req.session.user.role !== 'judge' && req.session.user.role !== 'admin') {
    return res.status(403).render('error', {
      message: 'Access denied. Judge or admin role required.',
      error: { status: 403 }
    });
  }
  next();
}

const ownerQueries = {
  hackathon: 'SELECT created_by FROM hackathons WHERE id = ?',
};

function requireOwnerOrAdmin(resourceType) {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.redirect('/auth/login');
    }
    if (req.session.user.role === 'admin') {
      return next();
    }
    const query = ownerQueries[resourceType];
    if (!query) {
      return res.status(500).render('error', {
        message: 'Server configuration error',
        error: { status: 500 },
      });
    }
    const database = require('../config/database');
    const db = database.getDb();
    const id = req.params.id;
    const resource = db.prepare(query).get(id);
    if (!resource) {
      return res.status(404).render('error', {
        message: 'Resource not found',
        error: { status: 404 },
      });
    }
    if (resource.created_by !== req.session.user.id) {
      return res.status(403).render('error', {
        message: 'Access denied. You can only modify resources you created.',
        error: { status: 403 },
      });
    }
    next();
  };
}

module.exports = {
  requireAuth,
  requireJudge,
  requireOwnerOrAdmin,
};
