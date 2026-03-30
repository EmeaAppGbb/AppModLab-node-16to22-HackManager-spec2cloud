# Technology Stack

## Runtime

| Component | Technology | Version | Notes |
|-----------|-----------|---------|-------|
| Language | JavaScript (ES5/ES6 mix) | — | CommonJS modules (`require`), `var` at module level, `const`/`let` in functions |
| Runtime | Node.js | ≥16.0.0 (engine constraint) | Currently running v22.15.0; no `.nvmrc` or `.node-version` |
| Package Manager | npm | lockfileVersion 3 | 148 total packages (119 prod, 30 dev) |

## Backend

| Component | Technology | Version | Notes |
|-----------|-----------|---------|-------|
| Web Framework | Express.js | ^4.18.2 (installed 4.22.1) | Server-rendered MPA; 7 route modules mounted on app |
| Template Engine | EJS | ^3.1.9 (installed 3.1.10) | Views in `src/views/`; layout partials (header, footer) |
| Database | SQLite | via better-sqlite3 ^9.6.0 | File-based at `data/hackathon.db`; WAL mode enabled |
| Body Parsing | body-parser | ^1.20.2 | Redundant — Express 4.16+ has built-in equivalent |
| Session Management | express-session | ^1.17.3 | In-memory store (MemoryStore default); no persistent store |
| Password Hashing | bcryptjs | ^2.4.3 | Pure JS bcrypt; salt rounds = 10; sync API used |
| Date Formatting | moment.js | ^2.29.4 | Used in routes for display formatting (MMM D, YYYY) |

## Frontend

| Component | Technology | Version | Delivery |
|-----------|-----------|---------|----------|
| CSS Framework | Bootstrap | 4.6.2 | CDN (`cdn.jsdelivr.net`) |
| JS Library | jQuery | 3.5.1 (slim) | CDN (`cdn.jsdelivr.net`) |
| Custom CSS | style.css | — | `src/public/css/style.css` (237 lines) |
| Custom JS | main.js | — | `src/public/js/main.js` (~75 lines) |
| Design Theme | Purple gradient | — | `#667eea` → `#764ba2` jumbotron; card hover effects |

## Dev Tooling

| Component | Technology | Version | Notes |
|-----------|-----------|---------|-------|
| Dev Server | nodemon | ^2.0.22 | Auto-restart on file changes |
| Linting | None | — | ESLint/Prettier referenced in devcontainers but no config files |
| Testing | None | — | No test framework, no test scripts, no test files |
| CI/CD | None | — | No GitHub Actions, no Dockerfile, no docker-compose |
| Containers | DevContainers | — | 3 configs: root (Node 20), legacy (Node 16), modern (Node 22) |

## Project Structure

```
src/
├── app.js                    # Express app entry point (79 lines)
├── config/
│   └── database.js           # SQLite init + schema (101 lines)
├── middleware/
│   └── auth.js               # requireAuth, requireJudge middleware
├── routes/
│   ├── index.js              # GET / (dashboard)
│   ├── auth.js               # Login, register, logout
│   ├── hackathons.js         # Hackathon CRUD
│   ├── teams.js              # Team CRUD
│   ├── participants.js       # Participant registration
│   ├── submissions.js        # Project submissions
│   └── judging.js            # Scoring interface
├── views/
│   ├── layout/               # header.ejs, footer.ejs partials
│   ├── auth/                 # login.ejs, register.ejs
│   ├── hackathons/           # list, show, new, edit templates
│   ├── teams/                # list, show, new templates
│   ├── participants/         # list template
│   ├── submissions/          # list, show, new templates
│   ├── judging/              # list, score templates
│   ├── index.ejs             # Dashboard/homepage
│   └── error.ejs             # Error page
└── public/
    ├── css/style.css         # Custom styles
    └── js/main.js            # Client-side interactivity
data/
└── hackathon.db              # SQLite database file
seeds/
└── seed.js                   # Sample data seeder (8 users, 3 hackathons, 5 teams, etc.)
```

## Coding Conventions Observed

- **Module format**: CommonJS (`require` / `module.exports`)
- **Variable declarations**: `var` at module scope, `const`/`let` inside functions
- **Function style**: Mixed — `function(req, res)` callbacks and some arrow functions
- **Async model**: Synchronous — better-sqlite3 sync API, `bcrypt.hashSync/compareSync`
- **SQL style**: Parameterized prepared statements (`db.prepare('...?...').get(param)`)
- **Error handling**: try/catch blocks in route handlers with `console.error` logging
- **Routing**: Express Router per feature area, all mounted on root app
