const database = require('../config/database');

function getDb() {
  return database.getDb();
}

const userRepo = {
  findByUsername(username) {
    return getDb().prepare('SELECT * FROM users WHERE username = ?').get(username);
  },
  create(username, email, hashedPassword, role) {
    return getDb()
      .prepare('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)')
      .run(username, email, hashedPassword, role);
  },
};

const hackathonRepo = {
  findAll() {
    return getDb().prepare('SELECT * FROM hackathons ORDER BY start_date DESC').all();
  },
  findRecent(limit = 3) {
    return getDb()
      .prepare('SELECT * FROM hackathons ORDER BY created_at DESC LIMIT ?')
      .all(limit);
  },
  findById(id) {
    return getDb().prepare('SELECT * FROM hackathons WHERE id = ?').get(id);
  },
  create(data) {
    return getDb()
      .prepare(
        'INSERT INTO hackathons (name, description, start_date, end_date, location, max_teams, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .run(
        data.name,
        data.description,
        data.start_date,
        data.end_date,
        data.location,
        data.max_teams || 10,
        data.status || 'upcoming',
        data.created_by
      );
  },
  update(id, data) {
    return getDb()
      .prepare(
        'UPDATE hackathons SET name = ?, description = ?, start_date = ?, end_date = ?, location = ?, max_teams = ?, status = ? WHERE id = ?'
      )
      .run(
        data.name,
        data.description,
        data.start_date,
        data.end_date,
        data.location,
        data.max_teams || 10,
        data.status || 'upcoming',
        id
      );
  },
  delete(id) {
    return getDb().prepare('DELETE FROM hackathons WHERE id = ?').run(id);
  },
  count() {
    return getDb().prepare('SELECT COUNT(*) as count FROM hackathons').get().count;
  },
};

const teamRepo = {
  findAll() {
    return getDb()
      .prepare(
        'SELECT teams.*, hackathons.name as hackathon_name FROM teams LEFT JOIN hackathons ON teams.hackathon_id = hackathons.id ORDER BY teams.created_at DESC'
      )
      .all();
  },
  findById(id) {
    return getDb().prepare('SELECT * FROM teams WHERE id = ?').get(id);
  },
  findByHackathon(hackathonId) {
    return getDb().prepare('SELECT * FROM teams WHERE hackathon_id = ?').all(hackathonId);
  },
  findMembers(teamId) {
    return getDb()
      .prepare(
        'SELECT participants.*, users.username FROM participants JOIN users ON participants.user_id = users.id WHERE participants.team_id = ?'
      )
      .all(teamId);
  },
  create(data) {
    return getDb()
      .prepare(
        'INSERT INTO teams (name, hackathon_id, project_name, project_description, repo_url) VALUES (?, ?, ?, ?, ?)'
      )
      .run(data.name, data.hackathon_id, data.project_name, data.project_description, data.repo_url);
  },
  count() {
    return getDb().prepare('SELECT COUNT(*) as count FROM teams').get().count;
  },
};

const participantRepo = {
  findAll() {
    return getDb()
      .prepare(
        'SELECT participants.*, users.username, hackathons.name as hackathon_name, teams.name as team_name ' +
          'FROM participants ' +
          'LEFT JOIN users ON participants.user_id = users.id ' +
          'LEFT JOIN hackathons ON participants.hackathon_id = hackathons.id ' +
          'LEFT JOIN teams ON participants.team_id = teams.id ' +
          'ORDER BY participants.registered_at DESC'
      )
      .all();
  },
  create(userId, teamId, hackathonId, role = 'member') {
    return getDb()
      .prepare('INSERT INTO participants (user_id, team_id, hackathon_id, role) VALUES (?, ?, ?, ?)')
      .run(userId, teamId, hackathonId, role);
  },
  count() {
    return getDb().prepare('SELECT COUNT(*) as count FROM participants').get().count;
  },
  findByUserAndTeam(userId, teamId) {
    return getDb()
      .prepare('SELECT * FROM participants WHERE user_id = ? AND team_id = ?')
      .get(userId, teamId);
  },
};

const submissionRepo = {
  findAll() {
    return getDb()
      .prepare(
        'SELECT submissions.*, teams.name as team_name, hackathons.name as hackathon_name ' +
          'FROM submissions ' +
          'LEFT JOIN teams ON submissions.team_id = teams.id ' +
          'LEFT JOIN hackathons ON submissions.hackathon_id = hackathons.id ' +
          'ORDER BY submissions.submitted_at DESC'
      )
      .all();
  },
  findById(id) {
    return getDb()
      .prepare(
        'SELECT submissions.*, teams.name as team_name, hackathons.name as hackathon_name ' +
          'FROM submissions ' +
          'LEFT JOIN teams ON submissions.team_id = teams.id ' +
          'LEFT JOIN hackathons ON submissions.hackathon_id = hackathons.id ' +
          'WHERE submissions.id = ?'
      )
      .get(id);
  },
  findByHackathon(hackathonId) {
    return getDb().prepare('SELECT * FROM submissions WHERE hackathon_id = ?').all(hackathonId);
  },
  findScores(submissionId) {
    return getDb()
      .prepare(
        'SELECT scores.*, users.username as judge_username ' +
          'FROM scores ' +
          'LEFT JOIN judges ON scores.judge_id = judges.id ' +
          'LEFT JOIN users ON judges.user_id = users.id ' +
          'WHERE scores.submission_id = ?'
      )
      .all(submissionId);
  },
  create(data) {
    return getDb()
      .prepare(
        'INSERT INTO submissions (team_id, hackathon_id, title, description, demo_url, repo_url) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .run(data.team_id, data.hackathon_id, data.title, data.description, data.demo_url, data.repo_url);
  },
};

const judgeRepo = {
  findByUserAndHackathon(userId, hackathonId) {
    return getDb()
      .prepare('SELECT * FROM judges WHERE user_id = ? AND hackathon_id = ?')
      .get(userId, hackathonId);
  },
  create(userId, hackathonId) {
    return getDb()
      .prepare('INSERT INTO judges (user_id, hackathon_id) VALUES (?, ?)')
      .run(userId, hackathonId);
  },
};

const scoreRepo = {
  create(data) {
    return getDb()
      .prepare(
        'INSERT INTO scores (submission_id, judge_id, innovation, technical, presentation, impact, overall, comments) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .run(
        data.submission_id,
        data.judge_id,
        data.innovation,
        data.technical,
        data.presentation,
        data.impact,
        data.overall,
        data.comments
      );
  },
};

module.exports = {
  userRepo,
  hackathonRepo,
  teamRepo,
  participantRepo,
  submissionRepo,
  judgeRepo,
  scoreRepo,
};
