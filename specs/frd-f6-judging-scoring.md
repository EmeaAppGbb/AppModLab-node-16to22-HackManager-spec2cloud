# FRD-F6: Judging & Scoring

> **PRD Reference**: F6 — Judging & Scoring
> **Status**: Extracted from brownfield codebase

## Overview

Judges score submissions across four criteria (innovation, technical, presentation, impact) on a 0–10 scale. An overall score is computed as the average. Judge assignments are auto-created when a judge first scores a submission within a hackathon. The judging list is publicly accessible (no auth required).

## User Stories

- **US-F6-1**: As a judge, I can view all submissions available for scoring.
- **US-F6-2**: As a judge, I can score a submission across four criteria and leave comments.
- **US-F6-3**: As a visitor, I can view the judging list to see which submissions exist.

## Acceptance Criteria

### List Submissions for Judging (GET /judging)
- AC-F6-1: Display all submissions with team name and hackathon name
- AC-F6-2: Uses same LEFT JOIN query as submissions list
- AC-F6-3: **No authentication required** (publicly accessible)

### Score Form (GET /submissions/:id/judge)
- AC-F6-4: Requires judge role (requireJudge middleware — role must be 'judge' or 'admin')
- AC-F6-5: Display submission details (title, description, team name, hackathon name)
- AC-F6-6: Show scoring sliders/inputs for innovation, technical, presentation, impact (0–10 range)
- AC-F6-7: Show comments textarea
- AC-F6-8: If submission not found, render 404 error page

### Submit Score (POST /submissions/:id/score)
- AC-F6-9: Requires judge role (requireJudge middleware)
- AC-F6-10: Look up submission; render 404 if not found
- AC-F6-11: Check if judge record exists for this user + hackathon combination
- AC-F6-12: If no judge record exists, auto-create one (`INSERT INTO judges`)
- AC-F6-13: Parse scores as integers; default to 0 if not parseable (`parseInt() || 0`)
- AC-F6-14: Calculate overall score: `(innovation + technical + presentation + impact) / 4`
- AC-F6-15: Insert score record with all criteria, overall, and comments
- AC-F6-16: On success, redirect to judging list

## Current Implementation

| Component | Location | Notes |
|-----------|----------|-------|
| Routes | `src/routes/judging.js` | 3 routes: list, score form, submit score |
| Views | `src/views/judging/` | list.ejs, score.ejs |
| Auth middleware | `requireJudge` | Checks role is 'judge' or 'admin' |
| Score calculation | Inline in route | `(innovation + technical + presentation + impact) / 4` |

### Known Limitations
- **Judging list is public** — GET /judging has no authentication middleware; any visitor can see all submissions
- **No double-scoring prevention** — A judge can score the same submission multiple times (no unique constraint on submission_id + judge_id)
- **No score editing** — Scores cannot be updated after submission
- **No score deletion** — No endpoint to remove a score
- **Judge auto-creation** — Judge records created implicitly on first score; no explicit assignment workflow
- **No leaderboard** — No aggregated ranking view across all submissions for a hackathon
- **Score validation is weak** — `parseInt() || 0` allows any string to default to 0; no range validation (0–10)
- **Most complex route handler** — POST /score has 4 levels of nesting (highest in codebase)
- **Submission JOIN query duplicated** — Same query exists in both judging.js and submissions.js
