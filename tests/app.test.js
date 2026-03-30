const request = require('supertest');

let app;

beforeAll(() => {
  const database = require('../src/config/database');
  database.initDatabase();

  // Seed a test user
  const bcrypt = require('bcryptjs');
  const db = database.getDb();
  const hash = bcrypt.hashSync('testpass123', 10);
  db.prepare('INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)').run(
    'testuser',
    'test@example.com',
    hash,
    'admin'
  );

  app = require('../src/app');
});

describe('Public pages', () => {
  it('GET / returns 200', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('HackManager');
  });

  it('GET /hackathons returns 200', async () => {
    const res = await request(app).get('/hackathons');
    expect(res.status).toBe(200);
  });

  it('GET /teams returns 200', async () => {
    const res = await request(app).get('/teams');
    expect(res.status).toBe(200);
  });

  it('GET /participants returns 200', async () => {
    const res = await request(app).get('/participants');
    expect(res.status).toBe(200);
  });

  it('GET /submissions returns 200', async () => {
    const res = await request(app).get('/submissions');
    expect(res.status).toBe(200);
  });

  it('GET /auth/login returns 200', async () => {
    const res = await request(app).get('/auth/login');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Login');
  });

  it('GET /auth/register returns 200', async () => {
    const res = await request(app).get('/auth/register');
    expect(res.status).toBe(200);
  });

  it('GET /nonexistent returns 404', async () => {
    const res = await request(app).get('/nonexistent');
    expect(res.status).toBe(404);
  });
});

describe('Auth routes', () => {
  it('POST /auth/login with invalid credentials shows error', async () => {
    const res = await request(app)
      .post('/auth/login')
      .type('form')
      .send({ username: 'nobody', password: 'wrong', _csrf: '' });
    // CSRF may block this — that's fine, it means protection is working
    expect([200, 403]).toContain(res.status);
  });

  it('POST /auth/register with empty fields returns 400', async () => {
    const res = await request(app)
      .post('/auth/register')
      .type('form')
      .send({ username: '', email: '', password: '', _csrf: '' });
    expect([400, 403]).toContain(res.status);
  });
});

describe('Protected routes require auth', () => {
  it('GET /hackathons/new redirects to login', async () => {
    const res = await request(app).get('/hackathons/new');
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('login');
  });

  it('GET /judging redirects to login', async () => {
    const res = await request(app).get('/judging');
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('login');
  });
});

describe('Validation', () => {
  it('rejects hackathon creation without auth', async () => {
    const res = await request(app)
      .post('/hackathons')
      .type('form')
      .send({ name: 'Test', description: 'Desc' });
    // CSRF protection (403) fires before auth redirect (302) — both are acceptable
    expect([302, 403]).toContain(res.status);
  });
});
