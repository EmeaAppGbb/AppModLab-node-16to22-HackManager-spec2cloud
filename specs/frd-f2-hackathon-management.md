# FRD-F2: Hackathon Management

> **PRD Reference**: F2 — Hackathon Management
> **Status**: Extracted from brownfield codebase

## Overview

Core CRUD operations for hackathon events. Authenticated users can create, view, edit, and delete hackathons. Events have dates, location, team limits, and a status lifecycle (upcoming → active → completed). All users (including unauthenticated) can browse hackathons.

## User Stories

- **US-F2-1**: As an organizer, I can create a new hackathon with all event details so that participants can discover and join it.
- **US-F2-2**: As a visitor, I can view a list of all hackathons so that I can find events to participate in.
- **US-F2-3**: As a visitor, I can view a single hackathon's details, teams, and submissions.
- **US-F2-4**: As an organizer, I can edit a hackathon's details to update event information.
- **US-F2-5**: As an organizer, I can delete a hackathon to remove cancelled events.

## Acceptance Criteria

### List Hackathons (GET /hackathons)
- AC-F2-1: Display all hackathons ordered by database insertion order
- AC-F2-2: Each hackathon shows name, description, dates (formatted as "MMM D, YYYY"), location, status
- AC-F2-3: No authentication required

### Create Hackathon (GET /hackathons/new, POST /hackathons)
- AC-F2-4: Requires authentication (requireAuth middleware)
- AC-F2-5: Form fields: name (required), description, start_date (required), end_date (required), location, max_teams (default 10), status (default 'upcoming')
- AC-F2-6: Created hackathon stores `created_by` as the authenticated user's ID
- AC-F2-7: On success, redirect to the new hackathon's detail page

### View Hackathon (GET /hackathons/:id)
- AC-F2-8: Display hackathon details with formatted dates
- AC-F2-9: Show all teams associated with the hackathon
- AC-F2-10: Show all submissions associated with the hackathon
- AC-F2-11: If hackathon not found, render 404 error page
- AC-F2-12: No authentication required

### Edit Hackathon (GET /hackathons/:id/edit, POST /hackathons/:id/update)
- AC-F2-13: Requires authentication (requireAuth middleware)
- AC-F2-14: Pre-populate form with existing hackathon data
- AC-F2-15: On success, redirect to the hackathon detail page
- AC-F2-16: If hackathon not found, render 404 error page

### Delete Hackathon (POST /hackathons/:id/delete)
- AC-F2-17: Requires authentication (requireAuth middleware)
- AC-F2-18: Delete the hackathon record from database
- AC-F2-19: Redirect to hackathons list page

## Current Implementation

| Component | Location | Notes |
|-----------|----------|-------|
| Routes | `src/routes/hackathons.js` | 7 routes: list, new, create, show, edit, update, delete |
| Views | `src/views/hackathons/` | list.ejs, show.ejs, new.ejs, edit.ejs |
| Date formatting | moment.js | `moment(date).format('MMM D, YYYY')` — duplicated in multiple places |
| Database queries | Inline in route handlers | No service layer; queries duplicated across routes |

### Known Limitations
- **No ownership authorization** — Any authenticated user can edit/delete ANY hackathon (IDOR vulnerability)
- **No cascade delete** — Deleting a hackathon does not remove associated teams, participants, submissions, or scores
- **No input validation** — Server-side does not validate date formats, max_teams range, or required fields beyond SQL constraints
- **No pagination** — All hackathons loaded at once
- **No search/filter** — Cannot filter by status, date range, or keyword
- **Status transitions are manual** — No automatic status change based on dates
- **Date formatting duplicated** — moment.js format call repeated across routes (not DRY)
