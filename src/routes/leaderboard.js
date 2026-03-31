const express = require('express');
const router = express.Router();
const leaderboardService = require('../services/leaderboardService');
const { hackathonRepo } = require('../repositories');
const logger = require('../utils/logger');

/* GET leaderboard page */
router.get('/leaderboard', (req, res) => {
  try {
    const hackathonId = req.query.hackathon_id ? parseInt(req.query.hackathon_id, 10) : null;

    if (hackathonId) {
      const hackathon = hackathonRepo.findById(hackathonId);
      if (!hackathon) {
        return res.status(404).render('error', { message: 'Hackathon not found', error: { status: 404 } });
      }
    }

    const entries = leaderboardService.getLeaderboard(hackathonId);
    const hackathons = leaderboardService.getHackathons();

    res.render('leaderboard/index', {
      entries,
      hackathons,
      selectedHackathonId: hackathonId,
    });
  } catch (err) {
    logger.error({ err }, 'Error loading leaderboard');
    res.render('error', { message: 'Error loading leaderboard', error: { status: 500 } });
  }
});

module.exports = router;
