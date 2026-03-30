// green-baseline: captures existing behavior
// These tests verify judgingService's current behavior as a regression safety net.

let judgingService;
let database;
let db;
let submissionId;
let judgeUserId;
let hackathonId;

beforeAll(() => {
  database = require('../../src/config/database');
  database.initDatabase();
  db = database.getDb();
  judgingService = require('../../src/services/judgingService');

  db.prepare('INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)')
    .run('judgesvcuser', 'judgesvc@test.com', 'hash', 'judge');
  judgeUserId = db.prepare('SELECT id FROM users WHERE username = ?').get('judgesvcuser').id;

  db.prepare('INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)')
    .run('judgesvcowner', 'judgesvcowner@test.com', 'hash', 'participant');
  const ownerId = db.prepare('SELECT id FROM users WHERE username = ?').get('judgesvcowner').id;

  const hackResult = db.prepare(
    'INSERT INTO hackathons (name, description, start_date, end_date, location, max_teams, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run('Judge Svc Hack', 'For judging service tests', '2024-06-01', '2024-06-03', 'Online', 10, 'upcoming', ownerId);
  hackathonId = Number(hackResult.lastInsertRowid);

  const teamResult = db.prepare(
    'INSERT INTO teams (name, hackathon_id, project_name) VALUES (?, ?, ?)'
  ).run('Judge Svc Team', hackathonId, 'Judge Project');
  const teamId = Number(teamResult.lastInsertRowid);

  const subResult = db.prepare(
    'INSERT INTO submissions (team_id, hackathon_id, title, description, demo_url, repo_url) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(teamId, hackathonId, 'Judge Svc Sub', 'A submission to judge', 'https://demo.example.com', 'https://github.com/test/judge');
  submissionId = Number(subResult.lastInsertRowid);
});

describe('judgingService', () => {
  describe('getSubmissions', () => {
    it('currently returns array of all submissions', () => {
      const submissions = judgingService.getSubmissions();
      expect(Array.isArray(submissions)).toBe(true);
      expect(submissions.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getSubmissionForScoring', () => {
    it('currently returns submission by id', () => {
      const submission = judgingService.getSubmissionForScoring(submissionId);
      expect(submission).toBeDefined();
      expect(submission.title).toBe('Judge Svc Sub');
    });

    it('currently returns undefined for nonexistent submission', () => {
      expect(judgingService.getSubmissionForScoring(99999)).toBeUndefined();
    });
  });

  describe('scoreSubmission', () => {
    it('currently creates score with calculated overall average', () => {
      const result = judgingService.scoreSubmission(submissionId, judgeUserId, {
        innovation: 8,
        technical: 7,
        presentation: 9,
        impact: 6,
        comments: 'Good work',
      });
      expect(result).toBe(true);

      const score = db.prepare('SELECT * FROM scores WHERE submission_id = ? ORDER BY id DESC LIMIT 1').get(submissionId);
      expect(score.innovation).toBe(8);
      expect(score.technical).toBe(7);
      expect(score.presentation).toBe(9);
      expect(score.impact).toBe(6);
      expect(score.overall).toBe(7.5);
      expect(score.comments).toBe('Good work');
    });

    it('currently auto-creates judge record when none exists', () => {
      db.prepare('INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)')
        .run('autojudgesvc', 'autojudgesvc@test.com', 'hash', 'judge');
      const newJudgeId = db.prepare('SELECT id FROM users WHERE username = ?').get('autojudgesvc').id;

      const judgeBefore = db.prepare('SELECT * FROM judges WHERE user_id = ? AND hackathon_id = ?').get(newJudgeId, hackathonId);
      expect(judgeBefore).toBeUndefined();

      judgingService.scoreSubmission(submissionId, newJudgeId, {
        innovation: 5, technical: 5, presentation: 5, impact: 5, comments: 'Average',
      });

      const judgeAfter = db.prepare('SELECT * FROM judges WHERE user_id = ? AND hackathon_id = ?').get(newJudgeId, hackathonId);
      expect(judgeAfter).toBeDefined();
    });

    it('currently returns null for nonexistent submission', () => {
      const result = judgingService.scoreSubmission(99999, judgeUserId, {
        innovation: 5, technical: 5, presentation: 5, impact: 5, comments: 'Test',
      });
      expect(result).toBeNull();
    });

    it('currently defaults unparseable scores to 0', () => {
      const teamResult = db.prepare('INSERT INTO teams (name, hackathon_id) VALUES (?, ?)').run('Defaults Svc Team', hackathonId);
      const subResult = db.prepare('INSERT INTO submissions (team_id, hackathon_id, title) VALUES (?, ?, ?)')
        .run(Number(teamResult.lastInsertRowid), hackathonId, 'Defaults Svc Sub');
      const newSubId = Number(subResult.lastInsertRowid);

      judgingService.scoreSubmission(newSubId, judgeUserId, {
        innovation: 'abc', technical: null, presentation: undefined, impact: '', comments: '',
      });

      const score = db.prepare('SELECT * FROM scores WHERE submission_id = ? ORDER BY id DESC LIMIT 1').get(newSubId);
      expect(score.innovation).toBe(0);
      expect(score.technical).toBe(0);
      expect(score.presentation).toBe(0);
      expect(score.impact).toBe(0);
      expect(score.overall).toBe(0);
    });
  });
});
