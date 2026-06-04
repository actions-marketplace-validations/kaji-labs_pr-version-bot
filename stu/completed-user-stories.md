# Completed User Stories

Newest story at top. All AC items ticked. Append-only.

---

### ✅ Story 1.13 — Documentation

> Completed: 2026-06-04 | Epic 1 — MVP

**As a** user, **I want** clear documentation, **so that** I can adopt this action in under 5 minutes.

**Acceptance Criteria:**

- [x] README covers: what it does, quick start, labels, inputs/outputs, example workflow, badges
- [x] docs/quick-start.md, configuration.md, labels.md, architecture.md, roadmap.md, versioning-policy.md, troubleshooting.md present
- [x] 3 ADRs in docs/adrs/
- [x] examples/basic.yml, strict-labels.yml, dry-run.yml present

**Security Criteria:**

- [x] No real tokens in examples

---

### ✅ Story 1.12 — GitHub Templates

> Completed: 2026-06-04 | Epic 1 — MVP

**As a** contributor, **I want** issue and PR templates, **so that** bug reports and PRs are structured.

**Acceptance Criteria:**

- [x] Bug, feature, question issue templates present
- [x] PR template with type checklist and dist check reminder

**Security Criteria:**

- [x] Templates do not request sensitive information

---

### ✅ Story 1.11 — release.yml

> Completed: 2026-06-04 | Epic 1 — MVP

**As the** action, **I want** to use itself to release itself, **so that** the release process is self-validating.

**Acceptance Criteria:**

- [x] Triggers on pull_request closed to main
- [x] Runs only when merged
- [x] Uses actions/checkout@v4 with fetch-depth: 0
- [x] Calls ./ with version-file, changelog-file, default-bump

**Security Criteria:**

- [x] Permissions: contents: write, pull-requests: read only

---

### ✅ Story 1.10 — CodeQL + Dependabot

> Completed: 2026-06-04 | Epic 1 — MVP

**As a** maintainer, **I want** automated security scanning and dependency updates.

**Acceptance Criteria:**

- [x] codeql.yml runs on push, PRs, and weekly schedule
- [x] dependabot.yml checks npm and github-actions weekly

**Security Criteria:**

- [x] CodeQL permissions: security-events: write, actions: read, contents: read

---

### ✅ Story 1.9 — ci.yml

> Completed: 2026-06-04 | Epic 1 — MVP

**As a** contributor, **I want** CI to run on every PR, **so that** broken code is caught before merge.

**Acceptance Criteria:**

- [x] Triggers on pull_request to main and push to main
- [x] Steps: npm ci → lint → format:check → typecheck → test → build
- [x] Runs on ubuntu-latest, Node.js 20

**Security Criteria:**

- [x] Permissions: contents: read only

---

### ✅ Story 1.8 — index.ts

> Completed: 2026-06-04 | Epic 1 — MVP

**As a** GitHub Actions workflow, **I want** the action entry point to wire all modules together.

**Acceptance Criteria:**

- [x] Exits early (success) if PR is not merged
- [x] Reads all inputs via @actions/core
- [x] Calls modules in correct order
- [x] Sets skipped=true and exits 0 when bump === none
- [x] In dry-run mode: logs intended changes, emits outputs, skips all write operations
- [x] Emits version, tag, bump, skipped outputs on success
- [x] Calls core.setFailed on any thrown error
- [x] Tests mock all 6 modules + @actions/core + @actions/github
- [x] Coverage ≥ 80%

**Security Criteria:**

- [x] Token never logged
- [x] core.setFailed used (not process.exit)

---

### ✅ Story 1.7 — github-release.ts

> Completed: 2026-06-04 | Epic 1 — MVP

**As the** action, **I want** to create a GitHub Release, **so that** users can see the release in the GitHub UI.

**Acceptance Criteria:**

- [x] createRelease(token, tag, version, body) creates a non-draft, non-prerelease GitHub Release
- [x] Release name is Release {tag}
- [x] Tests mock @actions/github octokit and verify the API call
- [x] Coverage ≥ 80%

**Security Criteria:**

- [x] Token used only as Octokit constructor argument, never logged
- [x] Uses octokit.rest.repos.createRelease

---

### ✅ Story 1.6 — git.ts

> Completed: 2026-06-04 | Epic 1 — MVP

**As the** action, **I want** to commit files and push a tag, **so that** the release is recorded in git history.

