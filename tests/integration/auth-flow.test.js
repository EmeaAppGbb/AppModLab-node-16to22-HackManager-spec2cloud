// green-baseline: captures existing behavior
// These tests verify the authentication HTTP flow as a regression safety net.
// Do NOT modify these tests to match new feature requirements — create new tests instead.

const request = require('supertest');
const { extractCsrfToken, createAuthenticatedAgent } = require('../helpers/test-helpers');

let app;

beforeAll(async () => {
  const database = require('../../src/config/database');
  database.initDatabase();

  const bcrypt = require('bcryptjs');
  const db = database.getDb();
  const hash = await bcrypt.hash('testpass123', 10);
  db.prepare('INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)')
    .run('authflowuser', 'authflow@example.com', hash, 'admin');

  app = require('../../src/app');
});

describe('Authentication Flow', () => {
  describe('Login page', () => {
    it('currently renders login form with CSRF token', async () => {
      const res = await request(app).get('/auth/login');
      expect(res.status).toBe(200);
      expect(res.text).toContain('Login');
      expect(res.text).toContain('_csrf');
    });
  });

  describe('Register page', () => {
    it('currently renders register form with CSRF token', async () => {
      const res = await request(app).get('/auth/register');
      expect(res.status).toBe(200);
      expect(res.text).toContain('_csrf');
    });
  });

  describe('Registration flow', () => {
    it('currently creates user and redirects to login on success', async () => {
      const agent = request.agent(app);
      const registerPage = await agent.get('/auth/register');
      const csrfToken = extractCsrfToken(registerPage.text);

      const res = await agent
        .post('/auth/register')
        .type('form')
        .send({
          username: 'integrationreg',
          email: 'integ@reg.com',
          password: 'Password1',
          confirm_password: 'Password1',
          role: 'participant',
          _csrf: csrfToken,
        });
      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/auth/login');
    });

    it('currently shows error for duplicate username', async () => {
      const agent = request.agent(app);
      const registerPage = await agent.get('/auth/register');
      const csrfToken = extractCsrfToken(registerPage.text);

      const res = await agent
        .post('/auth/register')
        .type('form')
        .send({
          username: 'authflowuser',
          email: 'unique@email.com',
          password: 'Password1',
          confirm_password: 'Password1',
          role: 'participant',
          _csrf: csrfToken,
        });
      expect(res.status).toBe(200);
      expect(res.text).toContain('Registration failed');
    });
  });

  describe('Login flow', () => {
    it('currently creates session and redirects to homepage on success', async () => {
      const agent = request.agent(app);
      const loginPage = await agent.get('/auth/login');
      const csrfToken = extractCsrfToken(loginPage.text);

      const res = await agent
        .post('/auth/login')
        .type('form')
        .send({ username: 'authflowuser', password: 'testpass123', _csrf: csrfToken });
      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/');
    });

    it('currently shows error for invalid credentials', async () => {
      const agent = request.agent(app);
      const loginPage = await agent.get('/auth/login');
      const csrfToken = extractCsrfToken(loginPage.text);

      const res = await agent
        .post('/auth/login')
        .type('form')
        .send({ username: 'authflowuser', password: 'wrongpassword', _csrf: csrfToken });
      expect(res.status).toBe(200);
      expect(res.text).toContain('Invalid username or password');
    });
  });

  describe('Session behavior', () => {
    it('currently shows username in navigation when logged in', async () => {
      const agent = await createAuthenticatedAgent(app, {
        username: 'authflowuser',
        password: 'testpass123',
      });
      const res = await agent.get('/');
      expect(res.status).toBe(200);
      expect(res.text).toContain('authflowuser');
    });
  });

  describe('Logout flow', () => {
    it('currently destroys session and redirects to homepage', async () => {
      const agent = await createAuthenticatedAgent(app, {
        username: 'authflowuser',
        password: 'testpass123',
      });

      const res = await agent.get('/auth/logout');
      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/');

      const protectedRes = await agent.get('/hackathons/new');
      expect(protectedRes.status).toBe(302);
      expect(protectedRes.headers.location).toContain('login');
    });
  });

  describe('CSRF protection', () => {
    it('currently includes CSRF token in all forms', async () => {
      // Verify CSRF tokens are present in forms (protection works in production)
      const loginRes = await request(app).get('/auth/login');
      expect(loginRes.text).toContain('name="_csrf"');
      const registerRes = await request(app).get('/auth/register');
      expect(registerRes.text).toContain('name="_csrf"');
    });
  });
});
