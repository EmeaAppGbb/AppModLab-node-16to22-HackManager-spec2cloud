---
title: "HackManager Node 16→22 Modernization with Spec2Cloud"
description: "Modernize a legacy Node.js 16 hackathon app to Node.js 22 using Spec2Cloud and GitHub Copilot, deploy to Azure App Service."
authors: ["marconsilva"]
category: "Code Modernization"
industry: "Cross-Industry"
services: ["Azure App Service"]
languages: ["JavaScript"]
frameworks: ["Express"]
modernizationTools: ["Spec2Cloud"]
tags: ["Node.js", "Spec-Driven Development", "Node 16", "Node 22", "ESM", "Hackathon", "Brownfield"]
extensions: []
thumbnail: "https://raw.githubusercontent.com/EmeaAppGbb/AppModLab-node-16to22-HackManager-spec2cloud/refs/heads/main/img/repo-banner.png"
video: ""
version: ""
---

## Overview

This lab modernizes the HackManager application from Node.js 16 to Node.js 22 using Spec2Cloud and GitHub Copilot, then deploys it to Azure App Service. The legacy codebase uses Express with EJS templates and SQLite for storage.

## Understanding the Legacy Application

The legacy HackManager application is a Node.js 16 Express + EJS web app backed by SQLite. It provides a full hackathon management platform with user authentication, hackathon CRUD, team management, submissions, and judging. Below is what the application looks like when running with seed data.

The dashboard shows summary statistics (hackathons, teams, participants) and recent hackathon cards with status badges:

![Homepage Dashboard](assets/screenshots/01-homepage-dashboard.png)

The hackathons list provides a tabular view of all hackathons with location, dates, capacity, and color-coded status badges (Upcoming, Active, Completed):

![Hackathons List](assets/screenshots/02-hackathons-list.png)

Each hackathon has a detail view showing description, dates, location, associated teams, and submissions:

![Hackathon Detail](assets/screenshots/03-hackathon-detail.png)

### Authentication Flow

The application includes a standard authentication flow. The login page provides username/password authentication with a link to registration:

![Login Page](assets/screenshots/04-login-page.png)

New users register with username, email, password, and password confirmation:

![Register Page](assets/screenshots/05-register-page.png)

## Screenshots Reference

| Screenshot | Description |
|---|---|
| ![Homepage Dashboard](assets/screenshots/01-homepage-dashboard.png) | Dashboard with stats and hackathon cards |
| ![Hackathons List](assets/screenshots/02-hackathons-list.png) | Tabular list of all hackathons |
| ![Hackathon Detail](assets/screenshots/03-hackathon-detail.png) | Individual hackathon detail view |
| ![Login Page](assets/screenshots/04-login-page.png) | Login form |
| ![Register Page](assets/screenshots/05-register-page.png) | Registration form |

## Solution Branch

The completed modernization is available on the **`solution-final`** branch with step-by-step tags:

| Step | Tag | Description |
|------|-----|-------------|
| 01 | `step-01-explore-legacy` | Explore legacy Node 16 codebase |
| 02 | `step-02-spec2cloud-analysis` | Spec2Cloud analysis of deprecated patterns |
| 03 | `step-03-migration-spec` | Generate migration specification |
| 04 | `step-04-update-node` | Update Node engine, replace better-sqlite3 with sql.js |
| 05 | `step-05-migrate-esm` | Convert CommonJS to ES Modules |
| 06 | `step-06-modernize-apis` | Replace moment.js, arrow functions, template literals |
| 07 | `step-07-update-deps` | Verify all dependencies at latest compatible versions |
| 08 | `step-08-build-test` | Add Node.js built-in test runner tests, verify app |

### Key Modernization Changes
- **CommonJS → ESM**: All `require()`/`module.exports` converted to `import`/`export`
- **body-parser → Express built-in**: `express.urlencoded()` and `express.json()`
- **moment.js → Native Intl API**: `Date.toLocaleDateString()` with Intl formatting
- **better-sqlite3 → sql.js**: Pure JS/WASM SQLite (no native compilation)
- **var → const/let**: Modern variable declarations
- **function() → arrow functions**: ES6+ callback syntax
- **Node.js built-in test runner**: Tests using `node:test` (9 tests passing)
- **Node 22 features verified**: `structuredClone`, global `fetch`, `import.meta.url`