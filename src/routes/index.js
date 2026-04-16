import express from 'express';
import * as database from '../config/database.js';

const router = express.Router();

// Native date formatting to replace moment.js
const formatDate = (dateStr) => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/* GET home page / dashboard */
router.get('/', (req, res) => {
  const db = database.getDb();

  try {
    const totalHackathons = db.prepare('SELECT COUNT(*) as count FROM hackathons').get().count;
    const totalTeams = db.prepare('SELECT COUNT(*) as count FROM teams').get().count;
    const totalParticipants = db.prepare('SELECT COUNT(*) as count FROM participants').get().count;

    let hackathons = db.prepare(
      'SELECT * FROM hackathons ORDER BY created_at DESC LIMIT 3'
    ).all();

    // Format dates with native Intl API
    hackathons = hackathons.map((h) => {
      h.start_date_formatted = formatDate(h.start_date);
      h.end_date_formatted = formatDate(h.end_date);
      return h;
    });

    res.render('index', {
      hackathons,
      stats: {
        totalHackathons,
        totalTeams,
        totalParticipants
      }
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.render('error', { message: 'Error loading dashboard', error: err });
  }
});

export default router;
