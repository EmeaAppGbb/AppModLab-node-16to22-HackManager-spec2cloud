// green-baseline: captures existing behavior
// These tests verify dashboardService's current behavior as a regression safety net.

let dashboardService;
let database;

beforeAll(() => {
  database = require('../../src/config/database');
  database.initDatabase();
  const db = database.getDb();
  dashboardService = require('../../src/services/dashboardService');

  db.prepare('INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)')
    .run('dashsvcuser', 'dashsvc@test.com', 'hash', 'participant');
  const userId = db.prepare('SELECT id FROM users WHERE username = ?').get('dashsvcuser').id;

  db.prepare('INSERT INTO hackathons (name, description, start_date, end_date, location, max_teams, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run('Dash Svc Hack', 'Dashboard service test', '2024-06-01', '2024-06-03', 'Online', 10, 'upcoming', userId);
});

describe('dashboardService', () => {
  describe('getStats', () => {
    it('currently returns stats object with counts', () => {
      const result = dashboardService.getStats();
      expect(result.stats).toBeDefined();
      expect(typeof result.stats.totalHackathons).toBe('number');
      expect(typeof result.stats.totalTeams).toBe('number');
      expect(typeof result.stats.totalParticipants).toBe('number');
      expect(result.stats.totalHackathons).toBeGreaterThanOrEqual(1);
    });

    it('currently returns recent hackathons array (max 3)', () => {
      const result = dashboardService.getStats();
      expect(Array.isArray(result.hackathons)).toBe(true);
      expect(result.hackathons.length).toBeLessThanOrEqual(3);
    });

    it('currently formats dates on recent hackathons', () => {
      const result = dashboardService.getStats();
      if (result.hackathons.length > 0) {
        expect(result.hackathons[0].start_date_formatted).toBeDefined();
        expect(result.hackathons[0].end_date_formatted).toBeDefined();
      }
    });
  });
});