**Acceptance Criteria:**

- [x] configureGit() sets user.name to github-actions[bot] and user.email correctly
- [x] commitRelease(files, message) stages each file and commits
- [x] createTag(tag) creates a tag and pushes it + the commit to origin
- [x] Tests mock @actions/exec and verify correct git commands are called
- [x] Coverage ≥ 80%

**Security Criteria:**

- [x] No tokens passed as CLI arguments
- [x] Exec calls use array form (no shell injection risk)

---

### ✅ Story 1.5 — changelog.ts

> Completed: 2026-06-04 | Epic 1 — MVP

**As the** action, **I want** to prepend a release entry to CHANGELOG.md, **so that** users can see what changed.

**Acceptance Criteria:**

- [x] buildEntry({ version, date, prTitle, prNumber, bump }) returns formatted markdown string
- [x] Entry format: ## [1.2.3] - 2026-06-04\n\n- minor: PR Title (#42)\n
- [x] prependEntry(path, entry) creates file if it does not exist
- [x] prependEntry prepends new entry above existing content
- [x] Tests cover all cases above, coverage ≥ 80%

**Security Criteria:**

- [x] No external API calls in changelog.ts

---

### ✅ Story 1.4 — version.ts

> Completed: 2026-06-04 | Epic 1 — MVP

**As the** action, **I want** to read and bump the VERSION.md file, **so that** I can compute the next release version.

**Acceptance Criteria:**

- [x] readVersion('VERSION.md') returns trimmed string if file contains valid semver
- [x] readVersion throws if file does not exist
- [x] readVersion throws if content is not valid semver
- [x] bumpVersion('1.0.0', 'patch') returns '1.0.1'
- [x] bumpVersion('1.0.0', 'minor') returns '1.1.0'
- [x] bumpVersion('1.0.0', 'major') returns '2.0.0'
- [x] writeVersion(path, version) writes version\n to the file
- [x] Tests cover all cases above, coverage ≥ 80%

**Security Criteria:**

- [x] Version always treated as string, never parsed as float

---

### ✅ Story 1.3 — labels.ts

> Completed: 2026-06-04 | Epic 1 — MVP

**As the** action, **I want** to detect the bump type from PR labels, **so that** I know how to increment the version.

**Acceptance Criteria:**

- [x] release:major → returns major
- [x] release:minor → returns minor
- [x] release:patch → returns patch
- [x] release:none → returns none
- [x] No release label → returns defaultBump input value
- [x] Multiple release labels + failOnMultiple: true → throws error
- [x] Multiple release labels + failOnMultiple: false → returns first match
- [x] Tests cover all cases above, coverage ≥ 80%

**Security Criteria:**

- [x] No external API calls in labels.ts
- [x] Function is pure (no side effects)

---

### ✅ Story 1.2 — action.yml

> Completed: 2026-06-04 | Epic 1 — MVP

**As a** user, **I want** a valid action.yml, **so that** GitHub can parse and run the action.

**Acceptance Criteria:**

- [x] action.yml defines all 10 inputs with descriptions and defaults
- [x] action.yml defines all 4 outputs with descriptions
- [x] Runtime is node20
- [x] Main entry is dist/index.js
- [x] Branding uses tag icon and orange color

**Security Criteria:**

- [x] github-token input marked as required with default ${{ github.token }}
- [x] No hardcoded tokens or secrets in action.yml

---

### ✅ Story 1.1 — Repo Scaffold

> Completed: 2026-06-04 | Epic 1 — MVP

**As a** contributor, **I want** a fully configured project scaffold, **so that** I can start developing immediately.

**Acceptance Criteria:**

- [x] package.json present with all dependencies and scripts
- [x] tsconfig.json configured for CommonJS output targeting ES2022
- [x] vitest.config.ts with ≥80% coverage thresholds on src/
- [x] eslint.config.js with TypeScript rules
- [x] prettier.config.js with consistent formatting rules
- [x] VERSION.md file contains 0.0.0
- [x] CHANGELOG.md contains header only
- [x] LICENSE is MIT
- [x] SECURITY.md, CONTRIBUTING.md, CODE_OF_CONDUCT.md present
- [x] stu/ directory contains all 5 working files

**Security Criteria:**

- [x] No secrets or tokens committed
- [x] .gitignore excludes node_modules/, out/, coverage/
