/**
 * Authentication middleware for hackathon app
 * TODO: add rate limiting for login attempts
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

module.exports = {
  requireAuth: requireAuth,
  requireJudge: requireJudge
};
