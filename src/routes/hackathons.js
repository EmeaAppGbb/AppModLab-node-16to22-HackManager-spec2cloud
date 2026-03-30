var express = require('express');
var router = express.Router();
var moment = require('moment');
var database = require('../config/database');
var auth = require('../middleware/auth');

/* GET all hackathons */
router.get('/hackathons', function(req, res) {
  const db = database.getDb();

  try {
    let hackathons = db.prepare('SELECT * FROM hackathons ORDER BY start_date DESC').all();

    hackathons = hackathons.map(function(h) {
      h.start_date_formatted = moment(h.start_date).format('MMM D, YYYY');
      h.end_date_formatted = moment(h.end_date).format('MMM D, YYYY');
      return h;
    });

    res.render('hackathons/index', { hackathons: hackathons });
  } catch (err) {
    console.error('Error fetching hackathons:', err);
    res.render('error', { message: 'Error loading hackathons', error: err });
  }
});

/* GET new hackathon form */
router.get('/hackathons/new', auth.requireAuth, function(req, res) {
  res.render('hackathons/new');
});

/* POST create hackathon */
router.post('/hackathons', auth.requireAuth, function(req, res) {
  const { name, description, start_date, end_date, location, max_teams, status } = req.body;
  const db = database.getDb();

  try {
    const result = db.prepare(
      'INSERT INTO hackathons (name, description, start_date, end_date, location, max_teams, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(name, description, start_date, end_date, location, max_teams || 10, status || 'upcoming', req.session.user.id);

    res.redirect('/hackathons/' + result.lastInsertRowid);
  } catch (err) {
    console.error('Error creating hackathon:', err);
    res.render('error', { message: 'Error creating hackathon', error: err });
  }
});

/* GET single hackathon */
router.get('/hackathons/:id', function(req, res) {
  const db = database.getDb();
  const id = req.params.id;

  try {
    let hackathon = db.prepare('SELECT * FROM hackathons WHERE id = ?').get(id);

    if (!hackathon) {
      return res.status(404).render('error', { message: 'Hackathon not found', error: { status: 404 } });
    }

    hackathon.start_date_formatted = moment(hackathon.start_date).format('MMM D, YYYY');
    hackathon.end_date_formatted = moment(hackathon.end_date).format('MMM D, YYYY');

    const teams = db.prepare('SELECT * FROM teams WHERE hackathon_id = ?').all(id);
    const submissions = db.prepare('SELECT * FROM submissions WHERE hackathon_id = ?').all(id);

    res.render('hackathons/show', {
      hackathon: hackathon,
      teams: teams,
      submissions: submissions
    });
  } catch (err) {
    console.error('Error fetching hackathon:', err);
    res.render('error', { message: 'Error loading hackathon', error: err });
  }
});

/* GET edit hackathon form */
router.get('/hackathons/:id/edit', auth.requireAuth, function(req, res) {
  const db = database.getDb();
  const id = req.params.id;

  try {
    const hackathon = db.prepare('SELECT * FROM hackathons WHERE id = ?').get(id);

    if (!hackathon) {
      return res.status(404).render('error', { message: 'Hackathon not found', error: { status: 404 } });
    }

    res.render('hackathons/edit', { hackathon: hackathon });
  } catch (err) {
    console.error('Error fetching hackathon for edit:', err);
    res.render('error', { message: 'Error loading hackathon', error: err });
  }
});

/* POST update hackathon */
router.post('/hackathons/:id/update', auth.requireAuth, function(req, res) {
  const { name, description, start_date, end_date, location, max_teams, status } = req.body;
  const db = database.getDb();
  const id = req.params.id;

  try {
    db.prepare(
      'UPDATE hackathons SET name = ?, description = ?, start_date = ?, end_date = ?, location = ?, max_teams = ?, status = ? WHERE id = ?'
    ).run(name, description, start_date, end_date, location, max_teams || 10, status || 'upcoming', id);

    res.redirect('/hackathons/' + id);
  } catch (err) {
    console.error('Error updating hackathon:', err);
    res.render('error', { message: 'Error updating hackathon', error: err });
  }
});

/* POST delete hackathon */
router.post('/hackathons/:id/delete', auth.requireAuth, function(req, res) {
  const db = database.getDb();
  const id = req.params.id;

  try {
    db.prepare('DELETE FROM hackathons WHERE id = ?').run(id);
    res.redirect('/hackathons');
  } catch (err) {
    console.error('Error deleting hackathon:', err);
    res.render('error', { message: 'Error deleting hackathon', error: err });
  }
});

module.exports = router;
