// green-baseline: captures existing behavior
// These tests verify submissionService's current behavior as a regression safety net.

let submissionService;
let database;
let db;
let hackathonId;
let teamId;

beforeAll(() => {
  database = require('../../src/config/database');
  database.initDatabase();
  db = database.getDb();
  submissionService = require('../../src/services/submissionService');

  db.prepare('INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)')
    .run('subsvcuser', 'subsvc@test.com', 'hash', 'participant');
  const userId = db.prepare('SELECT id FROM users WHERE username = ?').get('subsvcuser').id;

  const hackResult = db.prepare(
    'INSERT INTO hackathons (name, description, start_date, end_date, location, max_teams, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run('Sub Svc Hack', 'For submission service tests', '2024-06-01', '2024-06-03', 'Online', 10, 'upcoming', userId);
  hackathonId = Number(hackResult.lastInsertRowid);

  const teamResult = db.prepare(
    'INSERT INTO teams (name, hackathon_id, project_name, project_description, repo_url) VALUES (?, ?, ?, ?, ?)'
  ).run('Sub Svc Team', hackathonId, 'Sub Project', 'Desc', 'https://github.com/test/sub');
  teamId = Number(teamResult.lastInsertRowid);
});

describe('submissionService', () => {
  let submissionId;

  describe('create', () => {
    it('currently creates a submission and returns lastInsertRowid', () => {
      const result = submissionService.create({
        team_id: teamId,
        hackathon_id: hackathonId,
        title: 'Svc Test Submission',
        description: 'A test submission',
        demo_url: 'https://demo.example.com',
        repo_url: 'https://github.com/test/sub',
      });
      submissionId = Number(result.lastInsertRowid);
      expect(submissionId).toBeGreaterThan(0);
    });
  });

  describe('getAll', () => {
    it('currently returns array of submissions', () => {
      const all = submissionService.getAll();
      expect(Array.isArray(all)).toBe(true);
      expect(all.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getById', () => {
    it('currently returns submission with scores and formatted date', () => {
      const data = submissionService.getById(submissionId);
      expect(data).toBeDefined();
      expect(data.submission.title).toBe('Svc Test Submission');
      expect(data.submission.submitted_at_formatted).toBeDefined();
      expect(Array.isArray(data.scores)).toBe(true);
    });

    it('currently returns null for nonexistent submission', () => {
      expect(submissionService.getById(99999)).toBeNull();
    });
  });

  describe('getNewForm', () => {
    it('currently returns hackathon and teams for the form', () => {
      const data = submissionService.getNewForm(hackathonId);
      expect(data).toBeDefined();
      expect(data.hackathon.name).toBe('Sub Svc Hack');
      expect(Array.isArray(data.teams)).toBe(true);
    });

    it('currently returns null for nonexistent hackathon', () => {
      expect(submissionService.getNewForm(99999)).toBeNull();
    });
  });
});
