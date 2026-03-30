// green-baseline: captures existing behavior
// These tests verify participantService's current behavior as a regression safety net.

let participantService;
let database;
let userId;
let hackathonId;

beforeAll(() => {
  database = require('../../src/config/database');
  database.initDatabase();
  const db = database.getDb();
  participantService = require('../../src/services/participantService');

  db.prepare('INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)')
    .run('partsvcuser', 'partsvc@test.com', 'hash', 'participant');
  userId = db.prepare('SELECT id FROM users WHERE username = ?').get('partsvcuser').id;

  const result = db.prepare(
    'INSERT INTO hackathons (name, description, start_date, end_date, location, max_teams, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run('Part Svc Hack', 'For participant service tests', '2024-06-01', '2024-06-03', 'Online', 10, 'upcoming', userId);
  hackathonId = Number(result.lastInsertRowid);
});

describe('participantService', () => {
  describe('join', () => {
    it('currently creates a participant record and returns lastInsertRowid', () => {
      const result = participantService.join(userId, null, hackathonId);
      expect(result).toBeDefined();
      expect(result.lastInsertRowid).toBeGreaterThan(0);
    });
  });

  describe('getAll', () => {
    it('currently returns array of participants', () => {
      const all = participantService.getAll();
      expect(Array.isArray(all)).toBe(true);
      expect(all.length).toBeGreaterThanOrEqual(1);
    });
  });
});
