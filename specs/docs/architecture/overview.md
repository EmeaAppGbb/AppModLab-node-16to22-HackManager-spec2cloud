# Architecture Overview — HackManager

_Extracted on 2026-03-30. Documents the architecture as it exists in the modernized codebase._

## System Boundaries

HackManager is a **single-process monolithic web application** — one deployable unit.

| Property | Value |
|----------|-------|
| **Name** | HackManager |
| **Runtime** | Node.js ≥22.0.0 |
| **Entry point** | `src/app.js` |
| **Framework** | Express 4.18 |
| **View engine** | EJS (server-side rendered) |
| **Database** | SQLite via better-sqlite3 12.x |
| **Deployment artifact** | Docker container (node:22-alpine) or bare Node.js process |

There are no separate microservices, workers, or background processes. All HTTP request handling, session management, and database access occur within the single Express process.

## High-Level Architecture

```mermaid
graph TB
    subgraph Client["Browser"]
        HTML["HTML Pages"]
        CSS["Bootstrap 5.3.3 CDN"]
        JS["main.js"]
    end

    subgraph Server["Node.js Express Application"]
        subgraph MW["Global Middleware Chain"]
            BP["Body Parser<br/>express.urlencoded + json"]
            SESS["Session<br/>express-session + SQLite store"]
            CSRF["CSRF Protection<br/>csrf-csrf double-submit"]
            RL["Rate Limiter<br/>express-rate-limit"]
        end

        subgraph Routes["Route Layer (7 routers)"]
            RI["index.js<br/>(dashboard)"]
            RA["auth.js<br/>(login/register/logout)"]
            RH["hackathons.js<br/>(CRUD)"]
            RT["teams.js<br/>(list/create/view)"]
            RP["participants.js<br/>(list/join)"]
            RS["submissions.js<br/>(list/create/view)"]
            RJ["judging.js<br/>(list/score)"]
        end

        subgraph MWR["Route Middleware"]
            AUTH["auth.requireAuth<br/>auth.requireJudge<br/>auth.requireOwnerOrAdmin"]
            VAL["express-validator<br/>validation rules"]
        end

        subgraph Services["Service Layer (7 services)"]
            SA["authService"]
            SH["hackathonService"]
            ST["teamService"]
            SP["participantService"]
            SS["submissionService"]
            SJ["judgingService"]
            SD["dashboardService"]
        end

        subgraph Repos["Repository Layer"]
            REPO["repositories/index.js<br/>userRepo · hackathonRepo<br/>teamRepo · participantRepo<br/>submissionRepo · judgeRepo · scoreRepo"]
        end

        subgraph Utils["Utilities"]
            LOG["logger.js<br/>(pino)"]
            DT["dates.js<br/>(date-fns)"]
        end
    end

    subgraph Data["Data Layer"]
        DB[("SQLite<br/>hackathon.db<br/>WAL mode<br/>FK enforced")]
        SESSDB[("sessions table<br/>in same DB")]
    end

    Client -->|HTTP| MW
    MW --> Routes
    Routes --> MWR
    MWR --> Routes
    Routes --> Services
    Services --> Repos
    Services --> DT
    Repos --> DB
    SESS --> SESSDB
    Routes --> LOG
    Services --> LOG
```

The application follows a **layered monolith** pattern: Routes → Services → Repositories → Database. Routes act as thin controllers (≤15 lines), delegating business logic to services. Repositories encapsulate all SQL queries. The layers communicate through direct function calls — there are no event buses, message queues, or inter-process communication.

## Middleware Pipeline

Every HTTP request passes through the global middleware chain in this exact order:

```mermaid
flowchart LR
    REQ["HTTP Request"] --> BP["1. Body Parser"]
    BP --> SESS["2. Session"]
    SESS --> STATIC["3. Static Files"]
    STATIC --> USER["4. res.locals.user"]
    USER --> COOKIE["5. Cookie Parser"]
    COOKIE --> CSRFGEN["6. CSRF Token Gen"]
    CSRFGEN --> CSRFVAL["7. CSRF Validate"]
    CSRFVAL --> RATE["8. Rate Limit<br/>(auth routes only)"]
    RATE --> ROUTE["9. Route Handler"]
    ROUTE --> ERR["10. Error Handler"]
    ERR --> RES["HTTP Response"]

    style CSRFVAL fill:#f9f,stroke:#333
    style RATE fill:#ff9,stroke:#333
    style ERR fill:#f66,stroke:#333
```

