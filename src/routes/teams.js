import express from 'express';
import * as database from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const auth = { requireAuth };

/* GET all teams */
router.get('/teams', function(req, res) {
  const db = database.getDb();

  try {
    const teams = db.prepare(
      'SELECT teams.*, hackathons.name as hackathon_name FROM teams LEFT JOIN hackathons ON teams.hackathon_id = hackathons.id ORDER BY teams.created_at DESC'
    ).all();

    res.render('teams/index', { teams: teams });
  } catch (err) {
    console.error('Error fetching teams:', err);
    res.render('error', { message: 'Error loading teams', error: err });
  }
});

/* GET new team form for a hackathon */
router.get('/hackathons/:hackathonId/teams/new', auth.requireAuth, function(req, res) {
  const db = database.getDb();
  const hackathonId = req.params.hackathonId;

  try {
    const hackathon = db.prepare('SELECT * FROM hackathons WHERE id = ?').get(hackathonId);

    if (!hackathon) {
      return res.status(404).render('error', { message: 'Hackathon not found', error: { status: 404 } });
    }

    res.render('teams/new', { hackathon: hackathon });
  } catch (err) {
    console.error('Error loading new team form:', err);
    res.render('error', { message: 'Error loading form', error: err });
  }
});

/* POST create team for a hackathon */
router.post('/hackathons/:hackathonId/teams', auth.requireAuth, function(req, res) {
  const { name, project_name, project_description, repo_url } = req.body;
  const db = database.getDb();
  const hackathonId = req.params.hackathonId;

  try {
    const result = db.prepare(
      'INSERT INTO teams (name, hackathon_id, project_name, project_description, repo_url) VALUES (?, ?, ?, ?, ?)'
    ).run(name, hackathonId, project_name, project_description, repo_url);

    res.redirect('/teams/' + result.lastInsertRowid);
  } catch (err) {
    console.error('Error creating team:', err);
    res.render('error', { message: 'Error creating team', error: err });
  }
});

/* GET single team */
router.get('/teams/:id', function(req, res) {
  const db = database.getDb();
  const id = req.params.id;

  try {
    const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(id);

    if (!team) {
      return res.status(404).render('error', { message: 'Team not found', error: { status: 404 } });
    }

    const members = db.prepare(
      'SELECT participants.*, users.username, users.email FROM participants JOIN users ON participants.user_id = users.id WHERE participants.team_id = ?'
    ).all(id);

    const hackathon = db.prepare('SELECT * FROM hackathons WHERE id = ?').get(team.hackathon_id);

    res.render('teams/show', {
      team: team,
      members: members,
      hackathon: hackathon
    });
  } catch (err) {
    console.error('Error fetching team:', err);
    res.render('error', { message: 'Error loading team', error: err });
  }
});

export default router;
