const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'hackathon.db');
const db = new Database(dbPath);

// Enable WAL mode and foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─── Create Tables ──────────────────────────────────────────────────────────

console.log('Creating tables...');

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

// ─── Clear Existing Data ────────────────────────────────────────────────────

console.log('Clearing existing data...');

db.exec(`
  DELETE FROM scores;
  DELETE FROM judges;
  DELETE FROM submissions;
  DELETE FROM participants;
  DELETE FROM teams;
  DELETE FROM hackathons;
  DELETE FROM users;
`);

// ─── Seed Users ─────────────────────────────────────────────────────────────

console.log('Seeding users...');

const insertUser = db.prepare(`
  INSERT INTO users (username, email, password, role)
  VALUES (@username, @email, @password, @role)
`);

const users = [
  { username: 'admin', email: 'admin@hackmanager.com', password: bcrypt.hashSync('admin123', 10), role: 'admin' },
  { username: 'judge_sarah', email: 'sarah@example.com', password: bcrypt.hashSync('judge123', 10), role: 'judge' },
  { username: 'judge_mike', email: 'mike@example.com', password: bcrypt.hashSync('judge123', 10), role: 'judge' },
  { username: 'alice_dev', email: 'alice@example.com', password: bcrypt.hashSync('pass123', 10), role: 'participant' },
  { username: 'bob_coder', email: 'bob@example.com', password: bcrypt.hashSync('pass123', 10), role: 'participant' },
  { username: 'carol_hacker', email: 'carol@example.com', password: bcrypt.hashSync('pass123', 10), role: 'participant' },
  { username: 'dave_maker', email: 'dave@example.com', password: bcrypt.hashSync('pass123', 10), role: 'participant' },
  { username: 'eve_builder', email: 'eve@example.com', password: bcrypt.hashSync('pass123', 10), role: 'participant' }
];

const insertUsers = db.transaction((items) => {
  for (let i = 0; i < items.length; i++) {
    insertUser.run(items[i]);
  }
});

insertUsers(users);
console.log('  -> ' + users.length + ' users inserted');

// ─── Seed Hackathons ────────────────────────────────────────────────────────

console.log('Seeding hackathons...');

const insertHackathon = db.prepare(`
  INSERT INTO hackathons (name, description, start_date, end_date, location, max_teams, status, created_by)
  VALUES (@name, @description, @start_date, @end_date, @location, @max_teams, @status, @created_by)
`);

const hackathons = [
  {
    name: 'AI Innovation Challenge 2023',
    description: 'Push the boundaries of artificial intelligence! Build innovative AI-powered solutions that solve real-world problems. Open to all skill levels.',
    start_date: '2023-09-15',
    end_date: '2023-09-17',
    location: 'San Francisco, CA',
    max_teams: 8,
    status: 'completed',
    created_by: 1
  },
  {
    name: 'Green Tech Hackathon',
    description: 'Hack for the planet! Create technology solutions that address environmental challenges and promote sustainability.',
    start_date: '2024-06-01',
    end_date: '2024-06-03',
    location: 'Austin, TX',
    max_teams: 10,
    status: 'active',
    created_by: 1
  },
  {
    name: 'Future of Web Dev',
    description: 'Explore the cutting edge of web development. Build next-generation web applications using the latest frameworks and technologies.',
    start_date: '2025-01-20',
    end_date: '2025-01-22',
    location: 'Seattle, WA',
    max_teams: 12,
    status: 'upcoming',
    created_by: 1
  }
];

const insertHackathons = db.transaction((items) => {
  for (let i = 0; i < items.length; i++) {
    insertHackathon.run(items[i]);
  }
});

insertHackathons(hackathons);
console.log('  -> ' + hackathons.length + ' hackathons inserted');

// ─── Seed Teams ─────────────────────────────────────────────────────────────

console.log('Seeding teams...');

const insertTeam = db.prepare(`
  INSERT INTO teams (name, hackathon_id, project_name, project_description, repo_url)
  VALUES (@name, @hackathon_id, @project_name, @project_description, @repo_url)
`);

