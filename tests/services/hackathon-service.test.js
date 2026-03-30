// green-baseline: captures existing behavior
// These tests verify hackathonService's current behavior as a regression safety net.

let hackathonService;
let database;
let db;
let userId;

beforeAll(() => {
  database = require('../../src/config/database');
  database.initDatabase();
  db = database.getDb();
  hackathonService = require('../../src/services/hackathonService');

  db.prepare('INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)')
    .run('hacksvcuser', 'hacksvc@test.com', 'hash', 'participant');
  userId = db.prepare('SELECT id FROM users WHERE username = ?').get('hacksvcuser').id;
});

describe('hackathonService', () => {
  let hackathonId;

  describe('create', () => {
    it('currently creates a hackathon and returns lastInsertRowid', () => {
      const result = hackathonService.create({
        name: 'Svc Hack',
        description: 'Service test hackathon',
        start_date: '2024-08-01',
        end_date: '2024-08-03',
        location: 'Remote',
        max_teams: 15,
        status: 'upcoming',
        created_by: userId,
      });
      hackathonId = Number(result.lastInsertRowid);
      expect(hackathonId).toBeGreaterThan(0);
    });
  });

  describe('getAll', () => {
    it('currently returns array of hackathons with formatted dates', () => {
      const all = hackathonService.getAll();
      expect(Array.isArray(all)).toBe(true);
      expect(all.length).toBeGreaterThanOrEqual(1);
      const hack = all.find((h) => h.name === 'Svc Hack');
      expect(hack).toBeDefined();
      expect(hack.start_date_formatted).toBeDefined();
      expect(hack.end_date_formatted).toBeDefined();
    });
  });

  describe('getById', () => {
    it('currently returns hackathon with teams and submissions arrays', () => {
      const data = hackathonService.getById(hackathonId);
      expect(data).toBeDefined();
      expect(data.hackathon.name).toBe('Svc Hack');
      expect(data.hackathon.start_date_formatted).toBeDefined();
      expect(Array.isArray(data.teams)).toBe(true);
      expect(Array.isArray(data.submissions)).toBe(true);
    });

    it('currently returns null for nonexistent id', () => {
      expect(hackathonService.getById(99999)).toBeNull();
    });
  });

  describe('update', () => {
    it('currently updates hackathon fields', () => {
      hackathonService.update(hackathonId, {
        name: 'Updated Svc Hack',
        description: 'Updated',
        start_date: '2024-08-01',
        end_date: '2024-08-05',
        location: 'Boston',
        max_teams: 25,
        status: 'active',
      });
      const data = hackathonService.getById(hackathonId);
      expect(data.hackathon.name).toBe('Updated Svc Hack');
      expect(data.hackathon.status).toBe('active');
    });
  });

  describe('delete', () => {
    it('currently removes hackathon from database', () => {
      const toDelete = hackathonService.create({
        name: 'Svc Delete Target',
        description: 'Will be deleted',
        start_date: '2024-09-01',
        end_date: '2024-09-03',
        location: 'Nowhere',
        max_teams: 5,
        status: 'upcoming',
        created_by: userId,
      });
      const deleteId = Number(toDelete.lastInsertRowid);
      hackathonService.delete(deleteId);
      expect(hackathonService.getById(deleteId)).toBeNull();
    });
  });
});
