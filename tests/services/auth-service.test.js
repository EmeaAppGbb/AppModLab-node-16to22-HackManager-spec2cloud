// green-baseline: captures existing behavior
// These tests verify authService's current behavior as a regression safety net.
// Do NOT modify these tests to match new feature requirements — create new tests instead.

const bcrypt = require('bcryptjs');

let authService;
let database;
let db;

beforeAll(() => {
  database = require('../../src/config/database');
  database.initDatabase();
  db = database.getDb();
  authService = require('../../src/services/authService');

  const hash = bcrypt.hashSync('password123', 10);
  db.prepare('INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)')
    .run('authsvcuser', 'authsvc@example.com', hash, 'participant');
});

describe('authService', () => {
  describe('authenticate', () => {
    it('currently returns user object for valid credentials', async () => {
      const user = await authService.authenticate('authsvcuser', 'password123');
      expect(user).not.toBeNull();
      expect(user.username).toBe('authsvcuser');
      expect(user.email).toBe('authsvc@example.com');
      expect(user.role).toBe('participant');
      expect(user.id).toBeDefined();
      expect(user.password).toBeUndefined();
    });

    it('currently returns null for wrong password', async () => {
      const user = await authService.authenticate('authsvcuser', 'wrongpassword');
      expect(user).toBeNull();
    });

    it('currently returns null for nonexistent username', async () => {
      const user = await authService.authenticate('nosuchuser', 'anypassword');
      expect(user).toBeNull();
    });
  });

  describe('register', () => {
    it('currently creates a new user with hashed password and participant role', async () => {
      const result = await authService.register('regsvcuser', 'regsvc@example.com', 'securepass');
      expect(result.lastInsertRowid).toBeGreaterThan(0);
      const user = db.prepare('SELECT * FROM users WHERE username = ?').get('regsvcuser');
      expect(user.email).toBe('regsvc@example.com');
      expect(user.role).toBe('participant');
      expect(user.password).not.toBe('securepass');
    });

    it('currently always assigns participant role regardless of input', async () => {
      await authService.register('defaultrolesvc', 'defaultsvc@example.com', 'pass123');
      const user = db.prepare('SELECT * FROM users WHERE username = ?').get('defaultrolesvc');
      expect(user.role).toBe('participant');
    });

    it('currently throws on duplicate username', async () => {
      await expect(
        authService.register('authsvcuser', 'another@example.com', 'pass123', 'participant')
      ).rejects.toThrow();
    });

    it('currently throws on duplicate email', async () => {
      await expect(
        authService.register('uniquename999', 'authsvc@example.com', 'pass123', 'participant')
      ).rejects.toThrow();
    });
  });
});
