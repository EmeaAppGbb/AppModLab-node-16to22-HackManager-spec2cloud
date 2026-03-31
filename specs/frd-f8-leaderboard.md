# FRD-F8: Hackathon Leaderboard

> **PRD Reference**: F8 — Hackathon Leaderboard
> **Status**: New feature requirement
> **Dependencies**: FRD-F5 (Submissions), FRD-F6 (Judging & Scoring), FRD-F2 (Hackathon Management)

## Overview

A real-time leaderboard page that ranks teams by their overall scores with filtering by hackathon. The leaderboard aggregates all judge scores per submission, ranks teams within each hackathon, and provides a public-facing view of competition standings. Scores update automatically as judges submit new ratings.

## User Stories

- **US-F8-1**: As a visitor, I can view the leaderboard to see which teams are winning each hackathon.
- **US-F8-2**: As a visitor, I can filter the leaderboard by hackathon to focus on a specific competition.
- **US-F8-3**: As a participant, I can check my team's ranking to see how we compare against other teams.
- **US-F8-4**: As a judge, I can view the leaderboard to see the impact of scores on rankings.
- **US-F8-5**: As an admin, I can view the leaderboard to monitor competition progress.

## Acceptance Criteria

### Leaderboard Page (GET /leaderboard)

- **AC-F8-1**: Display a ranked list of teams ordered by average overall score (descending).
- **AC-F8-2**: Each row shows: rank position, team name, submission title, average overall score, number of judges who scored, and per-criteria averages (innovation, technical, presentation, impact).
- **AC-F8-3**: No authentication required — the leaderboard is publicly visible.
- **AC-F8-4**: Teams with no scores appear at the bottom with "Not yet scored" indicator.
- **AC-F8-5**: When multiple submissions exist for the same team in a hackathon, rank by the highest-scoring submission.

### Hackathon Filter

- **AC-F8-6**: Provide a dropdown to filter leaderboard by hackathon.
- **AC-F8-7**: Default view shows "All Hackathons" with submissions grouped by hackathon sections.
- **AC-F8-8**: When a specific hackathon is selected (GET /leaderboard?hackathon_id=N), show only that hackathon's ranked submissions.
- **AC-F8-9**: The selected hackathon filter persists visually in the dropdown.

### Score Display

- **AC-F8-10**: Overall score displayed to one decimal place (e.g., 8.3).
- **AC-F8-11**: Per-criteria scores (innovation, technical, presentation, impact) displayed to one decimal place.
- **AC-F8-12**: Judge count displayed as "N judges" next to the overall score.
- **AC-F8-13**: Submissions with zero scores show "—" instead of 0.0.

### Real-Time Updates

- **AC-F8-14**: Leaderboard reflects the latest scores on each page load (no caching).
- **AC-F8-15**: After a judge submits a score, the leaderboard immediately reflects the updated ranking on next visit.

### Navigation

- **AC-F8-16**: Add "Leaderboard" link to the main navigation bar.
- **AC-F8-17**: Team name links to the team detail page.
- **AC-F8-18**: Submission title links to the submission detail page (which shows individual judge scores).

### Edge Cases

- **AC-F8-19**: Hackathon with no submissions shows "No submissions yet" message.
- **AC-F8-20**: Hackathon with submissions but no scores shows all teams as "Not yet scored".
- **AC-F8-21**: Invalid hackathon_id filter returns 404.

## Data Model

No new tables required. The leaderboard is derived from existing data:

```
hackathons → submissions (hackathon_id) → scores (submission_id)
                ↓
             teams (team_id)
```

### Aggregation Query

```sql
SELECT
  submissions.id as submission_id,
  submissions.title as submission_title,
  teams.id as team_id,
  teams.name as team_name,
  hackathons.id as hackathon_id,
  hackathons.name as hackathon_name,
  ROUND(AVG(scores.overall), 1) as avg_overall,
  ROUND(AVG(scores.innovation), 1) as avg_innovation,
  ROUND(AVG(scores.technical), 1) as avg_technical,
  ROUND(AVG(scores.presentation), 1) as avg_presentation,
  ROUND(AVG(scores.impact), 1) as avg_impact,
  COUNT(scores.id) as judge_count
FROM submissions
LEFT JOIN teams ON submissions.team_id = teams.id
LEFT JOIN hackathons ON submissions.hackathon_id = hackathons.id
LEFT JOIN scores ON submissions.id = scores.submission_id
GROUP BY submissions.id
ORDER BY avg_overall DESC NULLS LAST
```

## Architecture

| Component | Location | Purpose |
|-----------|----------|---------|
| Service | `src/services/leaderboardService.js` | Aggregation queries, ranking logic |
| Route | `src/routes/leaderboard.js` | GET /leaderboard with optional hackathon_id filter |
| View | `src/views/leaderboard/index.ejs` | Leaderboard table with filter dropdown |
| Repository | `src/repositories/index.js` | New query methods on submissionRepo |
| Navigation | `src/views/partials/navbar.ejs` | Add Leaderboard link |

## Non-Functional Requirements

- **NFR-F8-1**: Leaderboard page loads within 500ms for up to 100 submissions.
- **NFR-F8-2**: Scores are calculated server-side via SQL aggregation (not in JavaScript).
- **NFR-F8-3**: No PII (email addresses) exposed in leaderboard data.