| Order | Middleware | Source | Applies To |
|-------|-----------|--------|-----------|
| 1 | `express.urlencoded()` + `express.json()` | app.js:30–31 | All requests |
| 2 | `express-session` (SQLite store) | app.js:35–41 | All requests |
| 3 | `express.static()` | app.js:44 | All requests |
| 4 | `res.locals.user` injection | app.js:47–50 | All requests |
| 5 | `cookieParser()` | app.js:53 | All requests |
| 6 | `generateCsrfToken` → `res.locals.csrfToken` | app.js:62–66 | All requests |
| 7 | `doubleCsrfProtection` | app.js:69 | POST/PUT/DELETE |
| 8a | `authLoginLimiter` (10 req/15min) | app.js:99 | POST /auth/login |
| 8b | `authRegisterLimiter` (5 req/15min) | app.js:100 | POST /auth/register |
| 9 | Route handlers (+ route-specific middleware) | app.js:98–106 | Matched routes |
| 10 | Error handler (CSRF + generic) | app.js:116–130 | Uncaught errors |

## Data Flow

### Typical Read Flow (GET / — Dashboard)

```mermaid
sequenceDiagram
    participant B as Browser
    participant MW as Middleware Chain
    participant R as routes/index.js
    participant S as dashboardService
    participant Repo as repositories
    participant DB as SQLite

    B->>MW: GET /
    MW->>R: Authenticated request
    R->>S: getStats()
    S->>Repo: hackathonRepo.count()
    Repo->>DB: SELECT COUNT(*) FROM hackathons
    DB-->>Repo: {count: N}
    S->>Repo: teamRepo.count()
    Repo->>DB: SELECT COUNT(*) FROM teams
    DB-->>Repo: {count: N}
    S->>Repo: participantRepo.count()
    Repo->>DB: SELECT COUNT(*) FROM participants
    DB-->>Repo: {count: N}
    S->>Repo: hackathonRepo.findRecent(3)
    Repo->>DB: SELECT * FROM hackathons ORDER BY created_at DESC LIMIT 3
    DB-->>Repo: [hackathons]
    Repo-->>S: [hackathons]
    S-->>R: {hackathons, stats}
    R-->>B: HTML (index.ejs rendered)
```

### Typical Write Flow (POST /auth/login)

```mermaid
sequenceDiagram
    participant B as Browser
    participant CSRF as CSRF Middleware
    participant RL as Rate Limiter
    participant VAL as Validation
    participant R as routes/auth.js
    participant S as authService
    participant Repo as userRepo
    participant DB as SQLite
    participant BC as bcrypt

    B->>CSRF: POST /auth/login {username, password, _csrf}
    CSRF->>RL: Token validated
    RL->>VAL: Under rate limit
    VAL->>R: Fields valid
    R->>S: authenticate(username, password)
    S->>Repo: findByUsername(username)
    Repo->>DB: SELECT * FROM users WHERE username = ?
    DB-->>Repo: user row
    Repo-->>S: user object
    S->>BC: bcrypt.compare(password, user.password)
    BC-->>S: true/false
    S-->>R: {id, username, email, role} or null
    R->>R: req.session.user = user
    R-->>B: 302 Redirect to /
```

### Complex Write Flow (POST /submissions/:id/score)

```mermaid
sequenceDiagram
    participant B as Browser
    participant MW as CSRF + Auth + Validation
    participant R as routes/judging.js
    participant S as judgingService
    participant SR as submissionRepo
    participant JR as judgeRepo
    participant SCR as scoreRepo
    participant DB as SQLite

    B->>MW: POST /submissions/5/score {scores, _csrf}
    MW->>R: Validated (judge role confirmed)
    R->>S: scoreSubmission(5, userId, scores)
    S->>SR: findById(5)
    SR->>DB: SELECT submissions.* ... WHERE id=5
    DB-->>SR: submission
    S->>DB: SELECT * FROM submissions WHERE id=5
    DB-->>S: raw submission (hackathon_id)
    S->>JR: findByUserAndHackathon(userId, hackathonId)
    JR->>DB: SELECT * FROM judges WHERE user_id=? AND hackathon_id=?
    DB-->>JR: null (judge not found)
    S->>JR: create(userId, hackathonId)
    JR->>DB: INSERT INTO judges ...
    DB-->>JR: {lastInsertRowid}
    S->>S: Calculate overall = avg(4 scores)
    S->>SCR: create({submission_id, judge_id, scores...})
    SCR->>DB: INSERT INTO scores ...
    DB-->>SCR: OK
    S-->>R: true
    R-->>B: 302 Redirect to /judging
```

## Integration Points

