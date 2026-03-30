# FRD-F7: Dashboard

> **PRD Reference**: F7 — Dashboard
> **Status**: Extracted from brownfield codebase

## Overview

The dashboard serves as the application homepage, displaying aggregate statistics (total hackathons, teams, participants) and the three most recent hackathons. It provides a landing page overview for all users, authenticated or not.

## User Stories

- **US-F7-1**: As a visitor, I can view the dashboard to see an overview of the platform's activity.
- **US-F7-2**: As a visitor, I can see recent hackathons on the homepage to discover events.

## Acceptance Criteria

### Dashboard (GET /)
- AC-F7-1: Display total hackathon count from `SELECT COUNT(*) FROM hackathons`
- AC-F7-2: Display total team count from `SELECT COUNT(*) FROM teams`
- AC-F7-3: Display total participant count from `SELECT COUNT(*) FROM participants`
- AC-F7-4: Display 3 most recent hackathons ordered by `created_at DESC`
- AC-F7-5: Recent hackathons show formatted dates (moment.js "MMM D, YYYY")
- AC-F7-6: No authentication required
- AC-F7-7: Stats displayed as prominent "stat cards" with large numbers
- AC-F7-8: Recent hackathons displayed as cards with name, description, dates, status badge

## Current Implementation

| Component | Location | Notes |
|-----------|----------|-------|
| Route | `src/routes/index.js` | Single GET / route |
| View | `src/views/index.ejs` | Jumbotron hero + stat cards + hackathon cards |
| Database queries | 3 COUNT queries + 1 SELECT with LIMIT 3 | Executed sequentially (synchronous) |

### Known Limitations
- **No dynamic stats** — Only counts total records; no filtering by status (e.g., "active hackathons")
- **No user-specific dashboard** — Same view for authenticated and unauthenticated users
- **No submission or judging stats** — Only counts hackathons, teams, participants
- **Three sequential database queries** — Could be optimized into a single query with subselects
- **Date formatting duplicated** — Same moment.js pattern as hackathons.js and submissions.js
- **No caching** — Stats recalculated on every page load