const teams = [
  {
    name: 'Neural Nexus',
    hackathon_id: 1,
    project_name: 'AI-Powered Code Review',
    project_description: 'An intelligent code review assistant that uses NLP to detect bugs, suggest improvements, and enforce coding standards automatically.',
    repo_url: 'https://github.com/neural-nexus/ai-code-review'
  },
  {
    name: 'DataDreamers',
    hackathon_id: 1,
    project_name: 'Smart Data Pipeline',
    project_description: 'A self-optimizing ETL pipeline that uses machine learning to automatically clean, transform, and route data streams.',
    repo_url: 'https://github.com/datadreamers/smart-pipeline'
  },
  {
    name: 'EcoCoders',
    hackathon_id: 2,
    project_name: 'Carbon Footprint Tracker',
    project_description: 'A mobile-first web app that tracks and visualizes personal carbon emissions with actionable suggestions for reduction.',
    repo_url: 'https://github.com/ecocoders/carbon-tracker'
  },
  {
    name: 'GreenBytes',
    hackathon_id: 2,
    project_name: 'Sustainable Supply Chain',
    project_description: 'A blockchain-backed platform that scores supply chain sustainability and helps businesses make greener sourcing decisions.',
    repo_url: 'https://github.com/greenbytes/sustainable-supply'
  },
  {
    name: 'WebWizards',
    hackathon_id: 3,
    project_name: 'Next-Gen CMS',
    project_description: 'A headless CMS with real-time collaboration, AI-assisted content generation, and built-in edge deployment.',
    repo_url: 'https://github.com/webwizards/nextgen-cms'
  }
];

const insertTeams = db.transaction((items) => {
  for (let i = 0; i < items.length; i++) {
    insertTeam.run(items[i]);
  }
});

insertTeams(teams);
console.log('  -> ' + teams.length + ' teams inserted');

// ─── Seed Participants ──────────────────────────────────────────────────────

console.log('Seeding participants...');

const insertParticipant = db.prepare(`
  INSERT INTO participants (user_id, team_id, hackathon_id, role)
  VALUES (@user_id, @team_id, @hackathon_id, @role)
`);

const participants = [
  // Hackathon 1 — Neural Nexus
  { user_id: 4, team_id: 1, hackathon_id: 1, role: 'leader' },   // alice_dev
  { user_id: 5, team_id: 1, hackathon_id: 1, role: 'member' },   // bob_coder
  // Hackathon 1 — DataDreamers
  { user_id: 6, team_id: 2, hackathon_id: 1, role: 'leader' },   // carol_hacker
  { user_id: 7, team_id: 2, hackathon_id: 1, role: 'member' },   // dave_maker
  // Hackathon 2 — EcoCoders
  { user_id: 4, team_id: 3, hackathon_id: 2, role: 'leader' },   // alice_dev
  { user_id: 8, team_id: 3, hackathon_id: 2, role: 'member' },   // eve_builder
  // Hackathon 2 — GreenBytes
  { user_id: 5, team_id: 4, hackathon_id: 2, role: 'leader' },   // bob_coder
  { user_id: 6, team_id: 4, hackathon_id: 2, role: 'member' },   // carol_hacker
  // Hackathon 3 — WebWizards
  { user_id: 7, team_id: 5, hackathon_id: 3, role: 'leader' },   // dave_maker
  { user_id: 8, team_id: 5, hackathon_id: 3, role: 'member' }    // eve_builder
];

const insertParticipants = db.transaction((items) => {
  for (let i = 0; i < items.length; i++) {
    insertParticipant.run(items[i]);
  }
});

insertParticipants(participants);
console.log('  -> ' + participants.length + ' participants inserted');

// ─── Seed Submissions ───────────────────────────────────────────────────────

console.log('Seeding submissions...');

const insertSubmission = db.prepare(`
  INSERT INTO submissions (team_id, hackathon_id, title, description, demo_url, repo_url, submitted_at)
  VALUES (@team_id, @hackathon_id, @title, @description, @demo_url, @repo_url, @submitted_at)
`);

