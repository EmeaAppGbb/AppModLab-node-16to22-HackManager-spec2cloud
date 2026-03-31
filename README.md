```
██╗  ██╗ █████╗  ██████╗██╗  ██╗
██║  ██║██╔══██╗██╔════╝██║ ██╔╝
███████║███████║██║     █████╔╝
██╔══██║██╔══██║██║     ██╔═██╗
██║  ██║██║  ██║╚██████╗██║  ██╗
╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
███╗   ███╗ █████╗ ███╗   ██╗ █████╗  ██████╗ ███████╗██████╗
████╗ ████║██╔══██╗████╗  ██║██╔══██╗██╔════╝ ██╔════╝██╔══██╗
██╔████╔██║███████║██╔██╗ ██║███████║██║  ███╗█████╗  ██████╔╝
██║╚██╔╝██║██╔══██║██║╚██╗██║██╔══██║██║   ██║██╔══╝  ██╔══██╗
██║ ╚═╝ ██║██║  ██║██║ ╚████║██║  ██║╚██████╔╝███████╗██║  ██║
╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝
███████╗██████╗ ███████╗ ██████╗██████╗  ██████╗██╗      ██████╗ ██╗   ██╗██████╗
██╔════╝██╔══██╗██╔════╝██╔════╝╚════██╗██╔════╝██║     ██╔═══██╗██║   ██║██╔══██╗
███████╗██████╔╝█████╗  ██║      █████╔╝██║     ██║     ██║   ██║██║   ██║██║  ██║
╚════██║██╔═══╝ ██╔══╝  ██║     ██╔═══╝ ██║     ██║     ██║   ██║██║   ██║██║  ██║
███████║██║     ███████╗╚██████╗███████╗╚██████╗███████╗╚██████╔╝╚██████╔╝██████╔╝
╚══════╝╚═╝     ╚══════╝ ╚═════╝╚══════╝ ╚═════╝╚══════╝ ╚═════╝  ╚═════╝ ╚═════╝
```

<div align="center">

### 🚀 **Node.js 16 → Node.js 22 Modernization with Spec2Cloud** 🚀

*Learn how to modernize legacy Node.js applications using **Spec-Driven Development** and the **Spec2Cloud** framework, powered by **GitHub Copilot** 🤖*

---

