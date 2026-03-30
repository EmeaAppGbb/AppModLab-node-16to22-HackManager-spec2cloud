# Modernization Assessment

## Summary

- **Application**: HackManager — Hackathon Management System
- **Stack**: Node.js + Express 4 + EJS + SQLite (better-sqlite3) + jQuery/Bootstrap 4
- **Assessment depth**: Level 3 (Deep Assessment)
- **Total findings**: 26
- **Critical**: 4 | **High**: 10 | **Medium**: 8 | **Low**: 4
- **Escalation triggered**: Yes — Level 1 → Level 2 (>5 critical/high findings) → Level 3 (architectural concerns in route-level business logic, zero test coverage, no service layer)

## Findings by Category

### Dependencies

| # | Severity | Finding | Location | Remediation | Effort |
|---|----------|---------|----------|-------------|--------|
| D1 | High | **moment.js in maintenance mode** — No new features since 2020; superseded by modern alternatives (date-fns, Day.js, Temporal API) | `package.json`, `routes/hackathons.js`, `routes/index.js`, `routes/submissions.js` | Replace with `date-fns` or `Day.js`. 7 format call-sites to migrate. | 2–4 hours |
| D2 | High | **better-sqlite3 3 major versions behind** — v9.6.0 installed, v12.8.0 latest. May miss performance improvements and Node.js 22+ native binding fixes. | `package.json` | Upgrade to latest 12.x. Test native compilation on target platform. | 2–4 hours |
| D3 | High | **CVE in semver (GHSA-c2qf-rxjj-qqgw)** — ReDoS vulnerability (CVSS 7.5) via nodemon → simple-update-notifier → semver 7.0.0–7.5.1 | `node_modules/simple-update-notifier/node_modules/semver` | Upgrade nodemon to 3.x (`npm install nodemon@3 --save-dev`) | 30 min |
| D4 | Medium | **body-parser is redundant** — Express 4.16+ includes `express.json()` and `express.urlencoded()` natively. Separate body-parser adds an unnecessary dependency. | `package.json`, `src/app.js:18-19` | Replace `bodyParser.urlencoded()` / `bodyParser.json()` with `express.urlencoded()` / `express.json()`. Remove body-parser from dependencies. | 30 min |
| D5 | Medium | **Express 4.x → 5.x available** — Express 5.2.1 available with improved async error handling, modernized API. Breaking changes exist. | `package.json` | Evaluate Express 5 migration after other modernization steps. Major version bump — requires testing. See ADR-001. | 1–2 days |
| D6 | Medium | **jQuery 3.5.1 + Bootstrap 4.6 outdated** — jQuery 3.5.1 loaded via CDN. Bootstrap 4 is legacy; Bootstrap 5 dropped jQuery dependency. | `src/views/layout/footer.ejs`, `src/views/layout/header.ejs` | Upgrade to Bootstrap 5 + vanilla JS or modern framework. See ADR-001. | 1–2 days |
| D7 | Low | **nodemon 2.x → 3.x** — Dev dependency behind 1 major version. Also resolves CVE (D3). | `package.json` | `npm install nodemon@3 --save-dev` | 15 min |
| D8 | Low | **bcryptjs 2.4.3 → 3.0.3** — Minor improvements. Pure JS implementation is adequate but 1 major behind. | `package.json` | Upgrade to 3.x. Test password hashing/verification still works with existing hashes. | 1 hour |

### Patterns

