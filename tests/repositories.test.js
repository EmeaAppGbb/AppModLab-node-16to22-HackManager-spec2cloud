let repos;
let db;

beforeAll(() => {
  const database = require('../src/config/database');
  database.initDatabase();
  db = database.getDb();
  repos = require('../src/repositories');
});

describe('userRepo', () => {
  it('creates and finds a user', () => {
    const bcrypt = require('bcryptjs');
    const hash = bcrypt.hashSync('pass123', 10);
    repos.userRepo.create('repotest', 'repo@test.com', hash, 'participant');
    const user = repos.userRepo.findByUsername('repotest');
    expect(user).toBeDefined();
    expect(user.email).toBe('repo@test.com');
    expect(user.role).toBe('participant');
  });

  it('returns undefined for nonexistent user', () => {
    const user = repos.userRepo.findByUsername('nonexistent');
    expect(user).toBeUndefined();
  });
});

describe('hackathonRepo', () => {
  let hackathonId;

  it('creates a hackathon', () => {
    const result = repos.hackathonRepo.create({
      name: 'Test Hack',
      description: 'A test hackathon',
      start_date: '2024-06-01',
      end_date: '2024-06-03',
      location: 'Online',
      max_teams: 10,
      status: 'upcoming',
      created_by: 1,
    });
    hackathonId = result.lastInsertRowid;
    expect(hackathonId).toBeGreaterThan(0);
  });

  it('finds all hackathons', () => {
    const all = repos.hackathonRepo.findAll();
    expect(all.length).toBeGreaterThanOrEqual(1);
  });

  it('finds by id', () => {
    const h = repos.hackathonRepo.findById(hackathonId);
    expect(h).toBeDefined();
    expect(h.name).toBe('Test Hack');
  });

  it('updates a hackathon', () => {
    repos.hackathonRepo.update(hackathonId, {
      name: 'Updated Hack',
      description: 'Updated',
      start_date: '2024-06-01',
      end_date: '2024-06-05',
      location: 'NYC',
      max_teams: 20,
      status: 'active',
    });
    const h = repos.hackathonRepo.findById(hackathonId);
    expect(h.name).toBe('Updated Hack');
    expect(h.status).toBe('active');
  });

  it('counts hackathons', () => {
    const count = repos.hackathonRepo.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  it('deletes a hackathon', () => {
    repos.hackathonRepo.delete(hackathonId);
    const h = repos.hackathonRepo.findById(hackathonId);
    expect(h).toBeUndefined();
  });
});

describe('teamRepo', () => {
  it('returns empty array when no teams', () => {
    const teams = repos.teamRepo.findAll();
    expect(Array.isArray(teams)).toBe(true);
  });

  it('counts teams', () => {
    const count = repos.teamRepo.count();
    expect(typeof count).toBe('number');
  });
});

describe('participantRepo', () => {
  it('returns empty array when no participants', () => {
    const participants = repos.participantRepo.findAll();
    expect(Array.isArray(participants)).toBe(true);
  });

  it('counts participants', () => {
    const count = repos.participantRepo.count();
    expect(typeof count).toBe('number');
  });
});
