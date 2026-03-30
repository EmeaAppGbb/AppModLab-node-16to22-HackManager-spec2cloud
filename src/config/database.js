const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

let db = null;

function initDatabase() {
  // Ensure data directory exists
  const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '..', '..', 'data', 'hackathon.db');
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  db = new Database(dbPath);

  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL');

  // Enable foreign key enforcement
  db.pragma('foreign_keys = ON');

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'participant',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS hackathons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      location TEXT,
      max_teams INTEGER DEFAULT 10,
      status TEXT DEFAULT 'upcoming',
      created_by INTEGER REFERENCES users(id),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      hackathon_id INTEGER REFERENCES hackathons(id),
      project_name TEXT,
      project_description TEXT,
      repo_url TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      team_id INTEGER REFERENCES teams(id),
      hackathon_id INTEGER REFERENCES hackathons(id),
      role TEXT DEFAULT 'member',
      registered_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id INTEGER REFERENCES teams(id),
      hackathon_id INTEGER REFERENCES hackathons(id),
      title TEXT NOT NULL,
      description TEXT,
      demo_url TEXT,
      repo_url TEXT,
      submitted_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS judges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      hackathon_id INTEGER REFERENCES hackathons(id)
    );

    CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      submission_id INTEGER REFERENCES submissions(id),
      judge_id INTEGER REFERENCES judges(id),
      innovation INTEGER DEFAULT 0,
      technical INTEGER DEFAULT 0,
      presentation INTEGER DEFAULT 0,
      impact INTEGER DEFAULT 0,
      overall REAL DEFAULT 0,
      comments TEXT,
      scored_at TEXT DEFAULT (datetime('now'))
    );
  `);

  logger.info('Database initialized successfully');
  return db;
}

module.exports = {
  getDb: function() { return db; },
  initDatabase: initDatabase
};
