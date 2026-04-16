import express from 'express';
import * as database from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Native date-time formatting to replace moment.js
const formatDateTime = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true
  });
};

/* GET all submissions */
router.get('/submissions', (req, res) => {
  const db = database.getDb();

  try {
    const submissions = db.prepare(
      'SELECT submissions.*, teams.name as team_name, hackathons.name as hackathon_name ' +
      'FROM submissions ' +
      'LEFT JOIN teams ON submissions.team_id = teams.id ' +
      'LEFT JOIN hackathons ON submissions.hackathon_id = hackathons.id ' +
      'ORDER BY submissions.submitted_at DESC'
    ).all();

    res.render('submissions/index', { submissions });
  } catch (err) {
    console.error('Error fetching submissions:', err);
    res.render('error', { message: 'Error loading submissions', error: err });
  }
});

/* GET new submission form */
router.get('/hackathons/:hackathonId/submissions/new', requireAuth, (req, res) => {
  const db = database.getDb();
  const { hackathonId } = req.params;

  try {
    const hackathon = db.prepare('SELECT * FROM hackathons WHERE id = ?').get(hackathonId);

    if (!hackathon) {
      return res.status(404).render('error', { message: 'Hackathon not found', error: { status: 404 } });
    }

    const teams = db.prepare('SELECT * FROM teams WHERE hackathon_id = ?').all(hackathonId);

    res.render('submissions/new', { hackathon, teams });
  } catch (err) {
    console.error('Error loading submission form:', err);
    res.render('error', { message: 'Error loading form', error: err });
  }
});

/* POST create submission */
router.post('/hackathons/:hackathonId/submissions', requireAuth, (req, res) => {
  const { title, description, demo_url, repo_url, team_id } = req.body;
  const db = database.getDb();
  const { hackathonId } = req.params;

  try {
    const result = db.prepare(
      'INSERT INTO submissions (team_id, hackathon_id, title, description, demo_url, repo_url) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(team_id, hackathonId, title, description, demo_url, repo_url);

    res.redirect(`/submissions/${result.lastInsertRowid}`);
  } catch (err) {
    console.error('Error creating submission:', err);
    res.render('error', { message: 'Error creating submission', error: err });
  }
});

/* GET single submission */
router.get('/submissions/:id', (req, res) => {
  const db = database.getDb();
  const { id } = req.params;

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

    submission.submitted_at_formatted = formatDateTime(submission.submitted_at);

    const scores = db.prepare(
      'SELECT scores.*, users.username as judge_username ' +
      'FROM scores ' +
      'LEFT JOIN judges ON scores.judge_id = judges.id ' +
      'LEFT JOIN users ON judges.user_id = users.id ' +
      'WHERE scores.submission_id = ?'
    ).all(id);

    res.render('submissions/show', { submission, scores });
  } catch (err) {
    console.error('Error fetching submission:', err);
    res.render('error', { message: 'Error loading submission', error: err });
  }
});

export default router;
