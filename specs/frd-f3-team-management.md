# FRD-F3: Team Management

> **PRD Reference**: F3 — Team Management
> **Status**: Extracted from brownfield codebase

## Overview

Enables participants to create teams within hackathons. Teams have a name, project details, and repository URL. Team membership is tracked through the participants table, linking users to teams within a hackathon context.

## User Stories

- **US-F3-1**: As a participant, I can create a team in a hackathon so that I can collaborate with others on a project.
- **US-F3-2**: As a visitor, I can view all teams across hackathons.
- **US-F3-3**: As a visitor, I can view a team's details including its members.

## Acceptance Criteria

### List Teams (GET /teams)
- AC-F3-1: Display all teams with their associated hackathon names (LEFT JOIN)
- AC-F3-2: Each team shows name, hackathon name, project name
- AC-F3-3: No authentication required

### Create Team (GET /hackathons/:hackathonId/teams/new, POST /hackathons/:hackathonId/teams)
- AC-F3-4: Requires authentication (requireAuth middleware)
- AC-F3-5: Verify hackathon exists; render 404 if not found
- AC-F3-6: Form fields: name (required), project_name, project_description, repo_url
- AC-F3-7: Team is associated with the hackathon via hackathon_id
- AC-F3-8: On success, redirect to the new team's detail page

### View Team (GET /teams/:id)
- AC-F3-9: Display team details (name, project info, repo URL)
- AC-F3-10: Show hackathon information the team belongs to
- AC-F3-11: Show team members with usernames and emails (JOIN participants → users)
- AC-F3-12: If team not found, render 404 error page

## Current Implementation

| Component | Location | Notes |
|-----------|----------|-------|
| Routes | `src/routes/teams.js` | 4 routes: list, new, create, show |
| Views | `src/views/teams/` | list.ejs, show.ejs, new.ejs |
| Database queries | Inline in route handlers | Hackathon lookup duplicated from hackathons.js |

### Known Limitations
- **No team editing** — Teams cannot be updated after creation
- **No team deletion** — No delete endpoint exists
- **No max_teams enforcement** — Team count not checked against hackathon's max_teams limit
- **No team creator tracking** — No `created_by` column; any authenticated user can create teams in any hackathon
- **No team membership via creation** — Creating a team does not auto-add the creator as a member
- **No membership management** — Cannot leave a team, remove members, or transfer leadership
- **Member emails exposed** — Team detail view shows member email addresses to all visitors
