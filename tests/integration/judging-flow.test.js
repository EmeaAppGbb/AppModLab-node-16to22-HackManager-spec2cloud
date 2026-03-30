// green-baseline: captures existing behavior
// These tests verify judging/scoring HTTP flow as a regression safety net.

const request = require('supertest');
const { createAuthenticatedAgent, getCsrfToken } = require('../helpers/test-helpers');

let app;
let judgeAgent;
let participantAgent;
let submissionId;

beforeAll(async () => {
  const database = require('../../src/config/database');
  database.initDatabase();

  const bcrypt = require('bcryptjs');
  const db = database.getDb();

  const judgeHash = await bcrypt.hash('judgepass', 10);
  db.prepare('INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)')
    .run('judgingflowjudge', 'judgingflow@judge.com', judgeHash, 'judge');

  const partHash = await bcrypt.hash('partpass', 10);
  db.prepare('INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)')
    .run('judgingflowpart', 'judgingflow@part.com', partHash, 'participant');

  const userId = db.prepare('SELECT id FROM users WHERE username = ?').get('judgingflowjudge').id;

  const hackResult = db.prepare(
    'INSERT INTO hackathons (name, description, start_date, end_date, location, max_teams, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run('Judging Flow Hack', 'For judging flow', '2024-06-01', '2024-06-03', 'Online', 10, 'upcoming', userId);
  const hackathonId = Number(hackResult.lastInsertRowid);

  const teamResult = db.prepare('INSERT INTO teams (name, hackathon_id) VALUES (?, ?)').run('Judging Flow Team', hackathonId);
  const teamId = Number(teamResult.lastInsertRowid);

  const subResult = db.prepare(
    'INSERT INTO submissions (team_id, hackathon_id, title, description) VALUES (?, ?, ?, ?)'
  ).run(teamId, hackathonId, 'Judging Flow Sub', 'A submission for judging');
  submissionId = Number(subResult.lastInsertRowid);

  app = require('../../src/app');
  judgeAgent = await createAuthenticatedAgent(app, { username: 'judgingflowjudge', password: 'judgepass' });
  participantAgent = await createAuthenticatedAgent(app, { username: 'judgingflowpart', password: 'partpass' });
});

describe('Judging Flow Integration', () => {
  describe('GET /judging', () => {
    it('currently requires authentication', async () => {
      const res = await request(app).get('/judging');
      expect(res.status).toBe(302);
      expect(res.headers.location).toContain('login');
    });

    it('currently lists submissions when authenticated', async () => {
      const res = await judgeAgent.get('/judging');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /submissions/:id/judge', () => {
    it('currently requires judge role', async () => {
      const res = await participantAgent.get(`/submissions/${submissionId}/judge`);
      expect(res.status).toBe(403);
    });

    it('currently renders scoring form for judge', async () => {
      const res = await judgeAgent.get(`/submissions/${submissionId}/judge`);
      expect(res.status).toBe(200);
      expect(res.text).toContain('Judging Flow Sub');
    });

    it('currently returns 404 for nonexistent submission', async () => {
      const res = await judgeAgent.get('/submissions/99999/judge');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /submissions/:id/score', () => {
    it('currently requires judge role', async () => {
      const csrfToken = await getCsrfToken(participantAgent, '/');
      const res = await participantAgent
        .post(`/submissions/${submissionId}/score`)
        .type('form')
        .send({
          innovation: 5, technical: 5, presentation: 5, impact: 5,
          comments: 'test', _csrf: csrfToken,
        });
      expect(res.status).toBe(403);
    });

    it('currently creates score and redirects to judging list', async () => {
      const csrfToken = await getCsrfToken(judgeAgent, `/submissions/${submissionId}/judge`);

      const res = await judgeAgent
        .post(`/submissions/${submissionId}/score`)
        .type('form')
        .send({
          innovation: 8, technical: 7, presentation: 9, impact: 6,
          comments: 'Good project', _csrf: csrfToken,
        });
      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/judging');
    });
  });
});
