var express = require('express');
var router = express.Router();
var moment = require('moment');
var database = require('../config/database');

/* GET home page / dashboard */
router.get('/', function(req, res) {
  const db = database.getDb();

  try {
    const totalHackathons = db.prepare('SELECT COUNT(*) as count FROM hackathons').get().count;
    const totalTeams = db.prepare('SELECT COUNT(*) as count FROM teams').get().count;
    const totalParticipants = db.prepare('SELECT COUNT(*) as count FROM participants').get().count;

    let hackathons = db.prepare(
      'SELECT * FROM hackathons ORDER BY created_at DESC LIMIT 3'
    ).all();

    // Format dates with moment
    hackathons = hackathons.map(function(h) {
      h.start_date_formatted = moment(h.start_date).format('MMM D, YYYY');
      h.end_date_formatted = moment(h.end_date).format('MMM D, YYYY');
      return h;
    });

    res.render('index', {
      hackathons: hackathons,
      stats: {
        totalHackathons: totalHackathons,
        totalTeams: totalTeams,
        totalParticipants: totalParticipants
      }
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.render('error', {
      message: 'Error loading dashboard',
      error: err
    });
  }
});

module.exports = router;
