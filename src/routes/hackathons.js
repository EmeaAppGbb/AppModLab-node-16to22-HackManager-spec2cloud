import express from 'express';
import * as database from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Native date formatting to replace moment.js
const formatDate = (dateStr) => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/* GET all hackathons */
router.get('/hackathons', (req, res) => {
  const db = database.getDb();

  try {
    let hackathons = db.prepare('SELECT * FROM hackathons ORDER BY start_date DESC').all();

    hackathons = hackathons.map((h) => {
      h.start_date_formatted = formatDate(h.start_date);
      h.end_date_formatted = formatDate(h.end_date);
      return h;
    });

    res.render('hackathons/index', { hackathons });
  } catch (err) {
    console.error('Error fetching hackathons:', err);
    res.render('error', { message: 'Error loading hackathons', error: err });
  }
});

/* GET new hackathon form */
router.get('/hackathons/new', requireAuth, (req, res) => {
  res.render('hackathons/new');
});

/* POST create hackathon */
router.post('/hackathons', requireAuth, (req, res) => {
  const { name, description, start_date, end_date, location, max_teams, status } = req.body;
  const db = database.getDb();

  try {
    const result = db.prepare(
      'INSERT INTO hackathons (name, description, start_date, end_date, location, max_teams, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(name, description, start_date, end_date, location, max_teams || 10, status || 'upcoming', req.session.user.id);

    res.redirect(`/hackathons/${result.lastInsertRowid}`);
  } catch (err) {
    console.error('Error creating hackathon:', err);
    res.render('error', { message: 'Error creating hackathon', error: err });
  }
});

/* GET single hackathon */
router.get('/hackathons/:id', (req, res) => {
  const db = database.getDb();
  const { id } = req.params;

  try {
    const hackathon = db.prepare('SELECT * FROM hackathons WHERE id = ?').get(id);

    if (!hackathon) {
      return res.status(404).render('error', { message: 'Hackathon not found', error: { status: 404 } });
    }

    hackathon.start_date_formatted = formatDate(hackathon.start_date);
    hackathon.end_date_formatted = formatDate(hackathon.end_date);

    const teams = db.prepare('SELECT * FROM teams WHERE hackathon_id = ?').all(id);
    const submissions = db.prepare('SELECT * FROM submissions WHERE hackathon_id = ?').all(id);

    res.render('hackathons/show', { hackathon, teams, submissions });
  } catch (err) {
    console.error('Error fetching hackathon:', err);
    res.render('error', { message: 'Error loading hackathon', error: err });
  }
});

/* GET edit hackathon form */
router.get('/hackathons/:id/edit', requireAuth, (req, res) => {
  const db = database.getDb();
  const { id } = req.params;

  try {
    const hackathon = db.prepare('SELECT * FROM hackathons WHERE id = ?').get(id);

    if (!hackathon) {
      return res.status(404).render('error', { message: 'Hackathon not found', error: { status: 404 } });
    }

    res.render('hackathons/edit', { hackathon });
  } catch (err) {
    console.error('Error fetching hackathon for edit:', err);
    res.render('error', { message: 'Error loading hackathon', error: err });
  }
});

/* POST update hackathon */
router.post('/hackathons/:id/update', requireAuth, (req, res) => {
  const { name, description, start_date, end_date, location, max_teams, status } = req.body;
  const db = database.getDb();
  const { id } = req.params;

  try {
    db.prepare(
      'UPDATE hackathons SET name = ?, description = ?, start_date = ?, end_date = ?, location = ?, max_teams = ?, status = ? WHERE id = ?'
    ).run(name, description, start_date, end_date, location, max_teams || 10, status || 'upcoming', id);

    res.redirect(`/hackathons/${id}`);
  } catch (err) {
    console.error('Error updating hackathon:', err);
    res.render('error', { message: 'Error updating hackathon', error: err });
  }
});

/* POST delete hackathon */
router.post('/hackathons/:id/delete', requireAuth, (req, res) => {
  const db = database.getDb();
  const { id } = req.params;

  try {
    db.prepare('DELETE FROM hackathons WHERE id = ?').run(id);
    res.redirect('/hackathons');
  } catch (err) {
    console.error('Error deleting hackathon:', err);
    res.render('error', { message: 'Error deleting hackathon', error: err });
  }
});

export default router;
