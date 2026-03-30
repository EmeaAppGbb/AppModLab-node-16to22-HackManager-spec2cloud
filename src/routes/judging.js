const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { scoreRules, handleValidationErrors } = require('../middleware/validation');
const judgingService = require('../services/judgingService');
const logger = require('../utils/logger');

/* GET judging dashboard - list submissions to judge */
router.get('/judging', auth.requireAuth, (req, res) => {
  try {
    const submissions = judgingService.getSubmissions();
    res.render('judging/index', { submissions });
  } catch (err) {
    logger.error({ err }, 'Error fetching judging list');
    res.render('error', { message: 'Error loading judging page', error: { status: 500 } });
  }
});

/* GET score form for a submission */
router.get('/submissions/:id/judge', auth.requireJudge, (req, res) => {
  try {
    const submission = judgingService.getSubmissionForScoring(req.params.id);
    if (!submission) {
      return res.status(404).render('error', { message: 'Submission not found', error: { status: 404 } });
    }
    res.render('judging/score', { submission });
  } catch (err) {
    logger.error({ err }, 'Error loading judge form');
    res.render('error', { message: 'Error loading scoring form', error: { status: 500 } });
  }
});

/* POST score a submission */
router.post('/submissions/:id/score', auth.requireJudge, scoreRules, handleValidationErrors, (req, res) => {
  const { innovation, technical, presentation, impact, comments } = req.body;

  try {
    const result = judgingService.scoreSubmission(req.params.id, req.session.user.id, {
      innovation, technical, presentation, impact, comments,
    });
    if (!result) {
      return res.status(404).render('error', { message: 'Submission not found', error: { status: 404 } });
    }
    res.redirect('/judging');
  } catch (err) {
    logger.error({ err }, 'Error scoring submission');
    res.render('error', { message: 'Error saving score', error: { status: 500 } });
  }
});

module.exports = router;
