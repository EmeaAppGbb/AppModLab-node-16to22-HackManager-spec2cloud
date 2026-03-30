// green-baseline: captures existing behavior
// These tests verify teamService's current behavior as a regression safety net.

let teamService;
let database;
let db;
let hackathonId;

beforeAll(() => {
  database = require('../../src/config/database');
  database.initDatabase();
  db = database.getDb();
  teamService = require('../../src/services/teamService');

  db.prepare('INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)')
    .run('teamsvcuser', 'teamsvc@test.com', 'hash', 'participant');
  const userId = db.prepare('SELECT id FROM users WHERE username = ?').get('teamsvcuser').id;

  const result = db.prepare(
    'INSERT INTO hackathons (name, description, start_date, end_date, location, max_teams, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run('Team Svc Hack', 'For team service tests', '2024-06-01', '2024-06-03', 'Online', 10, 'upcoming', userId);
  hackathonId = Number(result.lastInsertRowid);
});

describe('teamService', () => {
  let teamId;

  describe('create', () => {
    it('currently creates a team and returns lastInsertRowid', () => {
      const result = teamService.create({
        name: 'Svc Alpha Team',
        hackathon_id: hackathonId,
        project_name: 'Project Alpha',
        project_description: 'A great project',
        repo_url: 'https://github.com/test/alpha',
      });
      teamId = Number(result.lastInsertRowid);
      expect(teamId).toBeGreaterThan(0);
    });
  });

  describe('getAll', () => {
    it('currently returns array of teams', () => {
      const teams = teamService.getAll();
      expect(Array.isArray(teams)).toBe(true);
      expect(teams.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getById', () => {
    it('currently returns team with members array and hackathon', () => {
      const data = teamService.getById(teamId);
      expect(data).toBeDefined();
      expect(data.team.name).toBe('Svc Alpha Team');
      expect(Array.isArray(data.members)).toBe(true);
      expect(data.hackathon).toBeDefined();
      expect(data.hackathon.name).toBe('Team Svc Hack');
    });

    it('currently returns null for nonexistent team', () => {
      expect(teamService.getById(99999)).toBeNull();
    });
  });

  describe('getNewTeamForm', () => {
    it('currently returns hackathon when it exists', () => {
      const hackathon = teamService.getNewTeamForm(hackathonId);
      expect(hackathon).toBeDefined();
      expect(hackathon.name).toBe('Team Svc Hack');
    });

    it('currently returns undefined for nonexistent hackathon', () => {
      expect(teamService.getNewTeamForm(99999)).toBeUndefined();
    });
  });
});
