# FRD-F5: Project Submissions

> **PRD Reference**: F5 — Project Submissions
> **Status**: Extracted from brownfield codebase

## Overview

Teams submit their hackathon projects with a title, description, demo URL, and repository URL. Submissions are scoped to a hackathon and associated with a team. The submission detail view aggregates all judge scores for the submission.

## User Stories

- **US-F5-1**: As a team member, I can submit a project for my team in a hackathon.
- **US-F5-2**: As a visitor, I can view all submissions across hackathons.
- **US-F5-3**: As a visitor, I can view a submission's details and its scores.

## Acceptance Criteria

### List Submissions (GET /submissions)
- AC-F5-1: Display all submissions with team name and hackathon name (LEFT JOINs)
- AC-F5-2: Each submission shows title, team name, hackathon name, submission date formatted
- AC-F5-3: No authentication required

### Create Submission (GET /hackathons/:hackathonId/submissions/new, POST /hackathons/:hackathonId/submissions)
- AC-F5-4: Requires authentication (requireAuth middleware)
- AC-F5-5: Verify hackathon exists; render 404 if not found
- AC-F5-6: Form shows list of teams in the hackathon for selection
- AC-F5-7: Form fields: title (required), description, demo_url, repo_url, team_id (required)
- AC-F5-8: On success, redirect to the new submission's detail page

### View Submission (GET /submissions/:id)
- AC-F5-9: Display submission details with team name and hackathon name
- AC-F5-10: Show all scores for the submission with judge usernames
- AC-F5-11: Scores displayed with individual criteria (innovation, technical, presentation, impact), overall score, and comments
- AC-F5-12: Score listing uses JOIN through judges → users to get judge username
- AC-F5-13: Submission dates formatted with moment.js
- AC-F5-14: If submission not found, render 404 error page

## Current Implementation

| Component | Location | Notes |
|-----------|----------|-------|
| Routes | `src/routes/submissions.js` | 4 routes: list, new, create, show |
| Views | `src/views/submissions/` | list.ejs, show.ejs, new.ejs |
| Database queries | Inline in route handlers | JOIN query for submissions duplicated in judging.js |

### Known Limitations
- **No submission editing** — Submissions cannot be updated after creation
- **No submission deletion** — No delete endpoint exists
- **No duplicate submission check** — A team can submit multiple times to the same hackathon
- **No team membership verification** — Any authenticated user can submit on behalf of any team
- **No file uploads** — Only URLs (demo, repo) are supported; no attachments or screenshots
- **No submission deadline enforcement** — Can submit regardless of hackathon status or dates
- **Score JOINs duplicated** — Same complex JOIN query exists in both submissions.js and judging.js
