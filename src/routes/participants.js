import express from 'express';
import * as database from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const auth = { requireAuth };

/* GET all participants */
router.get('/participants', function(req, res) {
  const db = database.getDb();

  try {
    const participants = db.prepare(
      'SELECT participants.*, users.username, users.email, hackathons.name as hackathon_name, teams.name as team_name ' +
      'FROM participants ' +
      'LEFT JOIN users ON participants.user_id = users.id ' +
      'LEFT JOIN hackathons ON participants.hackathon_id = hackathons.id ' +
      'LEFT JOIN teams ON participants.team_id = teams.id ' +
      'ORDER BY participants.registered_at DESC'
    ).all();

    res.render('participants/index', { participants: participants });
  } catch (err) {
    console.error('Error fetching participants:', err);
    res.render('error', { message: 'Error loading participants', error: err });
  }
});

/* POST join a hackathon */
router.post('/hackathons/:hackathonId/participants/join', auth.requireAuth, function(req, res) {
  const db = database.getDb();
  const hackathonId = req.params.hackathonId;
  const userId = req.session.user.id;
  const teamId = req.body.team_id || null;

  try {
    db.prepare(
      'INSERT INTO participants (user_id, team_id, hackathon_id, role) VALUES (?, ?, ?, ?)'
    ).run(userId, teamId, hackathonId, 'member');

    res.redirect('/hackathons/' + hackathonId);
  } catch (err) {
    console.error('Error joining hackathon:', err);
    res.render('error', { message: 'Error joining hackathon', error: err });
  }
});

export default router;
