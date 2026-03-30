# Product Requirements Document — HackManager

> **Generated from**: Brownfield codebase extraction (Phase B2a)
> **Source of truth**: Existing application code at `src/`

## Product Vision

HackManager is a web-based platform for organizing, managing, and judging hackathon events. It enables event organizers to create and manage hackathons, participants to form teams and submit projects, and judges to score submissions across multiple criteria. The application provides a centralized hub for the complete hackathon lifecycle — from event creation through team formation, project submission, and final judging.

## User Personas

### 1. Hackathon Organizer (Admin)
- **Role in system**: `admin`
- **Goals**: Create and manage hackathon events; oversee teams, submissions, and judging
- **Current capabilities**: Create/edit/delete hackathons; view all data; full system access
- **Pain points observed in code**: No dashboard for organizer-specific views; no ability to assign judges to hackathons via UI; no event analytics

### 2. Judge
- **Role in system**: `judge`
- **Goals**: Review submitted projects and score them fairly across defined criteria
- **Current capabilities**: View all submissions; score submissions on 4 criteria (innovation, technical, presentation, impact); leave comments
- **Pain points observed in code**: Must navigate to judging page manually; no notification of assigned hackathons; judge records auto-created (no explicit assignment flow)

### 3. Participant
- **Role in system**: `participant`
- **Goals**: Join hackathons, form or join teams, submit projects
- **Current capabilities**: Register account; join hackathons; view teams; submit projects with demo/repo URLs
- **Pain points observed in code**: No way to leave a team; no way to edit submissions; team creation requires knowing hackathon ID in URL

### 4. Visitor (Unauthenticated)
- **Role in system**: None (no session)
- **Goals**: Browse hackathons, view teams and submissions
- **Current capabilities**: View dashboard with stats; browse all hackathons, teams, participants, submissions; view judging list
- **Pain points observed in code**: Judging list publicly accessible (potential information leak)

## Feature Areas

### F1: User Authentication
Enables users to create accounts, log in, and log out. Supports three roles: participant (default), judge, and admin. Session-based authentication with bcrypt password hashing.

**Implemented flows**:
- Registration with username, email, password, and role selection
- Login with username and password
- Logout with session destruction
- Session persistence across requests via express-session

### F2: Hackathon Management
Core CRUD operations for hackathon events. Organizers can create events with dates, location, team limits, and status. Events progress through statuses: upcoming → active → completed.

**Implemented flows**:
- Create hackathon with full details
- List all hackathons with formatted dates
- View individual hackathon with associated teams and submissions
- Edit hackathon details
- Delete hackathon

### F3: Team Management
Enables participants to create teams within hackathons. Teams have a name, project details, and repository URL. Team membership is tracked through the participants table.

**Implemented flows**:
- Create team within a specific hackathon
- List all teams across hackathons
- View team details with member list

### F4: Participant Registration
Enables users to join hackathons, optionally associating with a team. Tracks registration timestamps and team roles (leader/member).

**Implemented flows**:
- Join a hackathon (with optional team assignment)
- List all participants across hackathons with user, team, and hackathon details

### F5: Project Submissions
Teams submit their hackathon projects with a title, description, demo URL, and repository URL. Submissions are scoped to a hackathon and associated with a team.

**Implemented flows**:
- Create submission for a hackathon (selecting team)
- List all submissions across hackathons
- View individual submission with all judge scores

### F6: Judging & Scoring
Judges score submissions on four criteria (innovation, technical, presentation, impact) on a 0–10 scale. An overall score is calculated as the average. Judge records are auto-created when a judge first scores a submission in a hackathon.

**Implemented flows**:
- View all submissions available for judging
- Score a submission with 4 criteria + comments
- View aggregated scores per submission

### F7: Dashboard
Homepage showing aggregate statistics and recent hackathon events. Provides a landing page for all users.

**Implemented flows**:
- Display total counts (hackathons, teams, participants)
- Show 3 most recent hackathons with formatted dates

## Non-Functional Requirements (Observed)

| Aspect | Current State |
|--------|--------------|
| **Performance** | Synchronous SQLite — adequate for low concurrency; blocking bcrypt on auth routes |
| **Security** | bcrypt password hashing; parameterized SQL; EJS auto-escaping. Missing: CSRF, rate limiting, authorization checks |
| **Scalability** | Single-process, file-based DB, in-memory sessions — not horizontally scalable |
| **Availability** | No health checks, no graceful shutdown, no clustering |
| **Observability** | console.log only — no structured logging, no metrics, no tracing |
| **Accessibility** | Bootstrap 4 defaults — no explicit ARIA enhancements |
| **Internationalization** | English only; dates formatted via moment.js |

## Out of Scope (Not Implemented)

The following features are **not present** in the current codebase:
- Password reset / forgot password
- Email notifications
- User profile management
- Team invitations
- Submission editing after creation
- Hackathon search or filtering
- Pagination on list views
- File/image uploads
- Real-time features (WebSocket)
- REST/JSON API (all responses are HTML)
- Admin panel or management dashboard
- Audit logging
- Data export (CSV, PDF)
