# FRD-F1: User Authentication

> **PRD Reference**: F1 — User Authentication
> **Status**: Extracted from brownfield codebase

## Overview

User authentication enables account creation, login, and logout. Supports three roles (participant, judge, admin) with session-based persistence using express-session and bcrypt password hashing.

## User Stories

- **US-F1-1**: As a visitor, I can register an account with a username, email, password, and role so that I can participate in hackathons.
- **US-F1-2**: As a registered user, I can log in with my username and password so that I can access protected features.
- **US-F1-3**: As a logged-in user, I can log out so that my session is terminated.

## Acceptance Criteria

### Registration (POST /auth/register)
- AC-F1-1: User provides username, email, password, and optional role (defaults to `participant`)
- AC-F1-2: Password is hashed with bcrypt (salt rounds 10) before storage
- AC-F1-3: Username and email must be unique (UNIQUE constraint on both columns)
- AC-F1-4: If username/email already exists, re-render registration form with error message
- AC-F1-5: On success, redirect to login page
- AC-F1-6: Role can be `participant` or `judge` (selected at registration)

### Login (POST /auth/login)
- AC-F1-7: User provides username and password
- AC-F1-8: System looks up user by username in database
- AC-F1-9: If user not found, re-render login form with "Invalid username or password" (generic message)
- AC-F1-10: If password doesn't match (bcrypt.compareSync), re-render with same generic message
- AC-F1-11: On success, create session with user data: `{ id, username, email, role }`
- AC-F1-12: Redirect to homepage (`/`)

### Logout (GET /auth/logout)
- AC-F1-13: Destroy the session (`req.session.destroy()`)
- AC-F1-14: Redirect to homepage

### Session Behavior
- AC-F1-15: Logged-in user's data is available in all views via `res.locals.user`
- AC-F1-16: Navigation bar shows "Welcome, {username}" and Logout link when authenticated
- AC-F1-17: Navigation bar shows Login and Register links when not authenticated

## Current Implementation

| Component | Location | Notes |
|-----------|----------|-------|
| Routes | `src/routes/auth.js` | 5 routes: GET/POST login, GET/POST register, GET logout |
| Middleware | `src/middleware/auth.js` | `requireAuth()`, `requireJudge()` |
| Views | `src/views/auth/login.ejs`, `src/views/auth/register.ejs` | Bootstrap 4 forms |
| Password hashing | bcryptjs `hashSync` / `compareSync` | **Synchronous** — blocks event loop |
| Session store | express-session default MemoryStore | **Not production-safe** |
| Session secret | Hardcoded `'hackathon-secret-key-2023'` | **Security risk** |

### Known Limitations
- No password reset / forgot password flow
- No email verification
- No rate limiting on login attempts (TODO in code)
- No CSRF protection on forms (TODO in code)
- Synchronous bcrypt blocks the event loop during hashing/comparison
- Session secret is hardcoded in source code
- MemoryStore leaks memory and doesn't persist across restarts
- Client-side password match validation only (no server-side confirmation password check)
