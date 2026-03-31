// Unit tests for leaderboardService

let leaderboardService;
let db;

beforeAll(() => {
  const database = require('../../src/config/database');
  database.initDatabase();
  db = database.getDb();

  const bcrypt = require('bcryptjs');
  const hash = bcrypt.hashSync('Lbpass123', 10);

  // Seed users
  db.prepare('INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)').run('lbadmin', 'lbadmin@test.com', hash, 'admin');
  db.prepare('INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)').run('lbjudge1', 'lbjudge1@test.com', hash, 'judge');
  db.prepare('INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)').run('lbjudge2', 'lbjudge2@test.com', hash, 'judge');

  const adminId = db.prepare('SELECT id FROM users WHERE username = ?').get('lbadmin').id;
  const judge1Id = db.prepare('SELECT id FROM users WHERE username = ?').get('lbjudge1').id;
  const judge2Id = db.prepare('SELECT id FROM users WHERE username = ?').get('lbjudge2').id;

  // Seed hackathons
  const h1 = db.prepare('INSERT INTO hackathons (name, description, start_date, end_date, status, created_by) VALUES (?, ?, ?, ?, ?, ?)').run('LB Hack Alpha', 'First', '2024-06-01', '2024-06-03', 'active', adminId);
  const h2 = db.prepare('INSERT INTO hackathons (name, description, start_date, end_date, status, created_by) VALUES (?, ?, ?, ?, ?, ?)').run('LB Hack Beta', 'Second', '2024-07-01', '2024-07-03', 'active', adminId);
  const hackathonId1 = Number(h1.lastInsertRowid);
  const hackathonId2 = Number(h2.lastInsertRowid);

  // Seed teams
  const t1 = db.prepare('INSERT INTO teams (name, hackathon_id, project_name) VALUES (?, ?, ?)').run('LB Team Alpha', hackathonId1, 'Project Alpha');
  const t2 = db.prepare('INSERT INTO teams (name, hackathon_id, project_name) VALUES (?, ?, ?)').run('LB Team Beta', hackathonId1, 'Project Beta');
  const t3 = db.prepare('INSERT INTO teams (name, hackathon_id, project_name) VALUES (?, ?, ?)').run('LB Team Gamma', hackathonId2, 'Project Gamma');
  const teamId1 = Number(t1.lastInsertRowid);
  const teamId2 = Number(t2.lastInsertRowid);
  const teamId3 = Number(t3.lastInsertRowid);

  // Seed submissions
  const s1 = db.prepare('INSERT INTO submissions (team_id, hackathon_id, title, description) VALUES (?, ?, ?, ?)').run(teamId1, hackathonId1, 'Alpha Submission', 'Great project');
  const s2 = db.prepare('INSERT INTO submissions (team_id, hackathon_id, title, description) VALUES (?, ?, ?, ?)').run(teamId2, hackathonId1, 'Beta Submission', 'Another project');
  const s3 = db.prepare('INSERT INTO submissions (team_id, hackathon_id, title, description) VALUES (?, ?, ?, ?)').run(teamId3, hackathonId2, 'Gamma Submission', 'Third project');
  const subId1 = Number(s1.lastInsertRowid);
  const subId2 = Number(s2.lastInsertRowid);
  // subId3 left unscored

  // Seed judges
  const j1 = db.prepare('INSERT INTO judges (user_id, hackathon_id) VALUES (?, ?)').run(judge1Id, hackathonId1);
  const j2 = db.prepare('INSERT INTO judges (user_id, hackathon_id) VALUES (?, ?)').run(judge2Id, hackathonId1);
  const judgeDbId1 = Number(j1.lastInsertRowid);
  const judgeDbId2 = Number(j2.lastInsertRowid);

  // Seed scores: Alpha gets high scores from 2 judges, Beta gets lower from 1 judge
  db.prepare('INSERT INTO scores (submission_id, judge_id, innovation, technical, presentation, impact, overall) VALUES (?, ?, ?, ?, ?, ?, ?)').run(subId1, judgeDbId1, 9, 8, 7, 10, 8.5);
  db.prepare('INSERT INTO scores (submission_id, judge_id, innovation, technical, presentation, impact, overall) VALUES (?, ?, ?, ?, ?, ?, ?)').run(subId1, judgeDbId2, 8, 9, 8, 9, 8.5);
  db.prepare('INSERT INTO scores (submission_id, judge_id, innovation, technical, presentation, impact, overall) VALUES (?, ?, ?, ?, ?, ?, ?)').run(subId2, judgeDbId1, 5, 6, 4, 5, 5.0);

  leaderboardService = require('../../src/services/leaderboardService');
});

describe('leaderboardService', () => {
  describe('getLeaderboard', () => {
    it('returns all submissions ranked by avg overall descending', () => {
      const entries = leaderboardService.getLeaderboard(null);
      expect(entries.length).toBeGreaterThanOrEqual(3);

      // Find our seeded entries
      const alpha = entries.find(e => e.submission_title === 'Alpha Submission');
      const beta = entries.find(e => e.submission_title === 'Beta Submission');
      const gamma = entries.find(e => e.submission_title === 'Gamma Submission');

      expect(alpha).toBeDefined();
      expect(beta).toBeDefined();
      expect(gamma).toBeDefined();

      // Alpha (avg 8.5) should rank above Beta (avg 5.0)
      expect(entries.indexOf(alpha)).toBeLessThan(entries.indexOf(beta));
      // Gamma has no scores and should appear after scored entries
      expect(entries.indexOf(beta)).toBeLessThan(entries.indexOf(gamma));
    });

    it('assigns rank numbers to scored entries and null to unscored', () => {
      const entries = leaderboardService.getLeaderboard(null);
      const alpha = entries.find(e => e.submission_title === 'Alpha Submission');
      const gamma = entries.find(e => e.submission_title === 'Gamma Submission');

      expect(alpha.rank).toBeGreaterThan(0);
      expect(gamma.rank).toBeNull();
    });

    it('includes per-criteria averages and judge count', () => {
      const entries = leaderboardService.getLeaderboard(null);
      const alpha = entries.find(e => e.submission_title === 'Alpha Submission');

      expect(alpha.avg_overall).toBe(8.5);
      expect(alpha.avg_innovation).toBe(8.5);
      expect(alpha.judge_count).toBe(2);
      expect(alpha.team_name).toBe('LB Team Alpha');
    });

    it('filters by hackathon_id when provided', () => {
      const allEntries = leaderboardService.getLeaderboard(null);
      const alphaEntry = allEntries.find(e => e.submission_title === 'Alpha Submission');
      const hackathonId = alphaEntry.hackathon_id;

      const filtered = leaderboardService.getLeaderboard(hackathonId);
      expect(filtered.every(e => e.hackathon_id === hackathonId)).toBe(true);
      expect(filtered.find(e => e.submission_title === 'Gamma Submission')).toBeUndefined();
    });

    it('returns empty array for hackathon with no submissions', () => {
      const entries = leaderboardService.getLeaderboard(999999);
      expect(entries).toEqual([]);
    });
  });

  describe('getHackathons', () => {
    it('returns list of all hackathons', () => {
      const hackathons = leaderboardService.getHackathons();
      expect(hackathons.length).toBeGreaterThanOrEqual(2);
      const names = hackathons.map(h => h.name);
      expect(names).toContain('LB Hack Alpha');
      expect(names).toContain('LB Hack Beta');
    });
  });
});
