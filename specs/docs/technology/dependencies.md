# Dependency Inventory

## Production Dependencies (7)

| Package | Version (declared) | Version (installed) | Latest | Purpose | Used In |
|---------|-------------------|--------------------|---------|---------|---------| 
| bcryptjs | ^2.4.3 | 2.4.3 | 3.0.3 | Password hashing (pure JS bcrypt implementation) | `src/routes/auth.js`, `seeds/seed.js` |
| better-sqlite3 | ^9.6.0 | 9.6.0 | 12.8.0 | SQLite database driver (synchronous API, native module) | `src/config/database.js`, all route files via `database.getDb()` |
| body-parser | ^1.20.2 | 1.20.4 | 2.2.2 | HTTP request body parsing (URL-encoded + JSON) | `src/app.js` |
| ejs | ^3.1.9 | 3.1.10 | 5.0.1 | Server-side template engine | `src/app.js` (view engine), all `src/views/**/*.ejs` |
| express | ^4.18.2 | 4.22.1 | 5.2.1 | Web application framework | `src/app.js`, all route files |
| express-session | ^1.17.3 | — | — | Session middleware (default MemoryStore) | `src/app.js` |
| moment | ^2.29.4 | — | — | Date formatting library (maintenance mode since 2020) | `src/routes/hackathons.js`, `src/routes/index.js`, `src/routes/submissions.js` |

## Development Dependencies (1)

| Package | Version (declared) | Version (installed) | Latest | Purpose | Used In |
|---------|-------------------|--------------------|---------|---------|---------| 
| nodemon | ^2.0.22 | 2.0.22 | 3.1.14 | Auto-restart dev server on file changes | `package.json` scripts.dev |

## CDN Dependencies (2)

| Library | Version | CDN | Used In |
|---------|---------|-----|---------|
| Bootstrap | 4.6.2 | cdn.jsdelivr.net | `src/views/layout/header.ejs` (CSS), `src/views/layout/footer.ejs` (JS bundle) |
| jQuery | 3.5.1 (slim) | cdn.jsdelivr.net | `src/views/layout/footer.ejs` |

## Transitive Dependency Summary

| Metric | Count |
|--------|-------|
| Total packages | 148 |
| Production | 119 |
| Development | 30 |
| Optional | 1 |

## Known Vulnerabilities (npm audit)

| Package | Severity | CVE | Description | Fix |
|---------|----------|-----|-------------|-----|
| semver (7.0.0–7.5.1) | High | GHSA-c2qf-rxjj-qqgw | ReDoS — Regular Expression Denial of Service (CVSS 7.5) | Upgrade nodemon to 3.x |
| simple-update-notifier | High | (transitive) | Depends on vulnerable semver | Upgrade nodemon to 3.x |
| nodemon (2.0.19–2.0.22) | High | (transitive) | Depends on simple-update-notifier | Upgrade to nodemon 3.x |

## Dependency Relationships

```
app.js
├── express (framework)
│   └── (body-parser functionality built-in since 4.16)
├── body-parser (redundant — used explicitly instead of express built-in)
├── express-session (session middleware)
├── path (Node built-in)
└── config/database.js
    ├── better-sqlite3 (native SQLite driver)
    ├── path (Node built-in)
    └── fs (Node built-in)

routes/auth.js
├── express (Router)
├── bcryptjs (password hash/compare)
└── config/database.js

routes/hackathons.js, index.js, submissions.js
├── express (Router)
├── moment (date formatting)
└── config/database.js

routes/teams.js, participants.js, judging.js
├── express (Router)
└── config/database.js

seeds/seed.js
├── better-sqlite3
├── bcryptjs
└── path

Client-side (CDN):
├── jQuery 3.5.1 slim
├── Bootstrap 4.6.2 JS bundle
└── Bootstrap 4.6.2 CSS
```

## Engine Constraints

```json
{
  "engines": {
    "node": ">=16.0.0"
  }
}
```

No `.nvmrc` or `.node-version` file exists. Three devcontainer configurations target Node 16 (legacy), Node 20 (root), and Node 22 (modern).
