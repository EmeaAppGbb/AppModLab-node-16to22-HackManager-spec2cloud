var express = require('express');
var router = express.Router();
var database = require('../config/database');
var auth = require('../middleware/auth');

/* GET judging dashboard - list submissions to judge */
router.get('/judging', function(req, res) {
  const db = database.getDb();

  try {
    const submissions = db.prepare(
      'SELECT submissions.*, teams.name as team_name, hackathons.name as hackathon_name ' +
      'FROM submissions ' +
      'LEFT JOIN teams ON submissions.team_id = teams.id ' +
      'LEFT JOIN hackathons ON submissions.hackathon_id = hackathons.id ' +
      'ORDER BY submissions.submitted_at DESC'
    ).all();

    res.render('judging/index', { submissions: submissions });
  } catch (err) {
    console.error('Error fetching judging list:', err);
    res.render('error', { message: 'Error loading judging page', error: err });
  }
});

/* GET score form for a submission */
router.get('/submissions/:id/judge', auth.requireJudge, function(req, res) {
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

    res.render('judging/score', { submission: submission });
  } catch (err) {
    console.error('Error loading judge form:', err);
    res.render('error', { message: 'Error loading scoring form', error: err });
  }
});

/* POST score a submission */
router.post('/submissions/:id/score', auth.requireJudge, function(req, res) {
  const { innovation, technical, presentation, impact, comments } = req.body;
  const db = database.getDb();
  const submissionId = req.params.id;
  const userId = req.session.user.id;

  try {
    // Find or create judge record for this user/hackathon
    const submission = db.prepare('SELECT * FROM submissions WHERE id = ?').get(submissionId);

    if (!submission) {
      return res.status(404).render('error', { message: 'Submission not found', error: { status: 404 } });
    }

    let judge = db.prepare(
      'SELECT * FROM judges WHERE user_id = ? AND hackathon_id = ?'
    ).get(userId, submission.hackathon_id);

    if (!judge) {
      const result = db.prepare(
        'INSERT INTO judges (user_id, hackathon_id) VALUES (?, ?)'
      ).run(userId, submission.hackathon_id);
      judge = { id: result.lastInsertRowid };
    }

    // Calculate overall score
    const innovationScore = parseInt(innovation) || 0;
    const technicalScore = parseInt(technical) || 0;
    const presentationScore = parseInt(presentation) || 0;
    const impactScore = parseInt(impact) || 0;
    const overall = (innovationScore + technicalScore + presentationScore + impactScore) / 4;

    db.prepare(
      'INSERT INTO scores (submission_id, judge_id, innovation, technical, presentation, impact, overall, comments) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(submissionId, judge.id, innovationScore, technicalScore, presentationScore, impactScore, overall, comments);

    res.redirect('/judging');
  } catch (err) {
    console.error('Error scoring submission:', err);
    res.render('error', { message: 'Error saving score', error: err });
  }
});

module.exports = router;
