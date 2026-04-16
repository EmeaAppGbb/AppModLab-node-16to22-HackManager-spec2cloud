import express from 'express';
import moment from 'moment';
import * as database from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const auth = { requireAuth };

/* GET all submissions */
router.get('/submissions', function(req, res) {
  const db = database.getDb();

  try {
    const submissions = db.prepare(
      'SELECT submissions.*, teams.name as team_name, hackathons.name as hackathon_name ' +
      'FROM submissions ' +
      'LEFT JOIN teams ON submissions.team_id = teams.id ' +
      'LEFT JOIN hackathons ON submissions.hackathon_id = hackathons.id ' +
      'ORDER BY submissions.submitted_at DESC'
    ).all();

    res.render('submissions/index', { submissions: submissions });
  } catch (err) {
    console.error('Error fetching submissions:', err);
    res.render('error', { message: 'Error loading submissions', error: err });
  }
});

/* GET new submission form */
router.get('/hackathons/:hackathonId/submissions/new', auth.requireAuth, function(req, res) {
  const db = database.getDb();
  const hackathonId = req.params.hackathonId;

  try {
    const hackathon = db.prepare('SELECT * FROM hackathons WHERE id = ?').get(hackathonId);

    if (!hackathon) {
      return res.status(404).render('error', { message: 'Hackathon not found', error: { status: 404 } });
    }

    const teams = db.prepare('SELECT * FROM teams WHERE hackathon_id = ?').all(hackathonId);

    res.render('submissions/new', {
      hackathon: hackathon,
      teams: teams
    });
  } catch (err) {
    console.error('Error loading submission form:', err);
    res.render('error', { message: 'Error loading form', error: err });
  }
});

/* POST create submission */
router.post('/hackathons/:hackathonId/submissions', auth.requireAuth, function(req, res) {
  const { title, description, demo_url, repo_url, team_id } = req.body;
  const db = database.getDb();
  const hackathonId = req.params.hackathonId;

  try {
    const result = db.prepare(
      'INSERT INTO submissions (team_id, hackathon_id, title, description, demo_url, repo_url) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(team_id, hackathonId, title, description, demo_url, repo_url);

    res.redirect('/submissions/' + result.lastInsertRowid);
  } catch (err) {
    console.error('Error creating submission:', err);
    res.render('error', { message: 'Error creating submission', error: err });
  }
});

/* GET single submission */
router.get('/submissions/:id', function(req, res) {
  const db = database.getDb();
  const id = req.params.id;

  try {
    const submission = db.prepare(
      'SELECT submissions.*, teams.name as team_name, hackathons.name as hackathon_name ' +
      'FROM submissions ' +
      'LEFT JOIN teams ON submissions.team_id = teams.id ' +
      'LEFT JOIN hackathons ON submissions.hackathon_id = hackathons.id ' +
      'WHERE submissions.id = ?'
    ).get(id);

    if (!submission) {
      return res.status(404).render('error', { message: 'Submission not found', error: { status: 404 } });
    }

    submission.submitted_at_formatted = moment(submission.submitted_at).format('MMM D, YYYY h:mm A');

    const scores = db.prepare(
      'SELECT scores.*, users.username as judge_username ' +
      'FROM scores ' +
      'LEFT JOIN judges ON scores.judge_id = judges.id ' +
      'LEFT JOIN users ON judges.user_id = users.id ' +
      'WHERE scores.submission_id = ?'
    ).all(id);

    res.render('submissions/show', {
      submission: submission,
      scores: scores
    });
  } catch (err) {
    console.error('Error fetching submission:', err);
    res.render('error', { message: 'Error loading submission', error: err });
  }
});

export default router;