| # | Severity | Finding | Location | Remediation | Effort |
|---|----------|---------|----------|-------------|--------|
| P1 | High | **Synchronous bcrypt blocks event loop** — `bcrypt.hashSync()` and `bcrypt.compareSync()` are CPU-intensive blocking calls that freeze the entire server during password operations. | `src/routes/auth.js:23,52` | Replace with `await bcrypt.hash()` and `await bcrypt.compare()`. Convert route handlers to `async`. | 1–2 hours |
| P2 | High | **Significant code duplication (7+ patterns)** — Hackathon lookup repeated 4×, date formatting 7×, JOIN queries 4×, resource-404-check 6×. Maintenance risk and inconsistent error handling. | `src/routes/hackathons.js`, `submissions.js`, `teams.js`, `judging.js`, `participants.js` | Extract shared queries into a data access / repository layer. Create date formatting utility. | 1–2 days |
| P3 | Medium | **var + require (CommonJS) throughout** — All files use `var` for module declarations and CommonJS `require()`. Node 16+ supports ES modules; `const`/`let` should replace `var`. | All `src/**/*.js` files | Convert `var` → `const`/`let`. Optionally migrate to ESM (`import`/`export`). | 2–4 hours |
| P4 | Medium | **No input validation** — Route handlers accept user input (form data, URL params) without validation. `parseInt()` used without NaN checking. | All route files | Add express-validator or zod for request validation. Validate all user inputs before DB operations. | 1–2 days |
| P5 | Low | **console.log/console.error for logging** — No structured logging. Production troubleshooting requires log parsing. | `src/app.js:76`, `src/config/database.js:94`, route error handlers | Replace with structured logger (pino or winston). Add request ID tracking. | 4–8 hours |
| P6 | Low | **Old function syntax mixed with arrow functions** — Inconsistent style: `function(req, res, next)` alongside `(req, res) => {}`. | All route and middleware files | Standardize on arrow functions for callbacks. Apply ESLint autofix. | 1–2 hours |

### Architecture

| # | Severity | Finding | Location | Remediation | Effort |
|---|----------|---------|----------|-------------|--------|
| A1 | Critical | **Business logic embedded in route handlers** — Routes directly execute SQL, perform validation, handle errors, and render views. No service layer, no repository pattern. This makes the code untestable, non-reusable, and tightly coupled to Express and SQLite. | All `src/routes/*.js` files | Extract service layer (`src/services/`) and data access layer (`src/repositories/`). Routes become thin controllers. See ADR-001. | 3–5 days |
| A2 | High | **SQLite singleton with no abstraction** — Database accessed via `database.getDb()` global function. No connection pooling concept, no query builder, no ORM. Schema defined inline in `initDatabase()`. | `src/config/database.js`, all routes | Introduce repository pattern. Consider knex.js or drizzle-orm for query building. Separate schema migrations from initialization. | 2–3 days |
| A3 | High | **No separation of concerns in views** — EJS templates mix layout, logic, and data. No component model. Tightly coupled to Express `res.render()`. | `src/views/**/*.ejs` | Acceptable for server-rendered MPA. If modernizing to SPA, replace with React/Next.js. For MPA, extract partials. See ADR-001. | Variable |
| A4 | Medium | **Foreign keys not enforced at runtime** — `PRAGMA foreign_keys = ON` only in `seeds/seed.js`, not in `database.js`. Data integrity not guaranteed in production. | `src/config/database.js` (missing), `seeds/seed.js:8` | Add `db.pragma('foreign_keys = ON')` in `initDatabase()` after database open. | 15 min |

### Security

| # | Severity | Finding | Location | Remediation | Effort |
|---|----------|---------|----------|-------------|--------|
| S1 | Critical | **Hardcoded session secret** — `'hackathon-secret-key-2023'` in source code. Allows session forgery if source is exposed. | `src/app.js:24` | Replace with `process.env.SESSION_SECRET`. Add `.env.example` template. Fail startup if missing. | 30 min |
| S2 | Critical | **No CSRF protection** — Forms submit without CSRF tokens. Cross-site request forgery attacks can manipulate data. | `src/app.js:38` (TODO noted) | Add `csurf` middleware or equivalent. Add CSRF tokens to all forms. | 4–8 hours |
| S3 | Critical | **Missing authorization (IDOR)** — Any authenticated user can edit/delete ANY hackathon, team, or submission. No ownership checks. Insecure Direct Object Reference vulnerability. | `src/routes/hackathons.js:98-112,116-130`, `teams.js`, `submissions.js` | Add ownership/role checks before all mutating operations. Verify `req.session.user.id` matches resource creator. | 4–8 hours |
| S4 | High | **In-memory session store** — Default `MemoryStore` leaks memory in production and does not persist across restarts. TODO acknowledged but unimplemented. | `src/app.js:22-27` | Add `connect-sqlite3` (or connect-redis for production) as session store. | 2–4 hours |
| S5 | Medium | **No rate limiting** — Login endpoint has no rate limiting. Allows brute-force password attacks. | `src/routes/auth.js` (TODO on line 3) | Add `express-rate-limit` middleware on `/auth/login` and `/auth/register`. | 1–2 hours |
| S6 | Medium | **Error stack traces may leak to client** — Error handler passes full `err` object to view in development mode. Could expose internal paths and logic. | `src/app.js:67-73` | Sanitize error output. Never send stack traces in production. Use `NODE_ENV` check consistently. | 1 hour |

