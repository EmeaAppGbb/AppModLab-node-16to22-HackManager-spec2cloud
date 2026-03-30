const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { hackathonRules, handleValidationErrors } = require('../middleware/validation');
const hackathonService = require('../services/hackathonService');
const { hackathonRepo } = require('../repositories');
const logger = require('../utils/logger');

/* GET all hackathons */
router.get('/hackathons', (req, res) => {
  try {
    const hackathons = hackathonService.getAll();
    res.render('hackathons/index', { hackathons });
  } catch (err) {
    logger.error({ err }, 'Error fetching hackathons');
    res.render('error', { message: 'Error loading hackathons', error: err });
  }
});

/* GET new hackathon form */
router.get('/hackathons/new', auth.requireAuth, (req, res) => {
  res.render('hackathons/new');
});

/* POST create hackathon */
router.post('/hackathons', auth.requireAuth, hackathonRules, handleValidationErrors, (req, res) => {
  const { name, description, start_date, end_date, location, max_teams, status } = req.body;

  try {
    const result = hackathonService.create({
      name, description, start_date, end_date, location, max_teams, status, created_by: req.session.user.id,
    });
    res.redirect('/hackathons/' + result.lastInsertRowid);
  } catch (err) {
    logger.error({ err }, 'Error creating hackathon');
    res.render('error', { message: 'Error creating hackathon', error: err });
  }
});

/* GET single hackathon */
router.get('/hackathons/:id', (req, res) => {
  try {
    const data = hackathonService.getById(req.params.id);
    if (!data) {
      return res.status(404).render('error', { message: 'Hackathon not found', error: { status: 404 } });
    }
    res.render('hackathons/show', data);
  } catch (err) {
    logger.error({ err }, 'Error fetching hackathon');
    res.render('error', { message: 'Error loading hackathon', error: err });
  }
});

const hackathonOwnerCheck = auth.requireOwnerOrAdmin('SELECT created_by FROM hackathons WHERE id = ?');

/* GET edit hackathon form */
router.get('/hackathons/:id/edit', auth.requireAuth, hackathonOwnerCheck, (req, res) => {
  try {
    const hackathon = hackathonRepo.findById(req.params.id);
    if (!hackathon) {
      return res.status(404).render('error', { message: 'Hackathon not found', error: { status: 404 } });
    }
    res.render('hackathons/edit', { hackathon });
  } catch (err) {
    logger.error({ err }, 'Error fetching hackathon for edit');
    res.render('error', { message: 'Error loading hackathon', error: err });
  }
});

/* POST update hackathon */
router.post('/hackathons/:id/update', auth.requireAuth, hackathonOwnerCheck, hackathonRules, handleValidationErrors, (req, res) => {
  const { name, description, start_date, end_date, location, max_teams, status } = req.body;

  try {
    hackathonService.update(req.params.id, { name, description, start_date, end_date, location, max_teams, status });
    res.redirect('/hackathons/' + req.params.id);
  } catch (err) {
    logger.error({ err }, 'Error updating hackathon');
    res.render('error', { message: 'Error updating hackathon', error: err });
  }
});

/* POST delete hackathon */
router.post('/hackathons/:id/delete', auth.requireAuth, hackathonOwnerCheck, (req, res) => {
  try {
    hackathonService.delete(req.params.id);
    res.redirect('/hackathons');
  } catch (err) {
    logger.error({ err }, 'Error deleting hackathon');
    res.render('error', { message: 'Error deleting hackathon', error: err });
  }
});

module.exports = router;
