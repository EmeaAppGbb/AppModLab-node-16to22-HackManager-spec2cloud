# ADR-001: Modernization Strategy — Incremental Refactor vs. Framework Rewrite

## Status

Proposed

## Context

The HackManager application is a Node.js + Express 4 + EJS + SQLite server-rendered MPA with jQuery/Bootstrap 4 on the frontend. The modernization assessment (Level 3) identified 26 findings across 6 categories, including:

- **4 critical** security and architecture issues (hardcoded secrets, no CSRF, IDOR vulnerabilities, business logic in routes)
- **10 high** severity issues (zero tests, no CI/CD, outdated dependencies, synchronous blocking operations)
- **No service layer** — all business logic lives in Express route handlers
- **No tests** — zero automated tests of any kind
- **Significant code duplication** — 7+ repeated query patterns across routes

The codebase is small (~800 lines of application code across 10 files) but tightly coupled to Express request/response patterns.

## Decision Drivers

- **Risk tolerance**: How much change can be absorbed without breaking the application?
- **Time to value**: How quickly can the most critical issues (security, testability) be addressed?
- **Team familiarity**: What does the team know? What is the learning curve?
- **Future needs**: Will the application need rich interactivity, real-time features, or API-first architecture?

## Options Considered

### Option A: Incremental Refactor (Express + EJS in-place)

Keep the current stack (Express + EJS + SQLite). Modernize incrementally:
1. Extract service/repository layers from routes
2. Add tests against the new layers
3. Upgrade dependencies (Express 4→5, moment→date-fns, etc.)
4. Add security middleware (CSRF, rate limiting, auth checks)
5. Optionally upgrade Bootstrap 4→5 and drop jQuery

**Pros**: Lowest risk, fastest time to security fixes, no new framework learning curve, working app throughout.
**Cons**: EJS remains limited for rich interactivity, no API-first architecture.

### Option B: API + SPA Split

Keep Express as an API backend, rewrite frontend as a SPA (React/Next.js):
1. First: refactor routes into service layer (same as Option A Phase 3)
2. Then: create REST API routes alongside existing EJS routes
3. Then: build React/Next.js frontend consuming the API
4. Finally: remove EJS routes once SPA is complete (strangler fig)

**Pros**: Modern frontend, API-first enables mobile/third-party clients, better UX.
**Cons**: Longer timeline, requires parallel frontend stacks during migration, more complexity.

### Option C: Full Rewrite

Rewrite the entire application in a modern full-stack framework (Next.js, Remix, etc.):

**Pros**: Clean slate, modern patterns throughout.
**Cons**: Highest risk, longest timeline, feature parity takes weeks, no working app during rewrite.

## Recommendation

**Option A (Incremental Refactor)** for the initial modernization. The codebase is small enough that extracting a service layer and adding tests can be done in 1–2 weeks. This addresses all critical and high findings without framework risk. Option B can be pursued later as a separate decision once the foundation is solid.

## Consequences

- The application will remain a server-rendered MPA with EJS templates
- All security and architecture issues can be addressed incrementally
- The service layer extraction enables future API-first migration (Option B) if needed
- Bootstrap 5 upgrade can drop jQuery dependency without changing the rendering model
