# Developer Onboarding Guide

> **Get up and running with the HackManager Node.js Modernization Workshop in minutes.**

This guide covers **3 options** to set up your development environment. Choose the one that best fits your situation.

---

## Quick Comparison

| Option | Setup Time | Requirements | OS | Best For |
|--------|-----------|--------------|-----|----------|
| **1. GitHub Codespaces** | ~2 min | Browser + GitHub account | Any | Fastest start, workshops, no local install |
| **2. VS Code Dev Container** | ~5 min | Docker Desktop + VS Code | Any | Offline, same container as Codespaces |
| **3. Local Setup with nvm** | ~10 min | nvm + VS Code or any editor | Any | Full control, switch Node versions locally |

---

## Option 1: GitHub Codespaces (Recommended)

**Zero install. Works in your browser.**

GitHub Codespaces provides a complete cloud-hosted development environment pre-configured with all the tools you need.

### Steps

1. Navigate to the repository on GitHub
2. Click the green **Code** button
3. Select the **Codespaces** tab
4. Click **Create codespace on main**

![Create Codespace](https://docs.github.com/assets/cb-138303/mw-1440/images/help/codespaces/new-codespace-button.webp)

> ⚠️ **Important:** This repository contains **two Dev Container configurations**. When creating a Codespace (or reopening in a container), you will be prompted to choose one:
>
> | Configuration | Node Version | Purpose |
> |---------------|-------------|---------|
> | **Legacy Node 16** | Node.js 16 | Run the original legacy application as-is |
> | **Modern Node 22** | Node.js 22 | Target environment for the modernized application |
>
> **Start with the Legacy Node 16 container** to explore the application before modernizing it.

### What's Included

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 16 (legacy) or 22 (modern) | Runtime for the application |
| npm | Bundled with Node.js | Package management |
| ESLint | Extension | Code linting |
| Prettier | Extension | Code formatting |
| GitHub Copilot | Extension | AI-assisted modernization |

### Switching Between Containers

To switch from the **Legacy** container to the **Modern** container (or vice versa):

1. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Select **Dev Containers: Reopen in Container**
3. Choose the desired configuration

### Performance Tips

- Choose a **2-core** or **4-core** machine type (sufficient for this workshop)
- Codespaces auto-stop after 30 minutes of inactivity

---

## Option 2: VS Code Dev Container (Local Docker)

**Same environment as Codespaces, running locally.**

This uses the same `.devcontainer` configurations but runs on your local Docker installation.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- [VS Code](https://code.visualstudio.com/) with the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/EmeaAppGbb/AppModLab-node-16to22-HackManager-spec2cloud.git
   cd AppModLab-node-16to22-HackManager-spec2cloud
   ```

2. Open in VS Code:
   ```bash
   code .
   ```

3. When prompted **"Reopen in Container"**, click **Yes**
   - Or use the Command Palette: `Dev Containers: Reopen in Container`
   - **Select the "Legacy Node 16" configuration** to start with the original application

4. Wait for the container to build (~2-3 minutes on first run)

### Two Container Configurations

This repository provides two Dev Container configurations under `.devcontainer/`:

| Folder | Image | Node Version | Use Case |
|--------|-------|-------------|----------|
| `.devcontainer/legacy/` | `mcr.microsoft.com/devcontainers/javascript-node:16` | 16.x | Run and explore the legacy application |
| `.devcontainer/modern/` | `mcr.microsoft.com/devcontainers/javascript-node:22` | 22.x | Modernize and run the upgraded application |

**Workflow:**
1. Start in the **Legacy** container → run the app, explore the codebase
2. Switch to the **Modern** container → modernize the code and verify it runs on Node.js 22

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Docker not running | Start Docker Desktop before opening VS Code |
| Port conflict on 3000 | Stop any process using port 3000: `lsof -ti:3000 \| xargs kill` |
| Slow build | Ensure Docker has at least 2 GB RAM allocated |
| `node_modules` errors after switching | Delete `node_modules` and run `npm install` again |

---

## Option 3: Local Setup with nvm

**Full control with Node Version Manager — switch between Node.js 16 and 22 instantly.**

This option is ideal if you prefer working locally without Docker and want to experience the version switch firsthand.

### Prerequisites

| Requirement | Download |
|-------------|----------|
| **nvm** (Node Version Manager) | [nvm for Linux/macOS](https://github.com/nvm-sh/nvm) or [nvm-windows](https://github.com/coreybutler/nvm-windows) |
| **VS Code** or any editor | [Download](https://code.visualstudio.com/) |
| **Git** | [Download](https://git-scm.com/) |
| **GitHub Copilot** | [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot) |

### Install nvm

**Windows:**
```powershell
# Download and run the nvm-windows installer from:
# https://github.com/coreybutler/nvm-windows/releases
# Then restart your terminal
```

**macOS / Linux:**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
# Restart your terminal or run: source ~/.bashrc
```

### Install Node.js Versions

```bash
# Install the legacy version
nvm install 16

# Install the modern target version
nvm install 22
```

### Run the Legacy Application (Node.js 16)

```bash
# Switch to Node.js 16
nvm use 16
node --version  # Should show v16.x.x

# Clone and set up the project
git clone https://github.com/EmeaAppGbb/AppModLab-node-16to22-HackManager-spec2cloud.git
cd AppModLab-node-16to22-HackManager-spec2cloud

# Install dependencies and seed the database
npm install
npm run seed

# Start the application
npm start
```

Open **http://localhost:3000** in your browser.

### Switch to Node.js 22 (After Modernization)

```bash
# Switch to Node.js 22
nvm use 22
node --version  # Should show v22.x.x

# Reinstall dependencies (native modules may need recompilation)
rm -rf node_modules
npm install

# Start the modernized application
npm start
```

### Troubleshooting

| Issue | Solution |
|-------|----------|
| `nvm` not found | Restart your terminal after installing nvm |
| `better-sqlite3` build errors | Run `npm rebuild` after switching Node versions |
| `node_modules` stale after version switch | Delete `node_modules` and run `npm install` |
| Permission errors (Linux/macOS) | Do **not** use `sudo` with nvm — reinstall nvm if needed |

---

## After Setup — Start the Workshop

Regardless of which option you chose:

1. **Read the main [README.md](README.md)** for the full workshop walkthrough
2. **Run the legacy application** on Node.js 16 to understand the starting point
3. **Initialize Spec2Cloud** with `npx spec2cloud init`
4. **Follow the modernization steps** in the README

---

## Troubleshooting

### General

| Issue | Solution |
|-------|----------|
| `node` or `npm` not found | Restart your terminal after installing Node.js or nvm |
| Extensions not loading | Reload VS Code window (`Ctrl+Shift+P` → `Reload Window`) |
| Git clone fails | Check your GitHub access — you may need to configure SSH keys or a PAT |
| Port 3000 already in use | Kill the existing process or set a different port: `PORT=3001 npm start` |

### Codespaces

| Issue | Solution |
|-------|----------|
| Codespace won't start | Check [GitHub Status](https://www.githubstatus.com/) for outages |
| Extensions missing | Run `Dev Containers: Rebuild Container` from the Command Palette |
| Slow performance | Switch to a larger machine type (Settings → Change machine type) |
| Wrong Node version | Check which container config you selected; reopen in the correct one |

### Database

| Issue | Solution |
|-------|----------|
| Database not found | Run `npm run seed` to create and populate the database |
| Database locked | Stop other instances of the app, then retry |
| Seed fails | Delete `data/hackathon.db` and run `npm run seed` again |

---

## Repository Structure (Developer View)

```
AppModLab-node-16to22-HackManager-spec2cloud/
├── .devcontainer/               # Dev Container / Codespaces configuration
│   ├── legacy/
│   │   └── devcontainer.json    #   Node.js 16 container (legacy app)
│   └── modern/
│       └── devcontainer.json    #   Node.js 22 container (modernized app)
├── src/                         # Application source code
│   ├── app.js                   #   Express application entry point
│   ├── config/
│   │   └── database.js          #   SQLite database configuration
│   ├── middleware/
│   │   └── auth.js              #   Authentication middleware
│   ├── routes/                  #   Express route handlers
│   │   ├── auth.js              #     Login, register, logout
│   │   ├── hackathons.js        #     Hackathon CRUD
│   │   ├── teams.js             #     Team management
│   │   ├── participants.js      #     Participant registration
│   │   ├── submissions.js       #     Project submissions
│   │   ├── judging.js           #     Scoring and judging
│   │   └── index.js             #     Dashboard / home
│   ├── views/                   #   EJS templates
│   │   ├── layout/              #     Header & footer partials
│   │   ├── auth/                #     Login & register views
│   │   ├── hackathons/          #     Hackathon views
│   │   ├── teams/               #     Team views
│   │   ├── submissions/         #     Submission views
│   │   ├── judging/             #     Judging views
│   │   └── participants/        #     Participant views
│   └── public/                  #   Static assets (CSS, JS)
├── seeds/
│   └── seed.js                  #   Database seed script
├── data/                        #   SQLite database (auto-created)
├── package.json                 #   Dependencies and scripts
├── DEVELOPER_GUIDE.md           #   This file
└── README.md                    #   Workshop walkthrough
```
