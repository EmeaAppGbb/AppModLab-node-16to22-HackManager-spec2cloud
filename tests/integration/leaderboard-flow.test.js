// Integration tests for GET /leaderboard route
const request = require('supertest');

let app;
let hackathonId;

beforeAll(async () => {
  const database = require('../../src/config/database');
  database.initDatabase();

  const bcrypt = require('bcryptjs');
  const db = database.getDb();
  const hash = await bcrypt.hash('Lbintpass1', 10);

  // Seed admin user
  db.prepare('INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)').run('lbrouteadmin', 'lbroute@test.com', hash, 'admin');
  const userId = db.prepare('SELECT id FROM users WHERE username = ?').get('lbrouteadmin').id;

  // Seed hackathon
  const hackResult = db.prepare(
    'INSERT INTO hackathons (name, description, start_date, end_date, status, created_by) VALUES (?, ?, ?, ?, ?, ?)'
  ).run('LB Route Hack', 'For leaderboard route tests', '2024-08-01', '2024-08-03', 'active', userId);
  hackathonId = Number(hackResult.lastInsertRowid);

  // Seed team + submission + score
  const teamResult = db.prepare('INSERT INTO teams (name, hackathon_id, project_name) VALUES (?, ?, ?)').run('LB Route Team', hackathonId, 'Route Project');
  const teamId = Number(teamResult.lastInsertRowid);

  const subResult = db.prepare('INSERT INTO submissions (team_id, hackathon_id, title, description) VALUES (?, ?, ?, ?)').run(teamId, hackathonId, 'Route Submission', 'Test submission');
  const subId = Number(subResult.lastInsertRowid);

  const judgeResult = db.prepare('INSERT INTO judges (user_id, hackathon_id) VALUES (?, ?)').run(userId, hackathonId);
  const judgeId = Number(judgeResult.lastInsertRowid);

  db.prepare('INSERT INTO scores (submission_id, judge_id, innovation, technical, presentation, impact, overall) VALUES (?, ?, ?, ?, ?, ?, ?)').run(subId, judgeId, 8, 7, 9, 8, 8.0);

  app = require('../../src/app');
});

describe('Leaderboard Route Integration', () => {
  describe('GET /leaderboard', () => {
    it('returns 200 without authentication', async () => {
      const res = await request(app).get('/leaderboard');
      expect(res.status).toBe(200);
    });

    it('displays leaderboard table with ranked submissions', async () => {
      const res = await request(app).get('/leaderboard');
      expect(res.text).toContain('Leaderboard');
      expect(res.text).toContain('Route Submission');
      expect(res.text).toContain('LB Route Team');
    });

    it('shows hackathon filter dropdown', async () => {
      const res = await request(app).get('/leaderboard');
      expect(res.text).toContain('hackathon_id');
      expect(res.text).toContain('All Hackathons');
      expect(res.text).toContain('LB Route Hack');
    });

    it('filters by hackathon_id query parameter', async () => {
      const res = await request(app).get(`/leaderboard?hackathon_id=${hackathonId}`);
      expect(res.status).toBe(200);
      expect(res.text).toContain('Route Submission');
    });

    it('returns 404 for invalid hackathon_id', async () => {
      const res = await request(app).get('/leaderboard?hackathon_id=999999');
      expect(res.status).toBe(404);
    });

    it('displays score values', async () => {
      const res = await request(app).get('/leaderboard');
      expect(res.text).toContain('8.0');
      expect(res.text).toContain('1 judge');
    });

    it('displays Not yet scored for unscored submissions', async () => {
      // Seed an unscored submission
      const database = require('../../src/config/database');
      const db = database.getDb();
      const userId = db.prepare('SELECT id FROM users WHERE username = ?').get('lbrouteadmin').id;

      const h = db.prepare('INSERT INTO hackathons (name, description, start_date, end_date, status, created_by) VALUES (?, ?, ?, ?, ?, ?)').run('Empty Score Hack', 'No scores', '2024-09-01', '2024-09-03', 'active', userId);
      const hId = Number(h.lastInsertRowid);
      const t = db.prepare('INSERT INTO teams (name, hackathon_id, project_name) VALUES (?, ?, ?)').run('Unscored Team', hId, 'No Score Proj');
      const tId = Number(t.lastInsertRowid);
      db.prepare('INSERT INTO submissions (team_id, hackathon_id, title, description) VALUES (?, ?, ?, ?)').run(tId, hId, 'Unscored Sub', 'No scores yet');

      const res = await request(app).get('/leaderboard');
      expect(res.text).toContain('Not yet scored');
    });

    it('shows navigation link to leaderboard', async () => {
      const res = await request(app).get('/');
      expect(res.text).toContain('href="/leaderboard"');
      expect(res.text).toContain('Leaderboard');
    });
  });
});