const submissions = [
  {
    team_id: 1,
    hackathon_id: 1,
    title: 'AI-Powered Code Review',
    description: 'Our tool uses a fine-tuned GPT model to analyze pull requests, detect potential bugs, and suggest idiomatic improvements. It integrates directly with GitHub via a bot that comments on PRs in real time.',
    demo_url: 'https://ai-code-review-demo.herokuapp.com',
    repo_url: 'https://github.com/neural-nexus/ai-code-review',
    submitted_at: '2023-09-17 14:30:00'
  },
  {
    team_id: 2,
    hackathon_id: 1,
    title: 'Smart Data Pipeline',
    description: 'A self-healing data pipeline that uses anomaly detection to automatically fix data quality issues. Features a visual DAG editor and real-time monitoring dashboard.',
    demo_url: 'https://smart-pipeline-demo.herokuapp.com',
    repo_url: 'https://github.com/datadreamers/smart-pipeline',
    submitted_at: '2023-09-17 15:00:00'
  },
  {
    team_id: 3,
    hackathon_id: 2,
    title: 'Carbon Footprint Tracker',
    description: 'Track your daily carbon footprint with our intuitive mobile-first app. Connects to utility providers, transit APIs, and shopping history to give you a complete picture of your environmental impact.',
    demo_url: 'https://carbon-tracker-demo.netlify.app',
    repo_url: 'https://github.com/ecocoders/carbon-tracker',
    submitted_at: '2024-06-03 12:00:00'
  }
];

const insertSubmissions = db.transaction((items) => {
  for (let i = 0; i < items.length; i++) {
    insertSubmission.run(items[i]);
  }
});

insertSubmissions(submissions);
console.log('  -> ' + submissions.length + ' submissions inserted');

// ─── Seed Judges ────────────────────────────────────────────────────────────

console.log('Seeding judges...');

const insertJudge = db.prepare(`
  INSERT INTO judges (user_id, hackathon_id)
  VALUES (@user_id, @hackathon_id)
`);

const judgeRecords = [
  { user_id: 2, hackathon_id: 1 },  // judge_sarah for AI Innovation Challenge
  { user_id: 3, hackathon_id: 1 }   // judge_mike for AI Innovation Challenge
];

const insertJudges = db.transaction((items) => {
  for (let i = 0; i < items.length; i++) {
    insertJudge.run(items[i]);
  }
});

insertJudges(judgeRecords);
console.log('  -> ' + judgeRecords.length + ' judges inserted');

// ─── Seed Scores ────────────────────────────────────────────────────────────

console.log('Seeding scores...');

const insertScore = db.prepare(`
  INSERT INTO scores (submission_id, judge_id, innovation, technical, presentation, impact, overall, comments, scored_at)
  VALUES (@submission_id, @judge_id, @innovation, @technical, @presentation, @impact, @overall, @comments, @scored_at)
`);

const scores = [
  // Judge Sarah (judge_id=1) scores for submission 1 (Neural Nexus)
  {
    submission_id: 1,
    judge_id: 1,
    innovation: 9,
    technical: 8,
    presentation: 7,
    impact: 8,
    overall: 8.0,
    comments: 'Excellent use of NLP for code analysis. The GitHub integration is seamless. Presentation could be tighter but the demo was very convincing.',
    scored_at: '2023-09-18 10:00:00'
  },
  // Judge Mike (judge_id=2) scores for submission 1 (Neural Nexus)
  {
    submission_id: 1,
    judge_id: 2,
    innovation: 8,
    technical: 9,
    presentation: 8,
    impact: 7,
    overall: 8.0,
    comments: 'Very strong technical implementation. The model fine-tuning approach is clever. Would love to see more real-world bug detection examples.',
    scored_at: '2023-09-18 10:30:00'
  },
  // Judge Sarah (judge_id=1) scores for submission 2 (DataDreamers)
  {
    submission_id: 2,
    judge_id: 1,
    innovation: 7,
    technical: 8,
    presentation: 8,
    impact: 7,
    overall: 7.5,
    comments: 'Solid engineering work on the pipeline. The visual DAG editor is a nice touch. The self-healing concept needs more validation with real data.',
    scored_at: '2023-09-18 11:00:00'
  },
  // Judge Mike (judge_id=2) scores for submission 2 (DataDreamers)
  {
    submission_id: 2,
    judge_id: 2,
    innovation: 6,
    technical: 7,
    presentation: 9,
    impact: 8,
    overall: 7.5,
    comments: 'Great presentation and storytelling. The monitoring dashboard is polished. Innovation is incremental but the execution is strong.',
    scored_at: '2023-09-18 11:30:00'
  }
];

const insertScores = db.transaction((items) => {
  for (let i = 0; i < items.length; i++) {
    insertScore.run(items[i]);
  }
});

insertScores(scores);
console.log('  -> ' + scores.length + ' scores inserted');

// ─── Done ───────────────────────────────────────────────────────────────────

db.close();
console.log('');
console.log('Database seeded successfully!');
console.log('Database location: ' + dbPath);
process.exit(0);
