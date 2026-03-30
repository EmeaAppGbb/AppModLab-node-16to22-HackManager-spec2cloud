# FRD-F4: Participant Registration

> **PRD Reference**: F4 — Participant Registration
> **Status**: Extracted from brownfield codebase

## Overview

Enables authenticated users to join hackathons as participants, optionally associating with a team. The participants table serves as a many-to-many join between users, teams, and hackathons with additional role metadata (leader/member).

## User Stories

- **US-F4-1**: As a registered user, I can join a hackathon so that I am registered as a participant.
- **US-F4-2**: As a visitor, I can view all participants across all hackathons.

## Acceptance Criteria

### List Participants (GET /participants)
- AC-F4-1: Display all participants with user details (username, email), hackathon name, and team name
- AC-F4-2: Uses 3-way LEFT JOIN (participants → users, hackathons, teams)
- AC-F4-3: No authentication required

### Join Hackathon (POST /hackathons/:hackathonId/participants/join)
- AC-F4-4: Requires authentication (requireAuth middleware)
- AC-F4-5: Creates participant record with user_id from session, hackathon_id from URL
- AC-F4-6: team_id is optional (can join without a team)
- AC-F4-7: Role defaults to 'member'
- AC-F4-8: On success, redirect to the hackathon detail page

## Current Implementation

| Component | Location | Notes |
|-----------|----------|-------|
| Routes | `src/routes/participants.js` | 2 routes: list, join |
| Views | `src/views/participants/` | list.ejs |
| Database queries | Inline in route handlers | Complex 3-way JOIN for listing |

### Known Limitations
- **No duplicate check** — A user can join the same hackathon multiple times (no unique constraint on user_id + hackathon_id)
- **No leave/unregister** — No endpoint to withdraw from a hackathon
- **No hackathon existence check** — Join endpoint does not verify the hackathon exists before inserting
- **No team membership validation** — Can join a team that belongs to a different hackathon
- **No participant count limit** — No enforcement of maximum participants per hackathon
- **No join UI from hackathon page** — Must navigate to a specific URL; no "Join" button on hackathon detail page
- **Participant emails exposed** — List view shows email addresses to all visitors
