# Architecture Overview

## System Architecture

```mermaid
graph TB
    subgraph Client["Browser (Client)"]
        HTML["HTML Pages"]
        CSS["Bootstrap 4.6 + Custom CSS"]
        JS["jQuery 3.5.1 + main.js"]
    end

    subgraph Server["Node.js Express Server"]
        App["app.js<br/>(entry point)"]
        
        subgraph Middleware["Middleware Layer"]
            BP["body-parser<br/>(URL-encoded + JSON)"]
            SM["express-session<br/>(MemoryStore)"]
            SF["Static Files<br/>(public/)"]
            UL["User Locals<br/>(session → views)"]
        end

        subgraph Routes["Route Layer (7 modules)"]
            RI["index.js<br/>GET /"]
            RA["auth.js<br/>/auth/*"]
            RH["hackathons.js<br/>/hackathons/*"]
            RT["teams.js<br/>/teams/*"]
            RP["participants.js<br/>/participants/*"]
            RS["submissions.js<br/>/submissions/*"]
            RJ["judging.js<br/>/judging/*"]
        end

        subgraph AuthMW["Auth Middleware"]
            ReqAuth["requireAuth()"]
            ReqJudge["requireJudge()"]
        end

        subgraph Views["EJS Template Layer"]
            Layout["layout/<br/>header + footer"]
            Pages["Feature Pages<br/>(auth, hackathons, teams,<br/>submissions, judging, etc.)"]
        end

        subgraph Data["Data Layer"]
            DB["config/database.js<br/>(singleton)"]
        end
    end

    subgraph Storage["File System"]
        SQLite["data/hackathon.db<br/>(SQLite + WAL)"]
    end

    Client -->|HTTP Requests| App
    App --> Middleware
    Middleware --> Routes
    Routes --> AuthMW
    Routes --> Views
    Routes --> DB
    DB --> SQLite
    Views --> Layout
    Views -->|Rendered HTML| Client
    
    style Client fill:#e8f4f8
    style Server fill:#f8f8e8
    style Storage fill:#f8e8e8
```

## Request Flow

```mermaid
sequenceDiagram
    participant B as Browser
    participant E as Express App
    participant MW as Middleware
    participant R as Route Handler
    participant A as Auth Middleware
    participant D as Database
    participant V as EJS View

    B->>E: HTTP Request
    E->>MW: body-parser (parse body)
    MW->>MW: express-session (load/create session)
    MW->>MW: static files check
    MW->>MW: set res.locals.user from session
    MW->>R: Route matching
    
    alt Protected Route
        R->>A: requireAuth() / requireJudge()
        alt Not Authenticated
            A-->>B: Redirect → /auth/login
        else Authenticated
            A->>R: next()
        end
    end
    
    R->>D: db.prepare(SQL).get/all/run(params)
    D-->>R: Result rows
    R->>V: res.render(template, data)
    V-->>B: HTML Response
```

## Component Inventory

### Entry Point
- **`src/app.js`** — Express application setup; mounts all middleware and routes; starts HTTP server on `PORT` (default 3000)

### Middleware (applied in order)
1. **`body-parser.urlencoded`** — Parses URL-encoded form bodies
2. **`body-parser.json`** — Parses JSON request bodies
3. **`express-session`** — Session management with hardcoded secret, MemoryStore
4. **`express.static`** — Serves `src/public/` (CSS, JS)
5. **User locals** — Copies `req.session.user` to `res.locals.user` for all views
6. **404 handler** — Creates "Not Found" error for unmatched routes
7. **Error handler** — Renders `error.ejs` with error details

### Auth Middleware (`src/middleware/auth.js`)
- **`requireAuth`** — Checks `req.session.user` exists; redirects to `/auth/login` if missing
- **`requireJudge`** — Checks `req.session.user.role` is `'judge'` or `'admin'`; returns 403 if not

### Route Modules (7 files in `src/routes/`)
| Module | Mount Point | Responsibilities |
|--------|------------|-----------------|
| `index.js` | `/` | Dashboard with aggregate stats and recent hackathons |
| `auth.js` | `/auth` | Login, register, logout; session creation/destruction |
| `hackathons.js` | `/` | CRUD for hackathons; date formatting with moment.js |
| `teams.js` | `/` | Create and view teams; member listing |
| `participants.js` | `/` | List participants; join hackathon |
| `submissions.js` | `/` | Submit projects; view with scores |
| `judging.js` | `/` | Score submissions; auto-create judge records |

### View Layer (EJS)
- **Layout partials**: `header.ejs` (navbar, CDN links), `footer.ejs` (scripts, CDN links)
- **Per-feature directories**: Each route module has corresponding views in `src/views/{feature}/`
- **Shared templates**: `index.ejs` (dashboard), `error.ejs` (error page)

### Data Layer
- **`src/config/database.js`** — Singleton pattern; `initDatabase()` creates tables, `getDb()` returns instance
- **No ORM/query builder** — Raw SQL via `better-sqlite3` prepared statements
- **No repository pattern** — SQL queries inline in route handlers
- **No service layer** — Business logic embedded in route handlers

## Architecture Characteristics

| Characteristic | Current State |
|---------------|---------------|
| **Pattern** | Traditional server-rendered MPA (monolithic) |
| **Layering** | 2-layer: Routes → Database (no service/repository layers) |
| **State management** | Server-side sessions (express-session MemoryStore) |
| **Authentication** | Session-based with bcrypt password hashing |
| **Authorization** | Middleware-level (requireAuth, requireJudge); no resource-level ownership checks |
| **API style** | HTML-form POST (no REST API, no JSON endpoints) |
| **Data access** | Synchronous SQLite via prepared statements |
| **Error handling** | try/catch in routes; generic error rendering |
| **Logging** | `console.log` / `console.error` only |
| **Configuration** | Mostly hardcoded; only PORT from env |
| **Scalability** | Single-process, file-based DB, in-memory sessions — not horizontally scalable |

## Integration Points

| Integration | Type | Direction |
|------------|------|-----------|
| SQLite database | File I/O | Read/Write |
| CDN (jsdelivr.net) | HTTP | Outbound (client-side only) |

No external API integrations, no message queues, no caching layers, no third-party services.
