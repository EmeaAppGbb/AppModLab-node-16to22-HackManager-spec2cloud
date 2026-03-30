const path = require('path');
const fs = require('fs');

// Use a separate test database
const TEST_DB_PATH = path.join(__dirname, '..', 'data', 'test-hackathon.db');

// Clean up test DB before each suite
if (fs.existsSync(TEST_DB_PATH)) {
  fs.unlinkSync(TEST_DB_PATH);
}

process.env.DATABASE_PATH = TEST_DB_PATH;
process.env.SESSION_SECRET = 'test-secret-for-vitest';
process.env.NODE_ENV = 'test';
