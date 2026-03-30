// green-baseline: captures existing behavior
// These tests verify input validation rules as a regression safety net.

const request = require('supertest');
const { extractCsrfToken, createAuthenticatedAgent, getCsrfToken } = require('../helpers/test-helpers');

let app;
let authAgent;
let hackathonId;

beforeAll(async () => {
  const database = require('../../src/config/database');
  database.initDatabase();

  const bcrypt = require('bcryptjs');
  const db = database.getDb();
  const hash = await bcrypt.hash('valpass', 10);
  db.prepare('INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)')
    .run('validationuser', 'validation@test.com', hash, 'admin');
  const userId = db.prepare('SELECT id FROM users WHERE username = ?').get('validationuser').id;

  const hackResult = db.prepare(
    'INSERT INTO hackathons (name, description, start_date, end_date, location, max_teams, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run('Validation Hack', 'For validation tests', '2024-06-01', '2024-06-03', 'Online', 10, 'upcoming', userId);
  hackathonId = Number(hackResult.lastInsertRowid);

  app = require('../../src/app');
  authAgent = await createAuthenticatedAgent(app, { username: 'validationuser', password: 'valpass' });
});

describe('Input Validation', () => {
  describe('Registration validation', () => {
    it('currently rejects empty username', async () => {
      const agent = request.agent(app);
      const page = await agent.get('/auth/register');
      const csrfToken = extractCsrfToken(page.text);

      const res = await agent
        .post('/auth/register')
        .type('form')
        .send({ username: '', email: 'valid@email.com', password: 'password123', _csrf: csrfToken });
      expect(res.status).toBe(400);
    });

    it('currently rejects invalid email format', async () => {
      const agent = request.agent(app);
      const page = await agent.get('/auth/register');
      const csrfToken = extractCsrfToken(page.text);

      const res = await agent
        .post('/auth/register')
        .type('form')
        .send({ username: 'emailvaltest', email: 'not-an-email', password: 'password123', _csrf: csrfToken });
      expect(res.status).toBe(400);
    });

    it('currently rejects short password (< 6 chars)', async () => {
      const agent = request.agent(app);
      const page = await agent.get('/auth/register');
      const csrfToken = extractCsrfToken(page.text);

      const res = await agent
        .post('/auth/register')
        .type('form')
        .send({ username: 'shortpwtest', email: 'short@pw.com', password: '12345', _csrf: csrfToken });
      expect(res.status).toBe(400);
    });

    it('currently rejects invalid role value', async () => {
      const agent = request.agent(app);
      const page = await agent.get('/auth/register');
      const csrfToken = extractCsrfToken(page.text);

      const res = await agent
        .post('/auth/register')
        .type('form')
        .send({ username: 'rolevaltest', email: 'role@val.com', password: 'password123', role: 'superuser', _csrf: csrfToken });
      expect(res.status).toBe(400);
    });
  });

  describe('Login validation', () => {
    it('currently rejects empty username', async () => {
      const agent = request.agent(app);
      const page = await agent.get('/auth/login');
      const csrfToken = extractCsrfToken(page.text);

      const res = await agent
        .post('/auth/login')
        .type('form')
        .send({ username: '', password: 'test', _csrf: csrfToken });
      expect(res.status).toBe(400);
    });

    it('currently rejects empty password', async () => {
      const agent = request.agent(app);
      const page = await agent.get('/auth/login');
      const csrfToken = extractCsrfToken(page.text);

      const res = await agent
        .post('/auth/login')
        .type('form')
        .send({ username: 'test', password: '', _csrf: csrfToken });
      expect(res.status).toBe(400);
    });
  });

  describe('Hackathon validation', () => {
    it('currently rejects missing name', async () => {
      const csrfToken = await getCsrfToken(authAgent, '/hackathons/new');

      const res = await authAgent
        .post('/hackathons')
        .type('form')
        .send({ name: '', description: 'Desc', start_date: '2024-10-01', end_date: '2024-10-03', _csrf: csrfToken });
      expect(res.status).toBe(400);
    });

    it('currently rejects missing description', async () => {
      const csrfToken = await getCsrfToken(authAgent, '/hackathons/new');

      const res = await authAgent
        .post('/hackathons')
        .type('form')
        .send({ name: 'Test Hack', description: '', start_date: '2024-10-01', end_date: '2024-10-03', _csrf: csrfToken });
      expect(res.status).toBe(400);
    });

    it('currently rejects invalid date format', async () => {
      const csrfToken = await getCsrfToken(authAgent, '/hackathons/new');

      const res = await authAgent
        .post('/hackathons')
        .type('form')
        .send({ name: 'Test Hack', description: 'Desc', start_date: 'not-a-date', end_date: '2024-10-03', _csrf: csrfToken });
      expect(res.status).toBe(400);
    });
  });

  describe('Team validation', () => {
    it('currently rejects missing team name', async () => {
      const csrfToken = await getCsrfToken(authAgent, `/hackathons/${hackathonId}/teams/new`);

      const res = await authAgent
        .post(`/hackathons/${hackathonId}/teams`)
        .type('form')
        .send({ name: '', project_name: 'Proj', _csrf: csrfToken });
      expect(res.status).toBe(400);
    });
  });

  describe('Submission validation', () => {
    it('currently rejects missing title', async () => {
      const csrfToken = await getCsrfToken(authAgent, `/hackathons/${hackathonId}/submissions/new`);

      const res = await authAgent
        .post(`/hackathons/${hackathonId}/submissions`)
        .type('form')
        .send({ title: '', team_id: 1, _csrf: csrfToken });
      expect(res.status).toBe(400);
    });

    it('currently rejects missing team_id', async () => {
      const csrfToken = await getCsrfToken(authAgent, `/hackathons/${hackathonId}/submissions/new`);

      const res = await authAgent
        .post(`/hackathons/${hackathonId}/submissions`)
        .type('form')
        .send({ title: 'Test Sub', _csrf: csrfToken });
      expect(res.status).toBe(400);
    });
  });
});