| Type | Technology | Version | Config Source | Used By |
|------|-----------|---------|---------------|---------|
| Database | SQLite (better-sqlite3) | 12.8.0 | `DATABASE_PATH` env var, default: `data/hackathon.db` | All repositories, session store |
| Session Store | better-sqlite3-session-store | 0.1.0 | `SESSION_SECRET` env var | express-session (app.js) |
| Password Hashing | bcryptjs | 2.4.3 | Hardcoded: 10 salt rounds, async | authService |
| CSRF Protection | csrf-csrf | 4.0.3 | `SESSION_SECRET` env var, cookie: `_csrf` | All POST/PUT/DELETE routes |
| Rate Limiting | express-rate-limit | 8.3.2 | Hardcoded thresholds | /auth/login, /auth/register |
| Input Validation | express-validator | 7.3.1 | Per-route rule sets | All POST routes |
| Logging | pino + pino-pretty | 10.x | `LOG_LEVEL` env var, `NODE_ENV` for transport | All modules |
| Date Formatting | date-fns | 4.1.0 | N/A | dashboardService, hackathonService, submissionService |
| View Rendering | EJS | 3.1.9 | `src/views/` directory | All route handlers |
| CSS Framework | Bootstrap (CDN) | 5.3.3 | Hardcoded CDN URL in header.ejs | Client-side |
| Static Assets | Express static middleware | — | `src/public/` directory | Client-side |
| Environment Config | dotenv | 17.3.1 | `.env` file | app.js (first line) |

### Environment Variables

| Variable | Required | Default | Used In |
|----------|----------|---------|---------|
| `SESSION_SECRET` | Yes (production) | `'hackathon-dev-fallback-secret'` | app.js (session, CSRF) |
| `PORT` | No | `3000` | app.js |
| `DATABASE_PATH` | No | `data/hackathon.db` | config/database.js |
| `NODE_ENV` | No | `development` | app.js (error handler), logger.js (transport) |
| `LOG_LEVEL` | No | `'info'` | utils/logger.js |

## Database Schema

```mermaid
erDiagram
    users {
        INTEGER id PK
        TEXT username UK
        TEXT email UK
        TEXT password
        TEXT role
        DATETIME created_at
    }
    hackathons {
        INTEGER id PK
        TEXT name
        TEXT description
        DATE start_date
        DATE end_date
        TEXT location
        INTEGER max_teams
        TEXT status
        INTEGER created_by FK
        DATETIME created_at
    }
    teams {
        INTEGER id PK
        TEXT name
        INTEGER hackathon_id FK
        TEXT project_name
        TEXT project_description
        TEXT repo_url
        DATETIME created_at
    }
    participants {
        INTEGER id PK
        INTEGER user_id FK
        INTEGER team_id FK
        INTEGER hackathon_id FK
        TEXT role
        DATETIME registered_at
    }
    submissions {
        INTEGER id PK
        INTEGER team_id FK
        INTEGER hackathon_id FK
        TEXT title
        TEXT description
        TEXT demo_url
        TEXT repo_url
        DATETIME submitted_at
    }
    judges {
        INTEGER id PK
        INTEGER user_id FK
        INTEGER hackathon_id FK
    }
    scores {
        INTEGER id PK
        INTEGER submission_id FK
        INTEGER judge_id FK
        INTEGER innovation
        INTEGER technical
        INTEGER presentation
        INTEGER impact
        REAL overall
        TEXT comments
        DATETIME scored_at
    }

    users ||--o{ hackathons : "creates"
    users ||--o{ participants : "participates"
    users ||--o{ judges : "judges"
    hackathons ||--o{ teams : "has"
    hackathons ||--o{ participants : "has"
    hackathons ||--o{ submissions : "has"
    hackathons ||--o{ judges : "has"
    teams ||--o{ participants : "has"
    teams ||--o{ submissions : "submits"
    submissions ||--o{ scores : "receives"
    judges ||--o{ scores : "gives"
```

7 entity tables + 1 `sessions` table (managed by better-sqlite3-session-store). Foreign key constraints are enforced at runtime via `PRAGMA foreign_keys = ON`. WAL journaling mode is enabled for concurrent read performance.

## Architectural Patterns Observed

| Pattern | Evidence |
|---------|----------|
| **Layered monolith** | Four distinct layers: Routes → Services → Repositories → Database. Import direction flows strictly downward. |
| **MVC (variant)** | Routes act as controllers, services contain model logic, EJS views render HTML. No formal "Model" class — repositories return plain objects. |
| **Repository pattern** | `src/repositories/index.js` encapsulates all SQL queries behind named methods per entity. No raw SQL appears in routes or services. |
| **Service layer** | `src/services/` contains one service per feature area. Services compose repository calls and contain business logic (score calculation, date formatting, auth flow). |
| **Middleware chain** | Express middleware pipeline handles cross-cutting concerns (auth, CSRF, rate limiting, validation) before route handlers execute. |
| **Factory middleware** | `requireOwnerOrAdmin(resourceQuery)` is a factory function that returns a middleware closure parameterized by SQL query. |
| **Server-side rendering** | All HTML generated server-side via EJS templates. No client-side SPA framework. No AJAX/fetch calls. |
| **Singleton database** | Single SQLite connection held in `config/database.js` module scope. All repositories share this connection via `getDb()`. |
