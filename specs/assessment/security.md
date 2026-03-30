# Security Assessment — HackManager

_Assessed on 2026-03-30 against the modernized codebase (post mod-001 through mod-017)._

## Summary

| Severity | Count |
|----------|-------|
| Critical | 2 |
| High | 3 |
| Medium | 6 |
| Low | 2 |
| **Total** | **13** |

**npm audit:** 0 known vulnerabilities in dependency tree.

---

## Findings

### Critical

#### SEC-001: Privilege Escalation via Self-Assigned Role in Registration

- **CVSS:** 9.1 (Critical)
- **Category:** Broken Access Control (OWASP A01)
- **Files:** `src/routes/auth.js:36`, `src/services/authService.js:13-16`, `src/middleware/validation.js:25`
- **Description:** The registration endpoint accepts an optional `role` parameter from `req.body`. Validation only checks that the value is one of `['participant', 'judge', 'admin']` — it does not restrict who can request each role. Any anonymous user can register as `admin` or `judge`.
- **Evidence:**
  ```js
  // routes/auth.js:36
  const { username, email, password, role } = req.body;
  // authService.js:15
  const userRole = role || 'participant';
  ```
- **Impact:** Full admin access. Attacker creates an admin account, gains CRUD control over all hackathons, can score submissions, delete data.
- **Recommended Fix:** Remove `role` from registration. Always assign `'participant'`. Provide an admin-only role-management endpoint.

---

#### SEC-002: Insecure Session Cookie Configuration

- **CVSS:** 8.2 (Critical)
- **Category:** Security Misconfiguration (OWASP A05)
- **Files:** `src/app.js:37-41`, `src/app.js:55-60`
- **Description:** Session cookie is missing critical security flags:
  - `httpOnly` not set (defaults to `true` in express-session, but not explicitly configured — intent unclear)
  - `secure` not set (cookie transmitted over HTTP)
  - `sameSite` not set on session cookie (only on CSRF cookie)
  - Fallback secret `'hackathon-dev-fallback-secret'` used when `SESSION_SECRET` is missing
  - CSRF cookie has `secure: false` hardcoded
- **Evidence:**
  ```js
  // app.js:40 — minimal cookie config
  cookie: { maxAge: 24 * 60 * 60 * 1000 },
  // app.js:58 — CSRF cookie insecure
  cookieOptions: { sameSite: 'strict', secure: false },
  ```
- **Impact:** Session hijacking via XSS (if httpOnly somehow not set), MitM interception over HTTP, predictable sessions if fallback secret used.
- **Recommended Fix:** Explicitly set `httpOnly: true`, `secure: process.env.NODE_ENV === 'production'`, `sameSite: 'strict'` on session cookie. Remove fallback secret — fail fast if unset.

---

### High

#### SEC-003: Missing Security Headers (No Helmet)

