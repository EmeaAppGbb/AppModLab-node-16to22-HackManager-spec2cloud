import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Clean up test database before tests
const dataDir = join(__dirname, '..', '..', 'data');
const dbPath = join(dataDir, 'hackathon.db');

describe('Database Module', () => {
  let database;

  before(async () => {
    // Remove existing DB to test fresh init
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
    database = await import('../config/database.js');
    await database.initDatabase();
  });

  it('should initialize database successfully', () => {
    const db = database.getDb();
    assert.ok(db, 'Database should be initialized');
  });

  it('should create all required tables', () => {
    const db = database.getDb();
    const tables = ['users', 'hackathons', 'teams', 'participants', 'submissions', 'judges', 'scores'];

    for (const table of tables) {
      const result = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(table);
      assert.ok(result, `Table '${table}' should exist`);
    }
  });

  it('should support INSERT and SELECT operations', () => {
    const db = database.getDb();

    const result = db.prepare(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)'
    ).run('testuser', 'test@example.com', 'hashedpass', 'participant');

    assert.ok(result.lastInsertRowid, 'Should return lastInsertRowid');

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get('testuser');
    assert.equal(user.username, 'testuser');
    assert.equal(user.email, 'test@example.com');
    assert.equal(user.role, 'participant');
  });

  it('should support COUNT queries', () => {
    const db = database.getDb();
    const count = db.prepare('SELECT COUNT(*) as count FROM users').get();
    assert.ok(count.count >= 1, 'Should have at least 1 user');
  });
});

describe('Node 22 Features', () => {
  it('should have global structuredClone available', () => {
    const obj = { a: 1, b: { c: 2 } };
    const clone = structuredClone(obj);
    assert.deepEqual(clone, obj);
    assert.notEqual(clone.b, obj.b); // Different reference
  });

  it('should have global fetch available', () => {
    assert.equal(typeof fetch, 'function', 'Global fetch should be available');
  });

  it('should support ESM import.meta.url', () => {
    assert.ok(import.meta.url, 'import.meta.url should be defined');
    assert.ok(import.meta.url.startsWith('file://'), 'Should be a file URL');
  });
});

describe('Express App Module', () => {
  it('should import app module without errors', async () => {
    // Just verify the module structure loads
    const indexRoutes = await import('../routes/index.js');
    assert.ok(indexRoutes.default, 'Should export a default router');
  });

  it('should import auth middleware', async () => {
    const auth = await import('../middleware/auth.js');
    assert.equal(typeof auth.requireAuth, 'function');
    assert.equal(typeof auth.requireJudge, 'function');
  });
});