### Testing

| # | Severity | Finding | Location | Remediation | Effort |
|---|----------|---------|----------|-------------|--------|
| T1 | High | **Zero automated tests** — No test files, no test framework, no test script in package.json. No unit, integration, or e2e tests exist. | Project-wide | Add test framework (vitest or jest). Start with service-layer unit tests after A1 refactor. Add supertest for API integration tests. | 2–3 days (framework + initial tests) |
| T2 | High | **No linting configuration** — No ESLint or Prettier config despite devcontainer referencing them. Code style inconsistencies (var/const, function/arrow) go uncaught. | Project root (missing `.eslintrc*`, `.prettierrc*`) | Add ESLint + Prettier config. Run autofix for quick wins. Add lint script to package.json. | 2–4 hours |

### DevOps/CI

| # | Severity | Finding | Location | Remediation | Effort |
|---|----------|---------|----------|-------------|--------|
| C1 | High | **No CI/CD pipeline** — No GitHub Actions workflows, no Dockerfile, no docker-compose. No automated build, test, or deployment process. | `.github/workflows/` (missing) | Add GitHub Actions workflow: lint → test → build → deploy. Add Dockerfile for containerization. | 1–2 days |
| C2 | Medium | **No .env pattern** — Only `PORT` uses env vars. Database path, session secret, and other config hardcoded. No `.env.example` for onboarding. | `src/app.js`, `src/config/database.js` | Add dotenv. Create `.env.example` with all required variables. Update all hardcoded values. | 2–4 hours |
| C3 | Low | **Node engine constraint too permissive** — `"node": ">=16.0.0"` allows EOL Node versions. Should target supported LTS. | `package.json:24` | Update to `"node": ">=20.0.0"` or `">=22.0.0"` to match current LTS. | 15 min |

### Documentation

| # | Severity | Finding | Location | Remediation | Effort |
|---|----------|---------|----------|-------------|--------|
| O1 | Low | **No code documentation** — No JSDoc, no API documentation, no architecture docs (beyond extraction outputs). README exists but no developer guide for the legacy code. | Project-wide | Add JSDoc to public functions. Generate API docs from route definitions. | 1–2 days |

---

## Modernization Roadmap

Based on dependency analysis between findings, the recommended sequencing is:

### Phase 1: Foundation & Safety (prerequisites for everything else)

| Order | Findings | What | Why First |
|-------|----------|------|-----------|
| 1.1 | S1, C2 | **Externalize configuration** — Add dotenv, move secrets to env vars, create `.env.example` | Unblocks secure deployment; 30 min |
| 1.2 | T2 | **Add linting** — ESLint + Prettier config, autofix pass | Catches issues in all subsequent changes; 2–4 hours |
| 1.3 | D3, D7 | **Fix CVE** — Upgrade nodemon to 3.x | Security vulnerability; 15 min |
| 1.4 | A4 | **Enable foreign keys in production** — Add pragma to `database.js` | Data integrity; 15 min |

### Phase 2: Security Hardening (critical vulnerabilities)

