// green-baseline: captures existing behavior
// Shared helper utilities for integration tests

const request = require('supertest');

/**
 * Extract CSRF token from HTML response containing a hidden _csrf input field
 */
function extractCsrfToken(html) {
  const match = html.match(/name="_csrf"[^>]*value="([^"]+)"/);
  if (match) return match[1];
  const match2 = html.match(/value="([^"]+)"[^>]*name="_csrf"/);
  return match2 ? match2[1] : null;
}

/**
 * Create an authenticated supertest agent with session cookie.
 * Logs in the given user and returns the agent for subsequent authenticated requests.
 */
async function createAuthenticatedAgent(app, { username, password }) {
  const agent = request.agent(app);
  const loginPage = await agent.get('/auth/login');
  const csrfToken = extractCsrfToken(loginPage.text);
  await agent
    .post('/auth/login')
    .type('form')
    .send({ username, password, _csrf: csrfToken });
  return agent;
}

/**
 * Get a fresh CSRF token from any page that renders a form with a _csrf field.
 */
async function getCsrfToken(agent, url) {
  const res = await agent.get(url);
  return extractCsrfToken(res.text);
}

module.exports = { extractCsrfToken, createAuthenticatedAgent, getCsrfToken };
