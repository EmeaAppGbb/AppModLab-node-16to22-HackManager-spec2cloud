// green-baseline: captures existing behavior
// These tests verify auth middleware behavior as a regression safety net.

const request = require('supertest');
const bcrypt = require('bcryptjs');
const { createAuthenticatedAgent } = require('../helpers/test-helpers');

let app;
let database;

beforeAll(async () => {
  database = require('../../src/config/database');
  database.initDatabase();

  const db = database.getDb();
  const hash = await bcrypt.hash('mwpass', 10);
  db.prepare('INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)')
    .run('mwadmin', 'mw@admin.com', hash, 'admin');
  db.prepare('INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)')
    .run('mwjudge', 'mw@judge.com', hash, 'judge');
  db.prepare('INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)')
    .run('mwpart', 'mw@part.com', hash, 'participant');

  app = require('../../src/app');
});

describe('Auth Middleware', () => {
  describe('requireAuth', () => {
    it('currently redirects to login when not authenticated', async () => {
      const res = await request(app).get('/hackathons/new');
      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/auth/login');
    });

    it('currently allows access when authenticated', async () => {
      const agent = await createAuthenticatedAgent(app, { username: 'mwpart', password: 'mwpass' });
      const res = await agent.get('/hackathons/new');
      expect(res.status).toBe(200);
    });
  });

  describe('requireJudge', () => {
    it('currently redirects to login when not authenticated', async () => {
      const res = await request(app).get('/submissions/1/judge');
      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/auth/login');
    });

    it('currently returns 403 for participant role', async () => {
      const agent = await createAuthenticatedAgent(app, { username: 'mwpart', password: 'mwpass' });
      const res = await agent.get('/submissions/1/judge');
      expect(res.status).toBe(403);
    });

    it('currently allows judge role (404 for missing submission, not 403)', async () => {
      const agent = await createAuthenticatedAgent(app, { username: 'mwjudge', password: 'mwpass' });
      const res = await agent.get('/submissions/99999/judge');
      expect(res.status).toBe(404);
    });

    it('currently allows admin role (404 for missing submission, not 403)', async () => {
      const agent = await createAuthenticatedAgent(app, { username: 'mwadmin', password: 'mwpass' });
      const res = await agent.get('/submissions/99999/judge');
      expect(res.status).toBe(404);
    });
  });

  describe('requireOwnerOrAdmin', () => {
    let hackathonId;

    beforeAll(async () => {
      const db = database.getDb();
      const owner = db.prepare('SELECT id FROM users WHERE username = ?').get('mwpart');
      const result = db.prepare(
        'INSERT INTO hackathons (name, description, start_date, end_date, location, max_teams, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).run('MW Hack', 'For middleware tests', '2024-06-01', '2024-06-03', 'Online', 10, 'upcoming', owner.id);
      hackathonId = Number(result.lastInsertRowid);
    });

    it('currently allows admin to access any resource', async () => {
      const agent = await createAuthenticatedAgent(app, { username: 'mwadmin', password: 'mwpass' });
      const res = await agent.get(`/hackathons/${hackathonId}/edit`);
      expect(res.status).toBe(200);
    });

    it('currently allows owner to access their resource', async () => {
      const agent = await createAuthenticatedAgent(app, { username: 'mwpart', password: 'mwpass' });
      const res = await agent.get(`/hackathons/${hackathonId}/edit`);
      expect(res.status).toBe(200);
    });

    it('currently returns 403 for non-owner non-admin', async () => {
      const agent = await createAuthenticatedAgent(app, { username: 'mwjudge', password: 'mwpass' });
      const res = await agent.get(`/hackathons/${hackathonId}/edit`);
      expect(res.status).toBe(403);
    });

    it('currently returns 404 for nonexistent resource', async () => {
      const agent = await createAuthenticatedAgent(app, { username: 'mwpart', password: 'mwpass' });
      const res = await agent.get('/hackathons/99999/edit');
      expect(res.status).toBe(404);
    });
  });
});
