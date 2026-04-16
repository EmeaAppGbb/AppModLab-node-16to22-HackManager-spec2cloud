/**
 * Authentication middleware for hackathon app
 */

const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  next();
};

const requireJudge = (req, res, next) => {
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
};

export { requireAuth, requireJudge };