| Order | Findings | What | Why |
|-------|----------|------|-----|
| 2.1 | S3 | **Add authorization checks** — Ownership verification on all mutating endpoints | IDOR vulnerability; 4–8 hours |
| 2.2 | S2 | **Add CSRF protection** — CSRF tokens on all forms | Cross-site forgery risk; 4–8 hours |
| 2.3 | S5 | **Add rate limiting** — Protect auth endpoints | Brute force protection; 1–2 hours |
| 2.4 | S4 | **Replace session store** — Persistent session storage | Memory leak + no persistence; 2–4 hours |

### Phase 3: Architecture Refactoring (enables testing)

| Order | Findings | What | Why |
|-------|----------|------|-----|
| 3.1 | A1, P2 | **Extract service + repository layers** — Separate business logic from routes, deduplicate queries | Prerequisite for testability; 3–5 days |
| 3.2 | P1 | **Async bcrypt** — Replace sync calls with async | Unblocks event loop; 1–2 hours |
| 3.3 | P4 | **Add input validation** — express-validator or zod on all routes | Defense in depth; 1–2 days |

### Phase 4: Test Infrastructure (regression safety net)

| Order | Findings | What | Why |
|-------|----------|------|-----|
| 4.1 | T1 | **Add test framework + initial tests** — Vitest/Jest + supertest for API, unit tests for services | Enables safe refactoring; 2–3 days |
| 4.2 | C1 | **Add CI/CD pipeline** — GitHub Actions: lint → test → build | Automated quality gates; 1–2 days |

### Phase 5: Dependency Modernization

| Order | Findings | What | Why |
|-------|----------|------|-----|
| 5.1 | D1 | **Replace moment.js** — Migrate to date-fns or Day.js | Maintenance-mode dep; 2–4 hours |
| 5.2 | D4 | **Remove body-parser** — Use Express built-in | Reduce dependencies; 30 min |
| 5.3 | P3 | **Modernize syntax** — var→const/let, standardize style | Code quality; 2–4 hours |
| 5.4 | D2, D8 | **Upgrade remaining deps** — better-sqlite3, bcryptjs | Stay current; 2–4 hours |
| 5.5 | D5, D6 | **Evaluate Express 5 + Bootstrap 5** — Major version upgrades with breaking changes | Modern stack; 2–4 days |

### Phase 6: Observability & Docs

| Order | Findings | What | Why |
|-------|----------|------|-----|
| 6.1 | P5 | **Structured logging** — Replace console.log with pino/winston | Production readiness; 4–8 hours |
| 6.2 | S6 | **Sanitize error responses** — No stack traces in production | Security hygiene; 1 hour |
| 6.3 | O1 | **Add documentation** — JSDoc, API docs, architecture docs | Maintainability; 1–2 days |

---

## Estimated Total Effort

| Phase | Effort Range | Priority |
|-------|-------------|----------|
| Phase 1: Foundation | 3–5 hours | Immediate |
| Phase 2: Security | 1.5–3 days | Urgent |
| Phase 3: Architecture | 4–8 days | High |
| Phase 4: Testing | 3–5 days | High |
| Phase 5: Dependencies | 3–5 days | Medium |
| Phase 6: Observability | 1.5–3 days | Low |
| **Total** | **~14–29 days** | — |

---

## Decision Points

The following items require user decision and are documented as ADRs:

| ADR | Decision | Options | Recommendation |
|-----|----------|---------|----------------|
| ADR-001 | **Modernization strategy: incremental refactor vs. framework rewrite** | (A) Incrementally modernize Express+EJS stack in-place, (B) Rewrite frontend as SPA (React/Next.js) keeping Express API, (C) Full rewrite with modern full-stack framework | Option A for lowest risk; Option B if rich interactivity needed. See `specs/adrs/adr-001-modernization-strategy.md` |
| ADR-002 | **Node.js target version** | (A) Node 20 LTS, (B) Node 22 LTS | Node 22 LTS — current LTS, matches modern devcontainer. See `specs/adrs/adr-002-node-target-version.md` |
