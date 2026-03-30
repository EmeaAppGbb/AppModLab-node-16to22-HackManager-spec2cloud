// green-baseline: captures existing behavior
// These tests verify submission HTTP flow as a regression safety net.

const request = require('supertest');
const { createAuthenticatedAgent, getCsrfToken } = require('../helpers/test-helpers');

let app;
let authAgent;
let hackathonId;
let teamId;

beforeAll(async () => {
  const database = require('../../src/config/database');
  database.initDatabase();

  const bcrypt = require('bcryptjs');
  const db = database.getDb();
  const hash = await bcrypt.hash('subpass', 10);
  db.prepare('INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)')
    .run('subflowuser', 'subflow@test.com', hash, 'admin');
  const userId = db.prepare('SELECT id FROM users WHERE username = ?').get('subflowuser').id;

  const hackResult = db.prepare(
    'INSERT INTO hackathons (name, description, start_date, end_date, location, max_teams, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run('Sub Flow Hack', 'For submission flow', '2024-06-01', '2024-06-03', 'Online', 10, 'upcoming', userId);
  hackathonId = Number(hackResult.lastInsertRowid);

  const teamResult = db.prepare(
    'INSERT INTO teams (name, hackathon_id, project_name) VALUES (?, ?, ?)'
  ).run('Sub Flow Team', hackathonId, 'Sub Project');
  teamId = Number(teamResult.lastInsertRowid);

  app = require('../../src/app');
  authAgent = await createAuthenticatedAgent(app, { username: 'subflowuser', password: 'subpass' });
});

describe('Submission Flow Integration', () => {
  let submissionId;

  describe('GET /submissions', () => {
    it('currently lists submissions without auth', async () => {
      const res = await request(app).get('/submissions');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /hackathons/:hackathonId/submissions/new', () => {
    it('currently requires auth', async () => {
      const res = await request(app).get(`/hackathons/${hackathonId}/submissions/new`);
      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('login');
    });

    it('currently renders form when authenticated', async () => {
      const res = await authAgent.get(`/hackathons/${hackathonId}/submissions/new`);
      expect(res.status).toBe(200);
      expect(res.text).toContain('_csrf');
    });

    it('currently returns 404 for nonexistent hackathon', async () => {
      const res = await authAgent.get('/hackathons/99999/submissions/new');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /hackathons/:hackathonId/submissions', () => {
    it('currently creates submission and redirects to detail page', async () => {
      const csrfToken = await getCsrfToken(authAgent, `/hackathons/${hackathonId}/submissions/new`);

      const res = await authAgent
        .post(`/hackathons/${hackathonId}/submissions`)
        .type('form')
        .send({
          title: 'Flow Submission',
          description: 'A flow submission',
          demo_url: 'https://demo.example.com',
          repo_url: 'https://github.com/test/flow',
          team_id: teamId,
          _csrf: csrfToken,
        });
      expect(res.status).toBe(302);
      expect(res.headers.location).toMatch(/^\/submissions\/\d+$/);
      submissionId = res.headers.location.split('/').pop();
    });
  });

  describe('GET /submissions/:id', () => {
    it('currently shows submission detail without auth', async () => {
      const res = await request(app).get(`/submissions/${submissionId}`);
      expect(res.status).toBe(200);
      expect(res.text).toContain('Flow Submission');
    });

    it('currently returns 404 for nonexistent submission', async () => {
      const res = await request(app).get('/submissions/99999');
      expect(res.status).toBe(404);
    });
  });
});
