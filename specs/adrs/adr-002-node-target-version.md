# ADR-002: Node.js Target Version

## Status

Proposed

## Context

The HackManager application specifies `"node": ">=16.0.0"` in `package.json` engines. Node.js 16 reached End-of-Life in September 2023. The project includes devcontainer configurations for both Node 16 (legacy) and Node 22 (modern). The current runtime is Node.js v22.15.0.

The modernization assessment flagged this as finding C3 (Low severity) — the engine constraint is too permissive, allowing EOL runtimes.

## Decision Drivers

- **Security**: EOL Node versions receive no security patches
- **Compatibility**: Dependencies (especially native modules like better-sqlite3) require specific Node versions
- **LTS support**: Production should target Long-Term Support releases
- **Feature availability**: Modern Node.js features (ES modules, fetch API, test runner, etc.)

## Options Considered

### Option A: Node.js 20 LTS

- LTS until April 2026
- Mature, widely supported by all dependencies
- Conservative choice

### Option B: Node.js 22 LTS

- LTS until April 2027
- Current Active LTS (as of October 2024)
- Already running in the development environment (v22.15.0)
- Modern devcontainer already targets Node 22
- Supports all modern features (ES modules, built-in test runner, etc.)

## Recommendation

**Option B: Node.js 22 LTS**. The development environment already runs Node 22. The modern devcontainer targets Node 22. All current dependencies are compatible. This provides the longest support window and access to the latest language features.

## Implementation

1. Update `package.json` engines: `"node": ">=22.0.0"`
2. Remove the legacy Node 16 devcontainer (or archive for reference)
3. Add `.nvmrc` file with `22` for teams using nvm
4. Verify all native dependencies compile against Node 22

## Consequences

- Drops support for Node 16, 18, and 20 runtimes
- Gains access to modern Node.js features for future modernization
- Aligns with the modern devcontainer configuration already in the project
- Native modules (better-sqlite3) need compilation verification
