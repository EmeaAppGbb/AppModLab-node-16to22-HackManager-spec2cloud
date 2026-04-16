import initSqlJs from 'sql.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db = null;
let dbPath = null;

// Wrapper that provides a better-sqlite3-compatible API over sql.js
function createPrepared(sqlJsDb, sql, saveFn) {
  return {
    all: function() {
      const params = Array.prototype.slice.call(arguments);
      const stmt = sqlJsDb.prepare(sql);
      if (params.length === 1 && typeof params[0] === 'object' && !Array.isArray(params[0])) {
        // Named params: convert {key: val} to {'@key': val}
        const named = {};
        const obj = params[0];
        for (const k in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, k)) {
            named['@' + k] = obj[k];
          }
        }
        stmt.bind(named);
      } else if (params.length > 0) {
        stmt.bind(params);
      }
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      return rows;
    },
    get: function() {
      const params = Array.prototype.slice.call(arguments);
      const stmt = sqlJsDb.prepare(sql);
      if (params.length === 1 && typeof params[0] === 'object' && !Array.isArray(params[0])) {
        const named = {};
        const obj = params[0];
        for (const k in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, k)) {
            named['@' + k] = obj[k];
          }
        }
        stmt.bind(named);
      } else if (params.length > 0) {
        stmt.bind(params);
      }
      let row = null;
      if (stmt.step()) {
        row = stmt.getAsObject();
      }
      stmt.free();
      return row;
    },
    run: function() {
      const params = Array.prototype.slice.call(arguments);
      if (params.length === 1 && typeof params[0] === 'object' && !Array.isArray(params[0])) {
        const named = {};
        const obj = params[0];
        for (const k in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, k)) {
            named['@' + k] = obj[k];
          }
        }
        sqlJsDb.run(sql, named);
      } else if (params.length > 0) {
        sqlJsDb.run(sql, params);
      } else {
        sqlJsDb.run(sql);
      }
      const changes = sqlJsDb.getRowsModified();
      // Get last insert rowid
      const lastStmt = sqlJsDb.prepare('SELECT last_insert_rowid() as id');
      lastStmt.step();
      const lastId = lastStmt.getAsObject().id;
      lastStmt.free();
      saveFn();
      return { changes: changes, lastInsertRowid: lastId };
    }
  };
}

function createDbWrapper(sqlJsDb, filePath) {
  const saveFn = function() {
    const data = sqlJsDb.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(filePath, buffer);
  };

  return {
    prepare: function(sql) {
      return createPrepared(sqlJsDb, sql, saveFn);
    },
    exec: function(sql) {
      sqlJsDb.run(sql);
      saveFn();
    },
    pragma: function(str) {
      try { sqlJsDb.run('PRAGMA ' + str); } catch(e) { /* sql.js may not support all pragmas */ }
    },
    transaction: function(fn) {
      return function() {
        const args = Array.prototype.slice.call(arguments);
        sqlJsDb.run('BEGIN TRANSACTION');
        try {
          fn.apply(null, args);
          sqlJsDb.run('COMMIT');
          saveFn();
        } catch(e) {
          sqlJsDb.run('ROLLBACK');
          throw e;
        }
      };
    },
    close: function() {
      saveFn();
      sqlJsDb.close();
    },
    save: saveFn
  };
}

// Async initialization
let _initPromise = null;

function initDatabaseAsync() {
  if (_initPromise) return _initPromise;

  _initPromise = initSqlJs().then(function(SQL) {
    const dataDir = path.join(__dirname, '..', '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    dbPath = path.join(dataDir, 'hackathon.db');

    let sqlJsDb;
    if (fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      sqlJsDb = new SQL.Database(fileBuffer);
    } else {
      sqlJsDb = new SQL.Database();
    }

    db = createDbWrapper(sqlJsDb, dbPath);

    // Create tables
    sqlJsDb.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'participant',
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);
    sqlJsDb.run(`
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
      )
    `);
    sqlJsDb.run(`
      CREATE TABLE IF NOT EXISTS teams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        hackathon_id INTEGER REFERENCES hackathons(id),
        project_name TEXT,
        project_description TEXT,
        repo_url TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);
    sqlJsDb.run(`
      CREATE TABLE IF NOT EXISTS participants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id),
        team_id INTEGER REFERENCES teams(id),
        hackathon_id INTEGER REFERENCES hackathons(id),
        role TEXT DEFAULT 'member',
        registered_at TEXT DEFAULT (datetime('now'))
      )
    `);
    sqlJsDb.run(`
      CREATE TABLE IF NOT EXISTS submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        team_id INTEGER REFERENCES teams(id),
        hackathon_id INTEGER REFERENCES hackathons(id),
        title TEXT NOT NULL,
        description TEXT,
        demo_url TEXT,
        repo_url TEXT,
        submitted_at TEXT DEFAULT (datetime('now'))
      )
    `);
    sqlJsDb.run(`
      CREATE TABLE IF NOT EXISTS judges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id),
        hackathon_id INTEGER REFERENCES hackathons(id)
      )
    `);
    sqlJsDb.run(`
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
      )
    `);

    db.save();
    console.log('Database initialized successfully');
    return db;
  });

  return _initPromise;
}

function getDb() { return db; }

export { getDb, initDatabaseAsync as initDatabase, initDatabaseAsync };
