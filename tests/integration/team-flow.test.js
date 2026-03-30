// green-baseline: captures existing behavior
// These tests verify team management HTTP flow as a regression safety net.

const request = require('supertest');
const { createAuthenticatedAgent, getCsrfToken } = require('../helpers/test-helpers');

let app;
let authAgent;
let hackathonId;

beforeAll(async () => {
  const database = require('../../src/config/database');
  database.initDatabase();

  const bcrypt = require('bcryptjs');
  const db = database.getDb();
  const hash = await bcrypt.hash('teampass', 10);
  db.prepare('INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)')
    .run('teamflowuser', 'teamflow@test.com', hash, 'admin');
  const userId = db.prepare('SELECT id FROM users WHERE username = ?').get('teamflowuser').id;

  const result = db.prepare(
    'INSERT INTO hackathons (name, description, start_date, end_date, location, max_teams, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run('Team Flow Hack', 'For team flow tests', '2024-06-01', '2024-06-03', 'Online', 10, 'upcoming', userId);
  hackathonId = Number(result.lastInsertRowid);

  app = require('../../src/app');
  authAgent = await createAuthenticatedAgent(app, { username: 'teamflowuser', password: 'teampass' });
});

describe('Team Flow Integration', () => {
  let teamId;

  describe('GET /teams', () => {
    it('currently lists teams without auth', async () => {
      const res = await request(app).get('/teams');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /hackathons/:hackathonId/teams/new', () => {
    it('currently requires auth', async () => {
      const res = await request(app).get(`/hackathons/${hackathonId}/teams/new`);
      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('login');
    });

    it('currently renders form when authenticated', async () => {
      const res = await authAgent.get(`/hackathons/${hackathonId}/teams/new`);
      expect(res.status).toBe(200);
      expect(res.text).toContain('_csrf');
    });

    it('currently returns 404 for nonexistent hackathon', async () => {
      const res = await authAgent.get('/hackathons/99999/teams/new');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /hackathons/:hackathonId/teams', () => {
    it('currently creates team and redirects to detail page', async () => {
      const csrfToken = await getCsrfToken(authAgent, `/hackathons/${hackathonId}/teams/new`);

      const res = await authAgent
        .post(`/hackathons/${hackathonId}/teams`)
        .type('form')
        .send({
          name: 'Flow Team',
          project_name: 'Flow Project',
          project_description: 'A flow project',
          repo_url: 'https://github.com/test/flow',
          _csrf: csrfToken,
        });
      expect(res.status).toBe(302);
      expect(res.headers.location).toMatch(/^\/teams\/\d+$/);
      teamId = res.headers.location.split('/').pop();
    });
  });

  describe('GET /teams/:id', () => {
    it('currently shows team detail with hackathon info', async () => {
      const res = await request(app).get(`/teams/${teamId}`);
      expect(res.status).toBe(200);
      expect(res.text).toContain('Flow Team');
    });

    it('currently returns 404 for nonexistent team', async () => {
      const res = await request(app).get('/teams/99999');
      expect(res.status).toBe(404);
    });
  });
});
