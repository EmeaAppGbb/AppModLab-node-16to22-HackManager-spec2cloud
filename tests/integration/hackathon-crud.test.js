// green-baseline: captures existing behavior
// These tests verify hackathon CRUD HTTP flow as a regression safety net.

const request = require('supertest');
const { createAuthenticatedAgent, getCsrfToken } = require('../helpers/test-helpers');

let app;
let adminAgent;

beforeAll(async () => {
  const database = require('../../src/config/database');
  database.initDatabase();

  const bcrypt = require('bcryptjs');
  const db = database.getDb();
  const hash = await bcrypt.hash('adminpass', 10);
  db.prepare('INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)')
    .run('hackcrudadmin', 'hackcrud@admin.com', hash, 'admin');

  app = require('../../src/app');
  adminAgent = await createAuthenticatedAgent(app, { username: 'hackcrudadmin', password: 'adminpass' });
});

describe('Hackathon CRUD Integration', () => {
  let hackathonId;

  describe('GET /hackathons', () => {
    it('currently lists hackathons without auth', async () => {
      const res = await request(app).get('/hackathons');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /hackathons/new', () => {
    it('currently requires authentication', async () => {
      const res = await request(app).get('/hackathons/new');
      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('login');
    });

    it('currently renders form when authenticated', async () => {
      const res = await adminAgent.get('/hackathons/new');
      expect(res.status).toBe(200);
      expect(res.text).toContain('_csrf');
    });
  });

  describe('POST /hackathons', () => {
    it('currently creates hackathon and redirects to detail page', async () => {
      const csrfToken = await getCsrfToken(adminAgent, '/hackathons/new');

      const res = await adminAgent
        .post('/hackathons')
        .type('form')
        .send({
          name: 'CRUD Integration Hack',
          description: 'An integration test hackathon',
          start_date: '2024-10-01',
          end_date: '2024-10-03',
          location: 'Test City',
          max_teams: 10,
          status: 'upcoming',
          _csrf: csrfToken,
        });
      expect(res.status).toBe(302);
      expect(res.headers.location).toMatch(/^\/hackathons\/\d+$/);
      hackathonId = res.headers.location.split('/').pop();
    });

    it('currently rejects creation without auth', async () => {
      const res = await request(app)
        .post('/hackathons')
        .type('form')
        .send({ name: 'Unauthorized', description: 'Should fail' });
      expect([302, 403]).toContain(res.status);
    });
  });

  describe('GET /hackathons/:id', () => {
    it('currently shows hackathon detail without auth', async () => {
      const res = await request(app).get(`/hackathons/${hackathonId}`);
      expect(res.status).toBe(200);
      expect(res.text).toContain('CRUD Integration Hack');
    });

    it('currently returns 404 for nonexistent hackathon', async () => {
      const res = await request(app).get('/hackathons/99999');
      expect(res.status).toBe(404);
    });
  });

  describe('GET /hackathons/:id/edit', () => {
    it('currently requires authentication', async () => {
      const res = await request(app).get(`/hackathons/${hackathonId}/edit`);
      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('login');
    });

    it('currently allows admin to edit any hackathon', async () => {
      const res = await adminAgent.get(`/hackathons/${hackathonId}/edit`);
      expect(res.status).toBe(200);
    });
  });

  describe('POST /hackathons/:id/update', () => {
    it('currently updates hackathon and redirects to detail', async () => {
      const csrfToken = await getCsrfToken(adminAgent, `/hackathons/${hackathonId}/edit`);

      const res = await adminAgent
        .post(`/hackathons/${hackathonId}/update`)
        .type('form')
        .send({
          name: 'Updated CRUD Hack',
          description: 'Updated description',
          start_date: '2024-10-01',
          end_date: '2024-10-05',
          location: 'Updated City',
          max_teams: 20,
          status: 'active',
          _csrf: csrfToken,
        });
      expect(res.status).toBe(302);
      expect(res.headers.location).toBe(`/hackathons/${hackathonId}`);
    });
  });

  describe('POST /hackathons/:id/delete', () => {
    it('currently deletes hackathon and redirects to list', async () => {
      let csrfToken = await getCsrfToken(adminAgent, '/hackathons/new');
      const createRes = await adminAgent
        .post('/hackathons')
        .type('form')
        .send({
          name: 'CRUD Delete Target',
          description: 'Will be deleted',
          start_date: '2024-11-01',
          end_date: '2024-11-03',
          location: 'Nowhere',
          max_teams: 5,
          status: 'upcoming',
          _csrf: csrfToken,
        });
      const deleteId = createRes.headers.location.split('/').pop();

      csrfToken = await getCsrfToken(adminAgent, `/hackathons/${deleteId}`);
      const res = await adminAgent
        .post(`/hackathons/${deleteId}/delete`)
        .type('form')
        .send({ _csrf: csrfToken });
      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/hackathons');

      const getRes = await request(app).get(`/hackathons/${deleteId}`);
      expect(getRes.status).toBe(404);
    });
  });
});
