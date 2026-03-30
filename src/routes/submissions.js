const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { submissionRules, handleValidationErrors } = require('../middleware/validation');
const submissionService = require('../services/submissionService');
const logger = require('../utils/logger');

/* GET all submissions */
router.get('/submissions', (req, res) => {
  try {
    const submissions = submissionService.getAll();
    res.render('submissions/index', { submissions });
  } catch (err) {
    logger.error({ err }, 'Error fetching submissions');
    res.render('error', { message: 'Error loading submissions', error: { status: 500 } });
  }
});

/* GET new submission form */
router.get('/hackathons/:hackathonId/submissions/new', auth.requireAuth, (req, res) => {
  try {
    const data = submissionService.getNewForm(req.params.hackathonId);
    if (!data) {
      return res.status(404).render('error', { message: 'Hackathon not found', error: { status: 404 } });
    }
    res.render('submissions/new', data);
  } catch (err) {
    logger.error({ err }, 'Error loading submission form');
    res.render('error', { message: 'Error loading form', error: { status: 500 } });
  }
});

/* POST create submission */
router.post('/hackathons/:hackathonId/submissions', auth.requireAuth, submissionRules, handleValidationErrors, (req, res) => {
  const { title, description, demo_url, repo_url, team_id } = req.body;

  try {
    // sec-005: Verify user is a member of the team (admin bypass)
    if (req.session.user.role !== 'admin') {
      const { participantRepo } = require('../repositories');
      const membership = participantRepo.findByUserAndTeam(req.session.user.id, team_id);
      if (!membership) {
        return res.status(403).render('error', {
          message: 'You can only submit for teams you are a member of',
          error: { status: 403 },
        });
      }
    }

    const result = submissionService.create({
      team_id, hackathon_id: req.params.hackathonId, title, description, demo_url, repo_url,
    });
    res.redirect('/submissions/' + result.lastInsertRowid);
  } catch (err) {
    logger.error({ err }, 'Error creating submission');
    res.render('error', { message: 'Error creating submission', error: { status: 500 } });
  }
});

/* GET single submission */
router.get('/submissions/:id', (req, res) => {
  try {
    const data = submissionService.getById(req.params.id);
    if (!data) {
      return res.status(404).render('error', { message: 'Submission not found', error: { status: 404 } });
    }
    res.render('submissions/show', data);
  } catch (err) {
    logger.error({ err }, 'Error fetching submission');
    res.render('error', { message: 'Error loading submission', error: { status: 500 } });
  }
});

module.exports = router;
