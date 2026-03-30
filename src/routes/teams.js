const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { teamRules, handleValidationErrors } = require('../middleware/validation');
const teamService = require('../services/teamService');
const logger = require('../utils/logger');

/* GET all teams */
router.get('/teams', (req, res) => {
  try {
    const teams = teamService.getAll();
    res.render('teams/index', { teams });
  } catch (err) {
    logger.error({ err }, 'Error fetching teams');
    res.render('error', { message: 'Error loading teams', error: { status: 500 } });
  }
});

/* GET new team form for a hackathon */
router.get('/hackathons/:hackathonId/teams/new', auth.requireAuth, (req, res) => {
  try {
    const hackathon = teamService.getNewTeamForm(req.params.hackathonId);
    if (!hackathon) {
      return res.status(404).render('error', { message: 'Hackathon not found', error: { status: 404 } });
    }
    res.render('teams/new', { hackathon });
  } catch (err) {
    logger.error({ err }, 'Error loading new team form');
    res.render('error', { message: 'Error loading form', error: { status: 500 } });
  }
});

/* POST create team for a hackathon */
router.post('/hackathons/:hackathonId/teams', auth.requireAuth, teamRules, handleValidationErrors, (req, res) => {
  const { name, project_name, project_description, repo_url } = req.body;

  try {
    const result = teamService.create({
      name, hackathon_id: req.params.hackathonId, project_name, project_description, repo_url,
    });
    res.redirect('/teams/' + result.lastInsertRowid);
  } catch (err) {
    logger.error({ err }, 'Error creating team');
    res.render('error', { message: 'Error creating team', error: { status: 500 } });
  }
});

/* GET single team */
router.get('/teams/:id', (req, res) => {
  try {
    const data = teamService.getById(req.params.id);
    if (!data) {
      return res.status(404).render('error', { message: 'Team not found', error: { status: 404 } });
    }
    res.render('teams/show', data);
  } catch (err) {
    logger.error({ err }, 'Error fetching team');
    res.render('error', { message: 'Error loading team', error: { status: 500 } });
  }
});

module.exports = router;
