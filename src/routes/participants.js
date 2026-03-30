const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const participantService = require('../services/participantService');
const logger = require('../utils/logger');

/* GET all participants */
router.get('/participants', (req, res) => {
  try {
    const participants = participantService.getAll();
    res.render('participants/index', { participants });
  } catch (err) {
    logger.error({ err }, 'Error fetching participants');
    res.render('error', { message: 'Error loading participants', error: err });
  }
});

/* POST join a hackathon */
router.post('/hackathons/:hackathonId/participants/join', auth.requireAuth, (req, res) => {
  try {
    participantService.join(req.session.user.id, req.body.team_id || null, req.params.hackathonId);
    res.redirect('/hackathons/' + req.params.hackathonId);
  } catch (err) {
    logger.error({ err }, 'Error joining hackathon');
    res.render('error', { message: 'Error joining hackathon', error: err });
  }
});

module.exports = router;