[![Node.js](https://img.shields.io/badge/Node.js_16_→_22-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![GitHub Copilot](https://img.shields.io/badge/GitHub_Copilot-000000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/features/copilot)
[![Azure](https://img.shields.io/badge/Azure_App_Service-0078D4?style=for-the-badge&logo=microsoftazure&logoColor=white)](https://azure.microsoft.com/)
[![Spec2Cloud](https://img.shields.io/badge/Spec2Cloud-FF6F00?style=for-the-badge&logo=rocket&logoColor=white)](https://github.com/EmeaAppGbb/spec2cloud)

</div>

---

## 📖 Table of Contents

- [🚀 Developer Onboarding](#-developer-onboarding)
- [🎯 About This Lab](#-about-this-lab)
- [💡 What is Spec2Cloud?](#-what-is-spec2cloud)
- [💡 What is Spec-Driven Development?](#-what-is-spec-driven-development)
- [🏆 The HackManager App](#-the-hackmanager-app)
- [📂 Repository Structure](#-repository-structure)
- [✅ Prerequisites](#-prerequisites)
- [🛠️ Modernization Steps](#️-modernization-steps)
  - [Step 1 — Initialize Spec2Cloud](#-step-1--initialize-spec2cloud)
  - [Step 2 — Launch GitHub Copilot](#-step-2--launch-github-copilot)
  - [Step 3 — Run Modernization Assessment](#-step-3--run-modernization-assessment)
  - [Step 4 — Review the Assessment](#-step-4--review-the-assessment)
  - [Step 5 — Generate the Modernization Plan](#-step-5--generate-the-modernization-plan)
  - [Step 6 — Review & Approve the Plan](#-step-6--review--approve-the-plan)
  - [Step 7 — Execute the Modernization](#-step-7--execute-the-modernization)
  - [Step 8 — Handle Breaking Changes](#-step-8--handle-breaking-changes)
  - [Step 9 — Modernization Complete! 🎉](#-step-9--modernization-complete-)
  - [Step 10 — Document Architecture](#-step-10--document-architecture)
  - [Step 11 — Generate Tests](#-step-11--generate-tests)
  - [Step 12 — CVEs & Security Analysis](#-step-12--cves--security-analysis)
  - [Step 13 — Evolve with a New Feature](#-step-13--evolve-with-a-new-feature)
- [🌿 Branches & Tags](#-branches--tags)
- [📚 Additional Resources](#-additional-resources)

---

## 🚀 Developer Onboarding

**3 ways to set up your environment** — pick the one that works for you:

| Option | Time | What You Need |
|--------|------|---------------|
| 🌐 [**GitHub Codespaces**](DEVELOPER_GUIDE.md#option-1-github-codespaces-recommended) | ~2 min | Just a browser |
| 🐳 [**VS Code Dev Container**](DEVELOPER_GUIDE.md#option-2-vs-code-dev-container-local-docker) | ~5 min | Docker + VS Code |
| 💻 [**Local Setup with nvm**](DEVELOPER_GUIDE.md#option-3-local-setup-with-nvm) | ~10 min | nvm + VS Code |

> 📖 **Full details:** [**DEVELOPER_GUIDE.md**](DEVELOPER_GUIDE.md)

---

## 🎯 About This Lab

This is a **hands-on lab repository** designed to teach you how to modernize a legacy **Node.js 16** application into a modern **Node.js 22** application using:

| Concept | Description |
|---------|-------------|
| 📝 **Spec-Driven Development** | A methodology where specifications drive the entire modernization lifecycle |
| ☁️ **Spec2Cloud Framework** | An AI-powered framework that translates specs into cloud-ready code |
| 🤖 **GitHub Copilot** | Your AI pair-programmer that orchestrates the modernization process |
| ☁️ **Azure App Service** | The target cloud platform for the modernized application |

> 💡 **Who is this for?** Developers, architects, and anyone interested in learning a structured, AI-assisted approach to Node.js application modernization.

---

## 💡 What is Spec2Cloud?

> 📖 **Full documentation:** [Spec2Cloud on GitHub](https://github.com/EmeaAppGbb/spec2cloud) | [Brownfield Guide](https://github.com/EmeaAppGbb/spec2cloud/blob/vNext/docs/brownfield.md)

**Spec2Cloud** is a framework that bridges the gap between **application specifications** and **cloud-ready implementations**. It uses AI-powered agents and GitHub Copilot skills to:

1. 🔍 **Assess** — Analyze your legacy codebase and generate comprehensive assessment documents
2. 📋 **Plan** — Create a detailed, step-by-step modernization plan based on the assessment
3. ⚙️ **Execute** — Automatically implement the modernization changes following the plan
4. ✅ **Validate** — Ensure the modernized application meets the original specifications

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  📝 ASSESS   │ ──▶ │  📋 PLAN     │ ──▶ │  ⚙️ EXECUTE  │ ──▶ │  ✅ VALIDATE │
│              │     │              │     │              │     │              │
│ Analyze code │     │ Generate     │     │ Implement    │     │ Test & verify│
│ Generate FRD │     │ modernization│     │ changes      │     │ specs met    │
│ Generate PRD │     │ roadmap      │     │ iteratively  │     │              │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

---

## 💡 What is Spec-Driven Development?

**Spec-Driven Development (SDD)** is a methodology where **specifications are the single source of truth** throughout the software lifecycle. Unlike traditional approaches where specs become outdated quickly, SDD ensures:

- 📄 **Specs are living documents** — They evolve with the code and are always up to date
- 🔗 **Traceability** — Every code change maps back to a specification requirement
- 🤖 **AI-Assisted** — GitHub Copilot uses specs as context to generate accurate, aligned code
- 🔄 **Iterative** — Specs and code evolve together through continuous feedback loops

---

## 🏆 The HackManager App

The **HackManager** application is a full-featured hackathon management platform built with **Node.js 16** and **Express**. It's the perfect candidate for a Node.js modernization lab! 🎓

### 🔧 Current Tech Stack (Legacy)

| Component | Technology |
|-----------|-----------|
| 🖥️ Runtime | Node.js 16 |
| 🌐 Framework | Express 4.x |
| 🎨 Templating | EJS |
| 🗃️ Database | SQLite (better-sqlite3) |
| 🔐 Auth | express-session + bcryptjs |
| 💅 UI | Bootstrap 4, Font Awesome |
| 📦 Package Mgr | npm |

### ✨ Application Features

- 🏆 **Hackathon CRUD** — Create, update, and manage hackathon events with status tracking (upcoming → active → completed)
- 👥 **Team Management** — Form teams, assign projects, and link repositories
- 📝 **Participant Registration** — Users join hackathons, form or join teams with leader/member roles
- 📦 **Project Submissions** — Teams submit projects with descriptions, demo URLs, and repository links
- ⭐ **Judging & Scoring** — Judges score submissions across four categories (innovation, technical, presentation, impact)
- 🔐 **Authentication** — Session-based auth with role-based access control (admin, judge, participant)
- 📊 **Dashboard** — Overview of active hackathons, teams, and recent activity
- 📱 **Responsive UI** — Bootstrap 4 interface with EJS server-side rendering

### 🔑 Demo Accounts

| Username | Password | Role | Access |
|----------|----------|------|--------|
| `admin` | `admin123` | Admin | Full access — manage hackathons & users |
| `judge_sarah` | `judge123` | Judge | Score submissions, view all hackathons |
| `judge_mike` | `judge123` | Judge | Score submissions, view all hackathons |
| `alice_dev` | `pass123` | Participant | Join teams, submit projects |
| `bob_coder` | `pass123` | Participant | Join teams, submit projects |
| `carol_hacker` | `pass123` | Participant | Join teams, submit projects |
| `dave_maker` | `pass123` | Participant | Join teams, submit projects |
| `eve_builder` | `pass123` | Participant | Join teams, submit projects |

### 📁 Project Structure

```
src/
├── app.js                  # Express application entry point
├── config/
│   └── database.js         # SQLite database initialization
├── middleware/
│   └── auth.js             # Authentication & authorization middleware
├── routes/
│   ├── index.js            # Dashboard / home
│   ├── auth.js             # Login, register, logout
│   ├── hackathons.js       # Hackathon CRUD routes
│   ├── teams.js            # Team management routes
│   ├── participants.js     # Participant registration routes
│   ├── submissions.js      # Project submission routes
│   └── judging.js          # Scoring and judging routes
├── views/
│   ├── layout/             # Header & footer partials
│   ├── auth/               # Login & register views
│   ├── hackathons/         # Hackathon views (list, show, new, edit)
│   ├── teams/              # Team views
│   ├── submissions/        # Submission views
│   ├── judging/            # Judging views
│   └── participants/       # Participant views
└── public/
    ├── css/                # Custom stylesheets
    └── js/                 # Client-side JavaScript
```

### ⚡ Quick Start (Legacy App)

```bash
npm install        # Install dependencies
npm run seed       # Seed the database with demo data
npm start          # Start the server on http://localhost:3000
```

---

## 📂 Repository Structure

```
📦 AppModLab-node-16to22-HackManager-spec2cloud
├── 📄 README.md              # 👈 You are here!
├── 📄 DEVELOPER_GUIDE.md     # 🚀 Developer onboarding (3 setup options)
├── 📂 .devcontainer/         # 🐳 Dev Container configurations
│   ├── 📂 legacy/            #   Node.js 16 container
│   └── 📂 modern/            #   Node.js 22 container
├── 📂 src/                   # 🏆 The legacy application source code
│   ├── 📄 app.js             #   Express entry point
│   ├── 📂 config/            #   Database configuration
│   ├── 📂 middleware/        #   Auth middleware
│   ├── 📂 routes/            #   Route handlers
│   ├── 📂 views/             #   EJS templates
│   └── 📂 public/            #   Static assets
├── 📂 seeds/                 # 🌱 Database seed script
├── 📂 data/                  # 🗃️ SQLite database (auto-created)
└── 📄 package.json           # 📦 Dependencies and scripts
```

### 🌿 Branches & Tags

| Branch | Description |
|--------|-------------|
| 🟢 `main` | The **starting point** — contains the legacy Node.js 16 codebase |
| 🏁 `final-solution` | The **finished result** — contains the fully modernized Node.js 22 application |

> 💡 **Pro Tip:** Each modernization step is **tagged** in the `final-solution` branch! You can compare your progress at any point, or jump ahead to study the approach and results without going through the entire process. 🔖

---

## ✅ Prerequisites

Before starting this lab, make sure you have the following:

| Requirement | Purpose |
|-------------|---------|
| 🖥️ **VS Code** | IDE for development |
| 🟢 **Node.js 16** | To run the legacy app (via nvm or Dev Container) |
| 🟢 **Node.js 22** | Target runtime for modernization |
| 📦 **npm** | Package management (bundled with Node.js) |
| 🤖 **GitHub Copilot** | AI assistant (requires active subscription) |
| ☁️ **Azure Subscription** *(optional)* | For deploying to Azure App Service |

> 📖 **Quick Start:** See the [**Developer Onboarding Guide**](DEVELOPER_GUIDE.md) for 3 ways to set up your environment — including **GitHub Codespaces** (zero install, ~2 min), **Dev Containers**, and **local nvm** options.

---

## 🛠️ Running the Current legacy application
To run the current legacy application, follow these steps:

1. **Set up your environment** using one of the options in the [Developer Onboarding Guide](DEVELOPER_GUIDE.md).

2. **Start the application**:
   - If using **GitHub Codespaces** or the **Node.js 16 Dev Container**, simply run:
     ```bash
     npm install
     npm run seed
     npm start
     ```
   - If using **local nvm**, first switch to Node.js 16:
     ```bash
     nvm use 16
     ```
     Then run:
     ```bash
     npm install
     npm run seed
     npm start
     ```

3. **Access the application**:
    Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to see the HackManager app in action!

    ![HackManager Homepage](/img/step0-legacyApp.png)
---

## 🛠️ Modernization Steps

Follow these steps to modernize the HackManager application from Node.js 16 to Node.js 22 using Spec2Cloud! 🚀

---

### 📌 Step 1 — Initialize Spec2Cloud

Open a terminal in the repository root and run:

```bash
npx spec2cloud init
```

You will be prompted to select the setup scope. Choose **🏗️ Brownfield** since we are modernizing an existing application.

> 📖 **Need more details?** Check out the full [Spec2Cloud Brownfield Documentation](https://github.com/EmeaAppGbb/spec2cloud/blob/vNext/docs/brownfield.md) for an in-depth guide on brownfield modernization scenarios.

> ℹ️ **What happens here?** Spec2Cloud scaffolds the necessary configuration files and Copilot skills into your repository, preparing it for the spec-driven modernization workflow.

![HackManager Spec2Cloud Initialization](/img/step1-init-spec2cloud.png)


---

### 📌 Step 2 — Launch GitHub Copilot

Start GitHub Copilot in your terminal:

```bash
copilot
```

> 💡 **Optional:** Use the `--yolo` flag for a smoother lab experience — this reduces the number of confirmation prompts so you can focus on the process:
>
> ```bash
> copilot --yolo
> ```

---

### 📌 Step 3 — Run Modernization Assessment

Use the **Modernization-Assessment** Spec2Cloud skill in Copilot:

```
/modernization-assessment
```

![HackManager Modernization Assessment](/img/step2-modernization-assessment.png)


Then, ask Copilot to **analyze the codebase** and generate the application architecture, Functional Requirements Documents (FRDs), and Product Requirements Documents (PRDs):

```
Analyse the codebase and generate specs
```

🎁 **What you get:** A rich set of documentation to help you deeply understand the application and its modernization needs! Copilot can also generate diagrams and architecture documentation based on the code analysis.

![HackManager Modernization Analysis](/img/step2-modernization-analysis.png)


---

### 📌 Step 4 — Review the Assessment

📖 **Read the output assessment documents** carefully and understand the modernization approach proposed for this application.

Key things to look for:
- 🔍 Identified Node.js 16 → 22 breaking changes and deprecated APIs
- 📋 Dependencies requiring major version upgrades (e.g., `better-sqlite3`, `bcryptjs`)
- ⚠️ Legacy patterns to modernize (`var` → `const`/`let`, `require` → `import`, callbacks → `async`/`await`)
- 📊 Effort estimation

> 🔧 **Customization:** You can tell Copilot to adjust the assessment based on your specific intent and requirements!

For this lab, we will proceed with the proposed modernization to **Node.js 22** and **Azure App Service** ☁️

---

### 📌 Step 5 — Generate the Modernization Plan

Ask Copilot to generate a detailed modernization plan using the **Modernization Planning** Spec2Cloud skill:

```
/modernization-planner
```

> 📋 **What you get:** A comprehensive, step-by-step implementation plan that breaks down the modernization into manageable, ordered tasks.

![HackManager Modernization Plan](/img/step2-modernization-plan.png)


---

### 📌 Step 6 — Review & Approve the Plan

📖 **Read the modernization plan** thoroughly and understand each step that will be taken to modernize the application.

- ✏️ You can ask Copilot to **modify the plan** based on your needs
- ✅ You will need to **give your consent** before Copilot begins executing the plan
- 🔄 The plan is iterative — you maintain full control at every stage

---

### 📌 Step 7 — Execute the Modernization

Once approved, the modernization process begins! 🏗️

Copilot will **iterate through each step** of the modernization plan and execute the changes automatically. You can:

- 👀 **Monitor progress** in the terminal output
- 📄 **Review generated documentation** as changes are made
- 🛑 **Pause or intervene** at any point if needed

Typical modernization changes for a Node.js 16 → 22 upgrade include:

| Area | Legacy (Node 16) | Modern (Node 22) |
|------|------------------|-------------------|
| Module syntax | `var x = require('y')` | `import x from 'y'` (ESM) |
| Variables | `var` everywhere | `const` / `let` |
| Functions | `function(req, res)` | Arrow functions, `async/await` |
| String handling | String concatenation | Template literals |
| Error handling | Callbacks, basic try/catch | Structured error handling |
| Dependencies | Older package versions | Updated, secure versions |
| Engine field | `"node": ">=16.0.0"` | `"node": ">=22.0.0"` |


![HackManager Modernization Implementation](/img/step2-modernization-implementation.png)


---

### 📌 Step 8 — Handle Breaking Changes

⚠️ Upgrading from Node.js 16 to 22 spans **three major versions** (17→18→19→20→21→22), which means several breaking changes need attention.

Copilot will present you with decisions around:

- 📦 **Native module recompilation** — `better-sqlite3` uses native bindings that must be rebuilt for Node.js 22
- 🔄 **CommonJS vs ESM** — Whether to migrate to ES Modules (`import`/`export`) or stay with CommonJS
- 🔒 **Security updates** — Updated OpenSSL, stricter URL parsing, fetch API now built-in
- 📋 **Deprecated API removal** — APIs deprecated in Node 16 that are removed in later versions

> 🔧 **This is a key decision point!** Take your time to evaluate the options and choose the approach that best fits your scenario.

---

### 📌 Step 9 — Modernization Complete! 🎉

🥳 **Congratulations!** Once the modernization process is completed, you will have:

| Outcome | Details |
|---------|---------|
| ✅ **Modernized Application** | Running on Node.js 22 with modern JavaScript patterns |
| ☁️ **Cloud-Ready** | Configured for Azure App Service deployment |
| 📚 **Full Documentation** | Detailed record of every change and decision |
| 🔍 **Traceability** | Every change mapped back to original specifications |

> 🚀 **Verify it works!** Switch to the **Modern Node 22** Dev Container (or run `nvm use 22`) and start the application:
> ```bash
> rm -rf node_modules
> npm install
> npm run seed
> npm start
> ```
> Open **http://localhost:3000** and verify all features work correctly.

> 🚀 **But we're not done yet!** The following steps demonstrate how Spec2Cloud goes beyond modernization — helping you document, test, secure, and evolve your application.

---

### 📌 Step 10 — Document Architecture

🏛️ Continue to explore the power of Spec2Cloud by asking Copilot to generate architecture documentation for the modernized application. Leverage the **Architecture Mapper** skill to document your new version of the application:

```
/architecture-mapper based on the modernized code document all the architecture components
```

🎁 **What you get:** A detailed architecture documentation for your modernized application, including diagrams and component descriptions. This documentation will be invaluable for onboarding new team members and maintaining the application in the future.

![HackManager Architecture Mapper](/img/step3-architecture.png)

---

### 📌 Step 11 — Generate Tests

🧪 Use the **Test Generation** skill to automatically create a comprehensive test suite for your modernized application:

```
/test-generation based on this new application generate all the tests for this application
```

> ✅ **What you get:** A full set of unit and integration tests aligned with your application's specifications, ensuring your modernized code is robust and regression-proof.

![HackManager Test Generation](/img/step4-test-implement.png)


---

### 📌 Step 12 — CVEs & Security Analysis

🔐 Use the **Security Assessment** skill to perform a full audit for security vulnerabilities and CVEs on your modernized application:

```
/security-assessment with this new modernized application perform a audit for security vulnerabilities and CVEs
```

![HackManager Security Assessment](/img/step4-sec-assessment.png)


Next, plan the remediation of the identified security issues with the **Security Planner** skill:

```
/security-planner
```

![HackManager Security Assessment Plan](/img/step4-sec-plan.png)


Finally, execute the security remediation plan:

```
implement the security remediation plan
```

> 🛡️ **What you get:** A security-hardened application with identified CVEs remediated and documented.

![HackManager Security Assessment Implementation](/img/step4-sec-implement.png)


---

### 📌 Step 13 — Evolve with a New Feature

🌱 Now that you have a modernized application, you can continue to evolve it using the **Spec-Driven Development** approach. Specify a new feature in the specifications and ask Copilot to implement it — ensuring your application continues to meet evolving user needs while maintaining a clear link between specifications and implementation.

Try it out for yourself! For example, you could specify a new feature like **"Hackathon Leaderboard — A real-time leaderboard page that ranks teams by their overall scores"** or another feature of your choice.

**1️⃣ Add the new requirement to the specifications:**

```
Add the following requirement to the specifications: "Hackathon Leaderboard — A real-time leaderboard page that ranks teams by their overall scores with filtering by hackathon."
```

Review the updated specifications to ensure that the new requirement has been properly incorporated.

![HackManager Leaderboard](/img/step5-new-spec.png)


**2️⃣ Implement the new feature based on the updated specifications:**

```
Implement the new feature based on the updated specifications
```

> 🎯 **What you get:** A new feature implemented following the spec-driven approach — fully documented, traced back to specifications, and consistent with the modernized codebase.

![HackManager Leaderboard Feature](/img/step5-new-spec-implement.png)

---

## 📚 Additional Resources

| Resource | Link |
|----------|------|
| 📖 Spec2Cloud Documentation | [GitHub](https://github.com/EmeaAppGbb/spec2cloud) |
| 📖 Spec2Cloud Brownfield Guide | [Brownfield Docs](https://github.com/EmeaAppGbb/spec2cloud/blob/vNext/docs/brownfield.md) |
| 🟢 Node.js 22 Release Notes | [Node.js Blog](https://nodejs.org/en/blog/announcements/v22-release-announce) |
| 🔄 Node.js Migration Guide | [Node.js Docs](https://nodejs.org/en/learn/getting-started/introduction-to-nodejs) |
| 🤖 GitHub Copilot | [Features](https://github.com/features/copilot) |
| ☁️ Azure App Service for Node.js | [Azure Docs](https://learn.microsoft.com/en-us/azure/app-service/quickstart-nodejs) |
| 📦 nvm (Node Version Manager) | [GitHub](https://github.com/nvm-sh/nvm) |
| 📦 nvm-windows | [GitHub](https://github.com/coreybutler/nvm-windows) |

---

## 📄 License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.