- **CVSS:** 7.5 (High)
- **Category:** Security Misconfiguration (OWASP A05)
- **Files:** `src/app.js` (entire application), `package.json`
- **Description:** No security headers are set. Missing: `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, `Referrer-Policy`, `Permissions-Policy`. The `helmet` package is not installed.
- **Impact:** Increased attack surface for XSS, clickjacking, MIME-type sniffing, and downgrade attacks.
- **Recommended Fix:** Install and configure `helmet` middleware with appropriate CSP directives for Bootstrap CDN.

---

#### SEC-005: Weak Password Policy

- **CVSS:** 7.2 (High)
- **Category:** Identification & Authentication Failures (OWASP A07)
- **Files:** `src/middleware/validation.js:24`
- **Description:** Password validation requires only 6 characters minimum. No complexity requirements. Passwords like "123456" or "aaaaaa" are accepted.
- **Evidence:**
  ```js
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ```
- **Impact:** Weak passwords are trivially brute-forced. Combined with rate limiting only on login, offline attacks on stolen hashes are faster.
- **Recommended Fix:** Increase minimum to 8 characters. Add complexity requirement (uppercase + lowercase + digit). Consider checking against common password lists.

---

#### SEC-007: IDOR — Submission Creation Without Team Membership Verification

- **CVSS:** 7.1 (High)
- **Category:** Broken Access Control (OWASP A01)
- **Files:** `src/routes/submissions.js:34-45`
- **Description:** `POST /hackathons/:hackathonId/submissions` accepts `team_id` from user input. No verification that the authenticated user belongs to the specified team. Any authenticated user can submit solutions on behalf of any team.
- **Evidence:**
  ```js
  const { title, description, demo_url, repo_url, team_id } = req.body;
  submissionService.create({ team_id, hackathon_id, ... }); // No ownership check
  ```
- **Impact:** Competition integrity compromised. Attacker submits for rival teams, manipulates results.
- **Recommended Fix:** Before creating submission, verify `req.session.user.id` is a participant of the specified team via `participantRepo`.

---

### Medium

#### SEC-004: Account Enumeration via Registration Error

- **Category:** Identification & Authentication Failures (OWASP A07)
- **Files:** `src/routes/auth.js:43-46`
- **Description:** Registration error distinguishes "Username or email already exists" from generic errors, enabling attackers to enumerate valid accounts.
- **Recommended Fix:** Return a generic error message for all registration failures.

#### SEC-008: CSRF Protection Disabled via NODE_ENV

- **Category:** Security Misconfiguration (OWASP A05)
- **Files:** `src/app.js:69-71`
- **Description:** CSRF protection is bypassed when `NODE_ENV === 'test'`. If production accidentally runs with `NODE_ENV=test`, all CSRF protection is lost.
- **Recommended Fix:** Use `process.env.VITEST` or a dedicated `SKIP_CSRF` flag instead of `NODE_ENV`.

#### SEC-009: Raw SQL Query Parameter in requireOwnerOrAdmin

- **Category:** Injection (OWASP A03) — architectural risk
- **Files:** `src/middleware/auth.js:25-51`, `src/routes/hackathons.js:54`
- **Description:** `requireOwnerOrAdmin()` accepts a raw SQL string parameter. Currently safe (hardcoded queries), but the pattern invites injection if future developers pass dynamic SQL.
- **Recommended Fix:** Replace with a resource-type string mapped to predefined queries.

#### SEC-010: Error Detail Disclosure in Non-Production

- **Category:** Security Misconfiguration (OWASP A05)
- **Files:** `src/app.js:131-134`, `src/routes/*.js` (catch blocks)
- **Description:** Route-level catch blocks pass the full `err` object to `res.render('error', { error: err })`. In non-production mode, this exposes stack traces, file paths, and SQL errors. The error.ejs template renders `error.message`.
- **Recommended Fix:** Sanitize error objects before rendering in all route catch blocks.

#### SEC-011: Rate Limiting Only on Auth Endpoints

- **Category:** Security Misconfiguration (OWASP A05)
- **Files:** `src/app.js:77-100`
- **Description:** Rate limiting applies only to `/auth/login` (10/15min) and `/auth/register` (5/15min). No limits on submission creation, scoring, team creation, or general API usage.
- **Recommended Fix:** Add a general rate limiter and specific limiters for write endpoints.

#### SEC-012: Email Exposure in Public Endpoints

- **Category:** Security Misconfiguration / Privacy
- **Files:** `src/repositories/index.js:87,107`, `src/views/participants/index.ejs`, `src/views/teams/show.ejs`
- **Description:** SQL queries for participants and team members SELECT `users.email`. These endpoints are publicly accessible (no auth required). User emails are exposed to unauthenticated visitors.
- **Recommended Fix:** Remove email from public-facing queries. Create separate authenticated endpoints if email display is needed.

---

### Low

#### SEC-013: Missing Server-Side Password Confirmation

- **Category:** Input Validation
- **Files:** `src/middleware/validation.js` (registerRules), `src/public/js/main.js:30-39`
- **Description:** Password confirmation is validated only client-side via jQuery. Server-side validation does not check `confirm_password` matches `password`.
- **Recommended Fix:** Add server-side `confirm_password` validation to `registerRules`.

#### SEC-014: No HTTPS Enforcement

- **Category:** Security Misconfiguration (OWASP A05)
- **Files:** `src/app.js`
- **Description:** No middleware to redirect HTTP → HTTPS or set HSTS headers (partly addressed if helmet is added via SEC-003).
- **Recommended Fix:** Add HTTPS redirect middleware for production. HSTS via helmet.

---

## Template Security (XSS)

All EJS templates use `<%= %>` (escaped) for user-controlled data. The `<%- %>` (unescaped) syntax is used only for `include()` of layout partials. **No XSS vulnerabilities found in templates.**

## Dependency Security

`npm audit` reports **0 vulnerabilities** in the current dependency tree. All major dependencies (Express 4.x, better-sqlite3 12.x, bcryptjs 2.4.x) are on supported versions.

## Positive Security Controls Already in Place

- ✅ Parameterized SQL queries throughout (no string concatenation)
- ✅ bcrypt password hashing with 10 salt rounds
- ✅ CSRF double-submit cookie pattern (csrf-csrf v4)
- ✅ Input validation on all POST routes (express-validator)
- ✅ Rate limiting on auth endpoints
- ✅ Session stored in SQLite (not memory)
- ✅ Foreign keys enforced, WAL mode enabled
- ✅ Structured logging (pino) — no console.log
- ✅ EJS auto-escaping for XSS prevention
- ✅ .env properly gitignored
