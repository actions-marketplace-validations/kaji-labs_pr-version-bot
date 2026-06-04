# PR Version Bot MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a reusable GitHub Action that reads merged PR labels, bumps semver, updates CHANGELOG.md, creates a git tag, and publishes a GitHub Release.

**Architecture:** TypeScript source in `src/` compiled to a single `dist/index.js` via `@vercel/ncc`. Six modules (`labels`, `version`, `changelog`, `git`, `github-release`, `index`) each own one responsibility and expose pure or async functions. `index.ts` wires them together and handles all `@actions/core` I/O.

**Tech Stack:** TypeScript 5, Node.js 20, `@actions/core`, `@actions/github`, `@actions/exec`, `semver`, Vitest, ESLint v9, Prettier, `@vercel/ncc`

> **Commit rule:** The user commits after each story completes. Do NOT run `git commit` or `git add` unless the user explicitly asks. After finishing each task, present the changes and wait.

---

## File Map

| File                                       | Created in | Responsibility                                    |
| ------------------------------------------ | ---------- | ------------------------------------------------- |
| `package.json`                             | Task 1     | Dependencies, scripts                             |
| `tsconfig.json`                            | Task 1     | TypeScript compiler config                        |
| `vitest.config.ts`                         | Task 1     | Test runner + coverage thresholds                 |
| `eslint.config.js`                         | Task 1     | Lint rules                                        |
| `prettier.config.js`                       | Task 1     | Format rules                                      |
| `VERSION.md`                               | Task 1     | Current semver (starts at `0.0.0`)                |
| `CHANGELOG.md`                             | Task 1     | Release history (starts empty)                    |
| `LICENSE`                                  | Task 1     | MIT license text                                  |
| `SECURITY.md`                              | Task 1     | Vulnerability reporting policy                    |
| `CONTRIBUTING.md`                          | Task 1     | How to contribute                                 |
| `CODE_OF_CONDUCT.md`                       | Task 1     | Contributor Covenant                              |
| `stu/user-stories.md`                      | Task 1     | Active story queue with AC + SC                   |
| `stu/completed-user-stories.md`            | Task 1     | Archive of finished stories                       |
| `stu/memory.md`                            | Task 1     | ADR log                                           |
| `stu/backlog.md`                           | Task 1     | Tech debt log                                     |
| `stu/backend-feature-requests.md`          | Task 1     | BFR log (N/A for MVP)                             |
| `action.yml`                               | Task 2     | Action metadata, inputs, outputs, branding        |
| `src/labels.ts`                            | Task 3     | Detect bump type from PR label strings            |
| `tests/labels.test.ts`                     | Task 3     | Unit tests for labels                             |
| `src/version.ts`                           | Task 4     | Read/write VERSION file, apply semver bump        |
| `tests/version.test.ts`                    | Task 4     | Unit tests for version                            |
| `src/changelog.ts`                         | Task 5     | Prepend entry to CHANGELOG.md                     |
| `tests/changelog.test.ts`                  | Task 5     | Unit tests for changelog                          |
| `src/git.ts`                               | Task 6     | Git operations: configure, commit, tag, push      |
| `tests/git.test.ts`                        | Task 6     | Unit tests for git (mocked exec)                  |
| `src/github-release.ts`                    | Task 7     | Create GitHub Release via Octokit                 |
| `tests/github-release.test.ts`             | Task 7     | Unit tests (mocked octokit)                       |
| `src/index.ts`                             | Task 8     | Entry point — wires all modules, dry-run, outputs |
| `tests/index.test.ts`                      | Task 8     | Integration-style unit tests (all deps mocked)    |
| `.github/workflows/ci.yml`                 | Task 9     | CI: lint, typecheck, test, build, dist check      |
| `.github/workflows/codeql.yml`             | Task 10    | CodeQL security scan                              |
| `.github/dependabot.yml`                   | Task 10    | Weekly npm updates                                |
| `.github/workflows/release.yml`            | Task 11    | Release: action uses itself                       |
| `.github/ISSUE_TEMPLATE/bug.yml`           | Task 12    | Bug report template                               |
| `.github/ISSUE_TEMPLATE/feature.yml`       | Task 12    | Feature request template                          |
| `.github/ISSUE_TEMPLATE/question.yml`      | Task 12    | Question template                                 |
| `.github/pull_request_template.md`         | Task 12    | PR template                                       |
| `README.md`                                | Task 13    | Main documentation                                |
| `docs/quick-start.md`                      | Task 13    | 5-minute setup guide                              |
| `docs/configuration.md`                    | Task 13    | All inputs/outputs documented                     |
| `docs/labels.md`                           | Task 13    | Label reference                                   |
| `docs/architecture.md`                     | Task 13    | Mermaid data-flow diagram                         |
| `docs/roadmap.md`                          | Task 13    | MVP → v2.x roadmap                                |
| `docs/versioning-policy.md`                | Task 13    | major/minor/patch definitions                     |
| `docs/troubleshooting.md`                  | Task 13    | Common errors and fixes                           |
| `docs/adrs/ADR-001-use-semver.md`          | Task 13    | ADR: semver choice                                |
| `docs/adrs/ADR-002-use-pr-labels.md`       | Task 13    | ADR: label-driven bumps                           |
| `docs/adrs/ADR-003-use-github-releases.md` | Task 13    | ADR: GitHub Releases                              |
| `examples/basic.yml`                       | Task 13    | Basic workflow example                            |
| `examples/strict-labels.yml`               | Task 13    | Strict labels example                             |
| `examples/dry-run.yml`                     | Task 13    | Dry-run example                                   |

---

## Task 1: Repo Scaffold (Story 1.1)

**Agent:** GitHub Actions Engineer  
**Files:** All scaffold files listed above

- [ ] **Step 1.1 — Create `package.json`**

```json
{
  "name": "pr-version-bot",
  "version": "0.0.0",
  "description": "Reusable GitHub Action for automatic semantic versioning from merged pull requests",
  "main": "dist/index.js",
  "scripts": {
    "build": "ncc build src/index.ts -o dist --source-map --license licenses.txt",
    "lint": "eslint src tests",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:coverage": "vitest run --coverage"
  },
  "dependencies": {
    "@actions/core": "^1.10.1",
    "@actions/exec": "^1.1.1",
    "@actions/github": "^6.0.0",
    "semver": "^7.6.3"
  },
  "devDependencies": {
    "@eslint/js": "^9.0.0",
    "@types/node": "^20.0.0",
    "@types/semver": "^7.5.8",
    "@vercel/ncc": "^0.38.1",
    "@vitest/coverage-v8": "^1.6.0",
    "eslint": "^9.0.0",
    "prettier": "^3.3.0",
    "typescript": "^5.4.0",
    "typescript-eslint": "^8.0.0",
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Step 1.2 — Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

- [ ] **Step 1.3 — Create `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
      include: ['src/**'],
    },
  },
});
```

- [ ] **Step 1.4 — Create `eslint.config.js`**

```js
const js = require('@eslint/js');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(js.configs.recommended, ...tseslint.configs.recommended, {
  ignores: ['dist/', 'node_modules/'],
});
```

- [ ] **Step 1.5 — Create `prettier.config.js`**

```js
module.exports = {
  semi: true,
  singleQuote: true,
  printWidth: 100,
  trailingComma: 'es5',
};
```

- [ ] **Step 1.6 — Create `VERSION.md`**

```
0.0.0
```

(Plain text file, no trailing newline issues — write exactly `0.0.0\n`)

- [ ] **Step 1.7 — Create `CHANGELOG.md`**

```markdown
# Changelog

All notable changes to this project will be documented in this file.
```

- [ ] **Step 1.8 — Create `LICENSE`**

Create `LICENSE` with the MIT license text. Replace `[year]` with `2026` and `[fullname]` with `Rashay Daya`:

```
MIT License

Copyright (c) 2026 Rashay Daya

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 1.9 — Create `SECURITY.md`**

```markdown
# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.x     | ✅        |
| 0.x     | ❌        |

## Reporting a Vulnerability

Please do **not** open a public GitHub issue for security vulnerabilities.

Instead, open a [private security advisory](https://github.com/YOUR_ORG/pr-version-bot/security/advisories/new) on this repository.

You can expect a response within 48 hours and a patch within 7 days for confirmed vulnerabilities.
```

- [ ] **Step 1.10 — Create `CONTRIBUTING.md`**

````markdown
# Contributing

## Prerequisites

- Node.js 20+
- npm 10+

## Local setup

```bash
npm ci
```
````

## Running tests

```bash
npm test
npm run test:coverage
```

## Building

```bash
npm run build
# dist/index.js is the compiled output — commit it alongside src/ changes
```

## Linting and formatting

```bash
npm run lint
npm run format
```

## Commit standards

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` new feature
- `fix:` bug fix
- `chore:` maintenance
- `docs:` documentation only
- `test:` test changes

## Release process

Releases are automated. Add a `release:major`, `release:minor`, or `release:patch` label to your PR before merging.

## AI-assisted development

AI tools may be used for ideation, refactoring, test generation, and documentation support.
All contributors are responsible for reviewing, testing, and understanding any AI-assisted changes before opening a pull request.
Do not submit code that you cannot explain, maintain, or verify.

````

- [ ] **Step 1.11 — Create `CODE_OF_CONDUCT.md`**

Use the [Contributor Covenant v2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct/) text verbatim. Replace `[INSERT CONTACT METHOD]` with `Open a GitHub issue`.

- [ ] **Step 1.12 — Create `stu/user-stories.md`**

```markdown
# User Stories

## Epic 1 — MVP

### Story 1.1 — Repo Scaffold
> As a contributor, I want a fully configured project scaffold, so that I can start developing immediately.

**AC:**
- [ ] `package.json` present with all dependencies and scripts
- [ ] `tsconfig.json` configured for CommonJS output targeting ES2022
- [ ] `vitest.config.ts` with ≥80% coverage thresholds on `src/`
- [ ] `eslint.config.js` with TypeScript rules
- [ ] `prettier.config.js` with consistent formatting rules
- [ ] `VERSION` file contains `0.0.0`
- [ ] `CHANGELOG.md` contains header only
- [ ] `LICENSE` is MIT
- [ ] `SECURITY.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` present
- [ ] `stu/` directory contains all 5 working files

**SC:**
- [ ] No secrets or tokens committed
- [ ] `.gitignore` excludes `node_modules/`, `dist/`, `out/`, `*.js.map`, `coverage/`

---

### Story 1.2 — action.yml
> As a user, I want a valid action.yml, so that GitHub can parse and run the action.

**AC:**
- [ ] `action.yml` defines all 9 inputs with descriptions and defaults
- [ ] `action.yml` defines all 4 outputs with descriptions
- [ ] Runtime is `node20`
- [ ] Main entry is `dist/index.js`
- [ ] Branding uses `tag` icon and `orange` color

**SC:**
- [ ] `github-token` input marked as required with default `${{ github.token }}`
- [ ] No hardcoded tokens or secrets in action.yml

---

### Story 1.3 — labels.ts
> As the action, I want to detect the bump type from PR labels, so that I know how to increment the version.

**AC:**
- [ ] `release:major` → returns `major`
- [ ] `release:minor` → returns `minor`
- [ ] `release:patch` → returns `patch`
- [ ] `release:none` → returns `none`
- [ ] No release label → returns `defaultBump` input value
- [ ] Multiple release labels + `failOnMultiple: true` → throws error
- [ ] Multiple release labels + `failOnMultiple: false` → returns first match
- [ ] Tests cover all cases above, coverage ≥ 80%

**SC:**
- [ ] No external API calls in labels.ts
- [ ] Function is pure (no side effects)

---

### Story 1.4 — version.ts
> As the action, I want to read and bump the VERSION file, so that I can compute the next release version.

**AC:**
- [ ] `readVersion('VERSION.md')` returns trimmed string if file contains valid semver
- [ ] `readVersion` throws if file does not exist
- [ ] `readVersion` throws if content is not valid semver
- [ ] `bumpVersion('1.0.0', 'patch')` returns `'1.0.1'`
- [ ] `bumpVersion('1.0.0', 'minor')` returns `'1.1.0'`
- [ ] `bumpVersion('1.0.0', 'major')` returns `'2.0.0'`
- [ ] `writeVersion(path, version)` writes `version\n` to the file
- [ ] Tests cover all cases above, coverage ≥ 80%

**SC:**
- [ ] Version always treated as string, never parsed as float

---

### Story 1.5 — changelog.ts
> As the action, I want to prepend a release entry to CHANGELOG.md, so that users can see what changed.

**AC:**
- [ ] `buildEntry({ version, date, prTitle, prNumber, bump })` returns formatted markdown string
- [ ] Entry format: `## [1.2.3] - 2026-06-04\n\n- minor: PR Title (#42)\n`
- [ ] `prependEntry(path, entry)` creates file if it does not exist
- [ ] `prependEntry` prepends new entry above existing content
- [ ] Tests cover all cases above, coverage ≥ 80%

**SC:**
- [ ] No external API calls in changelog.ts
- [ ] Function is pure for buildEntry; prependEntry is side-effecting but testable via fs mock

---

### Story 1.6 — git.ts
> As the action, I want to commit files and push a tag, so that the release is recorded in git history.

**AC:**
- [ ] `configureGit()` sets `user.name` to `github-actions[bot]` and `user.email` to `github-actions[bot]@users.noreply.github.com`
- [ ] `commitRelease(files, message)` stages each file and commits with the given message
- [ ] `createTag(tag)` creates an annotated tag and pushes it + the commit to origin
- [ ] Tests mock `@actions/exec` and verify correct git commands are called
- [ ] Coverage ≥ 80%

**SC:**
- [ ] No tokens passed as CLI arguments (authentication via persisted credentials from actions/checkout)
- [ ] Exec calls use array form (no shell injection risk)

---

### Story 1.7 — github-release.ts
> As the action, I want to create a GitHub Release, so that users can see the release in the GitHub UI.

**AC:**
- [ ] `createRelease(token, tag, version, body)` creates a non-draft, non-prerelease GitHub Release
- [ ] Release name is `Release {tag}`
- [ ] Tests mock `@actions/github` octokit and verify the API call
- [ ] Coverage ≥ 80%

**SC:**
- [ ] Token used only as Octokit constructor argument, never logged
- [ ] Uses `octokit.rest.repos.createRelease` (not raw fetch)

---

### Story 1.8 — index.ts
> As a GitHub Actions workflow, I want the action entry point to wire all modules together, so that merging a labeled PR triggers a full release.

**AC:**
- [ ] Exits early (success) if PR is not merged
- [ ] Reads all inputs via `@actions/core`
- [ ] Calls `detectBump` → `readVersion` → `bumpVersion` → `writeVersion` → `prependEntry` → `configureGit` → `commitRelease` → `createTag` → `createRelease` in correct order
- [ ] Sets `skipped=true` and exits 0 when `bump === none`
- [ ] In dry-run mode: logs intended changes, emits outputs, skips all write operations
- [ ] Emits `version`, `tag`, `bump`, `skipped` outputs on success
- [ ] Calls `core.setFailed` on any thrown error
- [ ] Tests mock all 6 modules + `@actions/core` + `@actions/github`
- [ ] Coverage ≥ 80%

**SC:**
- [ ] Token never logged
- [ ] `core.setFailed` used (not `process.exit`) so GitHub marks the step as failed

---

### Story 1.9 — ci.yml
> As a contributor, I want CI to run on every PR, so that broken code is caught before merge.

**AC:**
- [ ] Triggers on `pull_request` to `main` and `push` to `main`
- [ ] Steps: `npm ci` → `npm run lint` → `npm run format:check` → `npm run typecheck` → `npm test` → `npm run build` → `git diff --exit-code dist/`
- [ ] Runs on `ubuntu-latest`, Node.js 20

**SC:**
- [ ] Permissions: `contents: read` only
- [ ] No secrets used in CI

---

### Story 1.10 — CodeQL + Dependabot
> As a maintainer, I want automated security scanning and dependency updates.

**AC:**
- [ ] `codeql.yml` runs on push to main, PRs to main, and weekly schedule
- [ ] `dependabot.yml` checks npm weekly, targets `main`

**SC:**
- [ ] CodeQL permissions: `security-events: write`, `actions: read`, `contents: read`

---

### Story 1.11 — release.yml
> As the action, I want to use itself to release itself, so that the release process is self-validating.

**AC:**
- [ ] Triggers on `pull_request` closed to `main`
- [ ] Runs only when `github.event.pull_request.merged == true`
- [ ] Uses `actions/checkout@v4` with `fetch-depth: 0`
- [ ] Calls `./` with `version-file`, `changelog-file`, `default-bump`

**SC:**
- [ ] Permissions: `contents: write`, `pull-requests: read` only
- [ ] No other permissions granted

---

### Story 1.12 — GitHub Templates
> As a contributor, I want issue and PR templates, so that bug reports and PRs are structured.

**AC:**
- [ ] Bug report template with: description, steps to reproduce, expected vs actual, action version, workflow snippet
- [ ] Feature request template with: problem statement, proposed solution, alternatives
- [ ] Question template with: what are you trying to do, what have you tried
- [ ] PR template with: type of change checklist, description, testing notes, dist check reminder

**SC:**
- [ ] Templates do not request sensitive information

---

### Story 1.13 — Documentation
> As a user, I want clear documentation, so that I can adopt this action in under 5 minutes.

**AC:**
- [ ] `README.md` covers: what it does, quick start, label reference, all inputs/outputs, example workflow, badges
- [ ] `docs/quick-start.md` shows end-to-end setup in under 10 steps
- [ ] `docs/configuration.md` documents every input and output with type, default, and example
- [ ] `docs/labels.md` shows all 4 labels with expected behaviour
- [ ] `docs/architecture.md` includes Mermaid flowchart of the data flow
- [ ] `docs/roadmap.md` lists MVP → Epic 8 milestones
- [ ] `docs/versioning-policy.md` defines major/minor/patch
- [ ] `docs/troubleshooting.md` covers: missing label, multiple labels error, VERSION parse failure, dist out of sync
- [ ] 3 ADRs written in `docs/adrs/`
- [ ] `examples/basic.yml`, `examples/strict-labels.yml`, `examples/dry-run.yml` present

**SC:**
- [ ] No real tokens or secrets in examples (use `${{ secrets.GITHUB_TOKEN }}` placeholders)

---

## Epic 2 — Config File Support (.versionbot.yml)
> Stories TBD after MVP ships.

## Epic 3 — package.json Version Sync
> Stories TBD after MVP ships.

## Epic 4 — Conventional Commits Fallback
> Stories TBD after MVP ships.

## Epic 5 — Slack/Discord Notifications
> Stories TBD after MVP ships.

## Epic 6 — Monorepo Support
> Stories TBD after MVP ships.

## Epic 7 — Pre-release / RC Versions
> Stories TBD after MVP ships.

## Epic 8 — GitHub Marketplace Release
> Stories TBD after MVP ships.
````

- [ ] **Step 1.13 — Create `stu/completed-user-stories.md`**

```markdown
# Completed User Stories

Newest story at top. All AC items ticked. Append-only.

<!-- Stories appear here after the user commits each one -->
```

- [ ] **Step 1.14 — Create `stu/memory.md`**

```markdown
# Architecture Decision Records

## ADR Index

| ID      | Title                                                       | Status   | Date       |
| ------- | ----------------------------------------------------------- | -------- | ---------- |
| ADR-001 | Runtime: TypeScript compiled to dist/index.js via ncc       | Accepted | 2026-06-04 |
| ADR-002 | Version trigger: PR labels over conventional commits        | Accepted | 2026-06-04 |
| ADR-003 | Releases: GitHub Releases API via octokit                   | Accepted | 2026-06-04 |
| ADR-004 | Module: CommonJS (not ESM) for GitHub Actions compatibility | Accepted | 2026-06-04 |

---

## ADR-001 — Runtime: TypeScript compiled to dist/index.js via ncc

- **Status:** Accepted
- **Date:** 2026-06-04
- **Context:** GitHub JavaScript actions need a bundled entry point. Options: Docker (slow, heavy), composite/bash (not testable), compiled JS (fast, standard).
- **Decision:** TypeScript source compiled to a single `dist/index.js` via `@vercel/ncc`. `dist/` committed to repo so GitHub can run it without a build step at action invocation time.
- **Consequences:** `dist/` must be rebuilt and committed whenever `src/` changes. CI enforces this with `git diff --exit-code dist/`.

---

## ADR-002 — Version trigger: PR labels over conventional commits

- **Status:** Accepted
- **Date:** 2026-06-04
- **Context:** Two main patterns for inferring version bump: PR labels (`release:major`) or commit message conventions (`feat:`, `fix:`). Labels require explicit intent; commits are implicit.
- **Decision:** PR labels for MVP. Labels are visible in the GitHub UI, require deliberate action, and are easy to audit. Conventional commit support deferred to Epic 4.
- **Consequences:** Users must create and apply the 4 release labels in their repos. Documented in `docs/labels.md`.

---

## ADR-003 — Releases: GitHub Releases API via octokit

- **Status:** Accepted
- **Date:** 2026-06-04
- **Context:** Could push a git tag only, or also create a GitHub Release. GitHub Releases are visible in the UI, support release notes, and are required for Marketplace adoption.
- **Decision:** Create GitHub Release via `octokit.rest.repos.createRelease`. Controllable via `create-github-release` input.
- **Consequences:** Requires `contents: write` permission on the workflow token.

---

## ADR-004 — Module: CommonJS (not ESM)

- **Status:** Accepted
- **Date:** 2026-06-04
- **Context:** Node.js 20 supports ESM natively, but `@vercel/ncc` and `@actions/*` packages work most reliably with CommonJS. ESM adds complexity (`.js` extensions in imports, `__dirname` unavailable) with no benefit for this use case.
- **Decision:** `"module": "commonjs"` in tsconfig. No `"type": "module"` in package.json.
- **Consequences:** All imports use standard `require`-style resolution after compilation. No `.js` extensions needed in TypeScript imports.
```

- [ ] **Step 1.15 — Create `stu/backlog.md`**

```markdown
# Backlog

## Open Items

<!-- Items logged by agents during stories appear here -->

---

## Closed Items

<!-- Resolved items moved here (never deleted) -->
```

- [ ] **Step 1.16 — Create `stu/backend-feature-requests.md`**

```markdown
# Backend Feature Requests

Not applicable for MVP — this action has no backend dependency.
Retained for post-MVP workflow parity.

## Open Requests

<!-- N/A -->

---

## Closed Requests

<!-- N/A -->
```

- [ ] **Step 1.17 — Create `.gitignore`**

```
node_modules/
dist/
out/
coverage/
*.js.map
licenses.txt
.env
```

- [ ] **Step 1.18 — Install dependencies**

Run: `npm ci` (or `npm install` if this is first setup)

Expected: `node_modules/` created, no errors.

- [ ] **Step 1.19 — Hand off to user**

Present all created files. Wait for user to review and commit before proceeding to Task 2.

---

## Task 2: action.yml (Story 1.2)

**Agent:** GitHub Actions Engineer  
**Files:** Create `action.yml`

- [ ] **Step 2.1 — Create `action.yml`**

```yaml
name: PR Version Bot
description: Automatic semantic versioning from merged pull request labels
author: Rashay Daya

branding:
  icon: tag
  color: orange

inputs:
  github-token:
    description: GitHub token for API access and git push
    required: true
    default: ${{ github.token }}

  version-file:
    description: Path to the file containing the current semver
    required: false
    default: VERSION.md

  changelog-file:
    description: Path to the changelog file
    required: false
    default: CHANGELOG.md

  default-bump:
    description: Bump type when no release label is present (major, minor, patch)
    required: false
    default: patch

  tag-prefix:
    description: Prefix for git tags
    required: false
    default: v

  create-github-release:
    description: Whether to create a GitHub Release
    required: false
    default: 'true'

  fail-on-multiple-labels:
    description: Fail if PR has more than one release label
    required: false
    default: 'true'

  dry-run:
    description: Run without writing any changes
    required: false
    default: 'false'

  target-branch:
    description: Branch to push release commit to
    required: false
    default: main

  commit-message-template:
    description: Commit message template — use {tag} as placeholder
    required: false
    default: 'chore(release): {tag}'

outputs:
  version:
    description: New semantic version (e.g. 1.2.3)

  tag:
    description: Created git tag (e.g. v1.2.3)

  bump:
    description: Bump type applied — major, minor, patch, or none

  skipped:
    description: true if the release was skipped (release:none label)

runs:
  using: node20
  main: dist/index.js
```

- [ ] **Step 2.2 — Verify action.yml is valid YAML**

Run: `npx js-yaml action.yml` (or any YAML validator)  
Expected: No errors.

- [ ] **Step 2.3 — Hand off to user**

Present `action.yml`. Wait for user to review and commit before proceeding to Task 3.

---

## Task 3: labels.ts + tests (Story 1.3)

**Agent:** TypeScript Backend  
**Files:** Create `src/labels.ts`, `tests/labels.test.ts`

- [ ] **Step 3.1 — Create `src/` directory and write the failing test first**

Create `tests/labels.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { detectBump } from '../src/labels';

describe('detectBump', () => {
  it('returns major for release:major label', () => {
    expect(detectBump(['release:major'], 'patch', true)).toBe('major');
  });

  it('returns minor for release:minor label', () => {
    expect(detectBump(['release:minor'], 'patch', true)).toBe('minor');
  });

  it('returns patch for release:patch label', () => {
    expect(detectBump(['release:patch'], 'patch', true)).toBe('patch');
  });

  it('returns none for release:none label', () => {
    expect(detectBump(['release:none'], 'patch', true)).toBe('none');
  });

  it('returns defaultBump when no release label present', () => {
    expect(detectBump(['bug', 'enhancement'], 'minor', true)).toBe('minor');
  });

  it('returns defaultBump when labels array is empty', () => {
    expect(detectBump([], 'patch', true)).toBe('patch');
  });

  it('throws when multiple release labels found and failOnMultiple is true', () => {
    expect(() => detectBump(['release:major', 'release:minor'], 'patch', true)).toThrow(
      'Multiple release labels found: release:major, release:minor'
    );
  });

  it('returns first match when multiple release labels and failOnMultiple is false', () => {
    expect(detectBump(['release:major', 'release:minor'], 'patch', false)).toBe('major');
  });

  it('ignores non-release labels alongside a release label', () => {
    expect(detectBump(['bug', 'release:patch', 'docs'], 'minor', true)).toBe('patch');
  });
});
```

- [ ] **Step 3.2 — Run tests to confirm they fail**

Run: `npx vitest run tests/labels.test.ts`  
Expected: FAIL — `Cannot find module '../src/labels'`

- [ ] **Step 3.3 — Create `src/labels.ts`**

```typescript
export type BumpType = 'major' | 'minor' | 'patch' | 'none';

const LABEL_MAP: Record<string, BumpType> = {
  'release:major': 'major',
  'release:minor': 'minor',
  'release:patch': 'patch',
  'release:none': 'none',
};

export function detectBump(
  labels: string[],
  defaultBump: BumpType,
  failOnMultiple: boolean
): BumpType {
  const releaseLabels = labels.filter((l) => l in LABEL_MAP);

  if (releaseLabels.length === 0) return defaultBump;

  if (releaseLabels.length > 1 && failOnMultiple) {
    throw new Error(`Multiple release labels found: ${releaseLabels.join(', ')}`);
  }

  return LABEL_MAP[releaseLabels[0]];
}
```

- [ ] **Step 3.4 — Run tests to confirm they pass**

Run: `npx vitest run tests/labels.test.ts`  
Expected: PASS — 9 tests

- [ ] **Step 3.5 — Run coverage**

Run: `npx vitest run --coverage tests/labels.test.ts`  
Expected: `src/labels.ts` at ≥ 80% across all metrics.

- [ ] **Step 3.6 — Hand off to user**

Present `src/labels.ts` and `tests/labels.test.ts`. Wait for user to commit before proceeding.

---

## Task 4: version.ts + tests (Story 1.4)

**Agent:** TypeScript Backend  
**Files:** Create `src/version.ts`, `tests/version.test.ts`

- [ ] **Step 4.1 — Write the failing test**

Create `tests/version.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';

vi.mock('fs');

import { readVersion, bumpVersion, writeVersion } from '../src/version';

describe('readVersion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reads and trims a valid semver', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue('1.2.3\n' as unknown as Buffer);
    expect(readVersion('VERSION.md')).toBe('1.2.3');
  });

  it('throws if the file does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    expect(() => readVersion('VERSION.md')).toThrow('VERSION file not found: VERSION');
  });

  it('throws if the content is not valid semver', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue('not-a-version' as unknown as Buffer);
    expect(() => readVersion('VERSION.md')).toThrow('Invalid semver in VERSION');
  });
});

describe('bumpVersion', () => {
  it('bumps patch', () => {
    expect(bumpVersion('1.0.0', 'patch')).toBe('1.0.1');
  });

  it('bumps minor', () => {
    expect(bumpVersion('1.0.0', 'minor')).toBe('1.1.0');
  });

  it('bumps major', () => {
    expect(bumpVersion('1.0.0', 'major')).toBe('2.0.0');
  });

  it('resets minor and patch on major bump', () => {
    expect(bumpVersion('1.2.3', 'major')).toBe('2.0.0');
  });

  it('resets patch on minor bump', () => {
    expect(bumpVersion('1.2.3', 'minor')).toBe('1.3.0');
  });
});

describe('writeVersion', () => {
  it('writes version with newline', () => {
    vi.mocked(fs.writeFileSync).mockImplementation(() => undefined);
    writeVersion('VERSION.md', '1.2.3');
    expect(fs.writeFileSync).toHaveBeenCalledWith('VERSION.md', '1.2.3\n', 'utf8');
  });
});
```

- [ ] **Step 4.2 — Run tests to confirm they fail**

Run: `npx vitest run tests/version.test.ts`  
Expected: FAIL — `Cannot find module '../src/version'`

- [ ] **Step 4.3 — Create `src/version.ts`**

```typescript
import * as fs from 'fs';
import * as semver from 'semver';
import type { BumpType } from './labels';

export function readVersion(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    throw new Error(`VERSION file not found: ${filePath}`);
  }
  const raw = (fs.readFileSync(filePath, 'utf8') as string).trim();
  if (!semver.valid(raw)) {
    throw new Error(`Invalid semver in ${filePath}: "${raw}"`);
  }
  return raw;
}

export function bumpVersion(current: string, bump: Exclude<BumpType, 'none'>): string {
  const next = semver.inc(current, bump);
  if (!next) throw new Error(`Failed to bump ${current} by ${bump}`);
  return next;
}

export function writeVersion(filePath: string, version: string): void {
  fs.writeFileSync(filePath, version + '\n', 'utf8');
}
```

- [ ] **Step 4.4 — Run tests to confirm they pass**

Run: `npx vitest run tests/version.test.ts`  
Expected: PASS — all tests green.

- [ ] **Step 4.5 — Run coverage**

Run: `npx vitest run --coverage tests/version.test.ts`  
Expected: `src/version.ts` ≥ 80%.

- [ ] **Step 4.6 — Hand off to user**

Present both files. Wait for user to commit before proceeding.

---

## Task 5: changelog.ts + tests (Story 1.5)

**Agent:** TypeScript Backend  
**Files:** Create `src/changelog.ts`, `tests/changelog.test.ts`

- [ ] **Step 5.1 — Write the failing test**

Create `tests/changelog.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';

vi.mock('fs');

import { buildEntry, prependEntry } from '../src/changelog';
import type { ChangelogEntry } from '../src/changelog';

const sampleEntry: ChangelogEntry = {
  version: '1.2.3',
  date: '2026-06-04',
  prTitle: 'Add new feature',
  prNumber: 42,
  bump: 'minor',
};

describe('buildEntry', () => {
  it('formats entry correctly', () => {
    const result = buildEntry(sampleEntry);
    expect(result).toBe('## [1.2.3] - 2026-06-04\n\n- minor: Add new feature (#42)\n');
  });
});

describe('prependEntry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('prepends entry above existing content', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue('# Changelog\n' as unknown as Buffer);
    vi.mocked(fs.writeFileSync).mockImplementation(() => undefined);

    prependEntry('CHANGELOG.md', sampleEntry);

    const written = vi.mocked(fs.writeFileSync).mock.calls[0][1] as string;
    expect(written).toMatch(/^\## \[1\.2\.3\]/);
    expect(written).toContain('# Changelog');
  });

  it('creates file if it does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fs.writeFileSync).mockImplementation(() => undefined);

    prependEntry('CHANGELOG.md', sampleEntry);

    const written = vi.mocked(fs.writeFileSync).mock.calls[0][1] as string;
    expect(written).toMatch(/^\## \[1\.2\.3\]/);
  });
});
```

- [ ] **Step 5.2 — Run tests to confirm they fail**

Run: `npx vitest run tests/changelog.test.ts`  
Expected: FAIL — `Cannot find module '../src/changelog'`

- [ ] **Step 5.3 — Create `src/changelog.ts`**

```typescript
import * as fs from 'fs';

export interface ChangelogEntry {
  version: string;
  date: string;
  prTitle: string;
  prNumber: number;
  bump: string;
}

export function buildEntry(entry: ChangelogEntry): string {
  return `## [${entry.version}] - ${entry.date}\n\n- ${entry.bump}: ${entry.prTitle} (#${entry.prNumber})\n`;
}

export function prependEntry(filePath: string, entry: ChangelogEntry): void {
  const newEntry = buildEntry(entry);
  const existing = fs.existsSync(filePath) ? (fs.readFileSync(filePath, 'utf8') as string) : '';
  fs.writeFileSync(filePath, newEntry + '\n' + existing, 'utf8');
}
```

- [ ] **Step 5.4 — Run tests to confirm they pass**

Run: `npx vitest run tests/changelog.test.ts`  
Expected: PASS.

- [ ] **Step 5.5 — Hand off to user**

Present both files. Wait for user to commit before proceeding.

---

## Task 6: git.ts + tests (Story 1.6)

**Agent:** TypeScript Backend  
**Files:** Create `src/git.ts`, `tests/git.test.ts`

- [ ] **Step 6.1 — Write the failing test**

Create `tests/git.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as exec from '@actions/exec';

vi.mock('@actions/exec');

import { configureGit, commitRelease, createTag } from '../src/git';

describe('configureGit', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sets git user name', async () => {
    vi.mocked(exec.exec).mockResolvedValue(0);
    await configureGit();
    expect(exec.exec).toHaveBeenCalledWith('git', ['config', 'user.name', 'github-actions[bot]']);
  });

  it('sets git user email', async () => {
    vi.mocked(exec.exec).mockResolvedValue(0);
    await configureGit();
    expect(exec.exec).toHaveBeenCalledWith('git', [
      'config',
      'user.email',
      'github-actions[bot]@users.noreply.github.com',
    ]);
  });
});

describe('commitRelease', () => {
  beforeEach(() => vi.clearAllMocks());

  it('stages each file and commits', async () => {
    vi.mocked(exec.exec).mockResolvedValue(0);
    await commitRelease(['VERSION.md', 'CHANGELOG.md'], 'chore(release): v1.2.3');
    expect(exec.exec).toHaveBeenCalledWith('git', ['add', 'VERSION.md']);
    expect(exec.exec).toHaveBeenCalledWith('git', ['add', 'CHANGELOG.md']);
    expect(exec.exec).toHaveBeenCalledWith('git', ['commit', '-m', 'chore(release): v1.2.3']);
  });
});

describe('createTag', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates tag and pushes', async () => {
    vi.mocked(exec.exec).mockResolvedValue(0);
    await createTag('v1.2.3');
    expect(exec.exec).toHaveBeenCalledWith('git', ['tag', 'v1.2.3']);
    expect(exec.exec).toHaveBeenCalledWith('git', ['push', 'origin', 'v1.2.3']);
    expect(exec.exec).toHaveBeenCalledWith('git', ['push']);
  });
});
```

- [ ] **Step 6.2 — Run tests to confirm they fail**

Run: `npx vitest run tests/git.test.ts`  
Expected: FAIL — `Cannot find module '../src/git'`

- [ ] **Step 6.3 — Create `src/git.ts`**

```typescript
import * as exec from '@actions/exec';

export async function configureGit(): Promise<void> {
  await exec.exec('git', ['config', 'user.name', 'github-actions[bot]']);
  await exec.exec('git', ['config', 'user.email', 'github-actions[bot]@users.noreply.github.com']);
}

export async function commitRelease(files: string[], message: string): Promise<void> {
  for (const file of files) {
    await exec.exec('git', ['add', file]);
  }
  await exec.exec('git', ['commit', '-m', message]);
}

export async function createTag(tag: string): Promise<void> {
  await exec.exec('git', ['tag', tag]);
  await exec.exec('git', ['push', 'origin', tag]);
  await exec.exec('git', ['push']);
}
```

- [ ] **Step 6.4 — Run tests to confirm they pass**

Run: `npx vitest run tests/git.test.ts`  
Expected: PASS.

- [ ] **Step 6.5 — Hand off to user**

Present both files. Wait for user to commit before proceeding.

---

## Task 7: github-release.ts + tests (Story 1.7)

**Agent:** TypeScript Backend  
**Files:** Create `src/github-release.ts`, `tests/github-release.test.ts`

- [ ] **Step 7.1 — Write the failing test**

Create `tests/github-release.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as github from '@actions/github';

vi.mock('@actions/github', () => ({
  getOctokit: vi.fn(),
  context: {
    repo: { owner: 'test-owner', repo: 'test-repo' },
  },
}));

import { createRelease } from '../src/github-release';

describe('createRelease', () => {
  const mockCreateRelease = vi.fn().mockResolvedValue({ data: { id: 1 } });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(github.getOctokit).mockReturnValue({
      rest: {
        repos: {
          createRelease: mockCreateRelease,
        },
      },
    } as unknown as ReturnType<typeof github.getOctokit>);
  });

  it('creates a non-draft, non-prerelease release', async () => {
    await createRelease('fake-token', 'v1.2.3', '1.2.3', 'minor: Add feature (#42)');

    expect(mockCreateRelease).toHaveBeenCalledWith({
      owner: 'test-owner',
      repo: 'test-repo',
      tag_name: 'v1.2.3',
      name: 'Release v1.2.3',
      body: 'minor: Add feature (#42)',
      draft: false,
      prerelease: false,
    });
  });

  it('uses the provided token to construct octokit', async () => {
    await createRelease('my-token', 'v1.0.0', '1.0.0', 'patch: Fix bug (#1)');
    expect(github.getOctokit).toHaveBeenCalledWith('my-token');
  });
});
```

- [ ] **Step 7.2 — Run tests to confirm they fail**

Run: `npx vitest run tests/github-release.test.ts`  
Expected: FAIL — `Cannot find module '../src/github-release'`

- [ ] **Step 7.3 — Create `src/github-release.ts`**

```typescript
import * as github from '@actions/github';

export async function createRelease(
  token: string,
  tag: string,
  version: string,
  body: string
): Promise<void> {
  const octokit = github.getOctokit(token);
  const { owner, repo } = github.context.repo;

  await octokit.rest.repos.createRelease({
    owner,
    repo,
    tag_name: tag,
    name: `Release ${tag}`,
    body,
    draft: false,
    prerelease: false,
  });
}
```

- [ ] **Step 7.4 — Run tests to confirm they pass**

Run: `npx vitest run tests/github-release.test.ts`  
Expected: PASS.

- [ ] **Step 7.5 — Hand off to user**

Present both files. Wait for user to commit before proceeding.

---

## Task 8: index.ts + integration tests (Story 1.8)

**Agent:** TypeScript Backend  
**Files:** Create `src/index.ts`, `tests/index.test.ts`

- [ ] **Step 8.1 — Write the failing test**

Create `tests/index.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@actions/core');
vi.mock('@actions/github');
vi.mock('../src/labels');
vi.mock('../src/version');
vi.mock('../src/changelog');
vi.mock('../src/git');
vi.mock('../src/github-release');

import * as core from '@actions/core';
import * as github from '@actions/github';
import * as labelsModule from '../src/labels';
import * as versionModule from '../src/version';
import * as changelogModule from '../src/changelog';
import * as gitModule from '../src/git';
import * as releaseModule from '../src/github-release';

function mockInputs(overrides: Record<string, string> = {}): void {
  const defaults: Record<string, string> = {
    'github-token': 'fake-token',
    'version-file': 'VERSION.md',
    'changelog-file': 'CHANGELOG.md',
    'default-bump': 'patch',
    'tag-prefix': 'v',
    'create-github-release': 'true',
    'fail-on-multiple-labels': 'true',
    'dry-run': 'false',
    'target-branch': 'main',
    'commit-message-template': 'chore(release): {tag}',
    ...overrides,
  };
  vi.mocked(core.getInput).mockImplementation((name: string) => defaults[name] ?? '');
}

function mockMergedPR(labels: string[] = ['release:minor']): void {
  Object.defineProperty(github, 'context', {
    value: {
      payload: {
        pull_request: {
          merged: true,
          number: 42,
          title: 'Add new feature',
          labels: labels.map((name) => ({ name })),
        },
      },
      repo: { owner: 'test-owner', repo: 'test-repo' },
    },
    writable: true,
  });
}

describe('run', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(labelsModule.detectBump).mockReturnValue('minor');
    vi.mocked(versionModule.readVersion).mockReturnValue('1.0.0');
    vi.mocked(versionModule.bumpVersion).mockReturnValue('1.1.0');
    vi.mocked(versionModule.writeVersion).mockImplementation(() => undefined);
    vi.mocked(changelogModule.prependEntry).mockImplementation(() => undefined);
    vi.mocked(gitModule.configureGit).mockResolvedValue(undefined);
    vi.mocked(gitModule.commitRelease).mockResolvedValue(undefined);
    vi.mocked(gitModule.createTag).mockResolvedValue(undefined);
    vi.mocked(releaseModule.createRelease).mockResolvedValue(undefined);
  });

  it('exits early when PR is not merged', async () => {
    Object.defineProperty(github, 'context', {
      value: { payload: { pull_request: { merged: false } } },
      writable: true,
    });
    mockInputs();
    const { run } = await import('../src/index');
    await run();
    expect(versionModule.readVersion).not.toHaveBeenCalled();
  });

  it('sets skipped output when bump is none', async () => {
    mockMergedPR(['release:none']);
    mockInputs();
    vi.mocked(labelsModule.detectBump).mockReturnValue('none');
    const { run } = await import('../src/index');
    await run();
    expect(core.setOutput).toHaveBeenCalledWith('skipped', 'true');
    expect(versionModule.readVersion).not.toHaveBeenCalled();
  });

  it('logs intended changes in dry-run mode and skips writes', async () => {
    mockMergedPR();
    mockInputs({ 'dry-run': 'true' });
    const { run } = await import('../src/index');
    await run();
    expect(versionModule.writeVersion).not.toHaveBeenCalled();
    expect(gitModule.commitRelease).not.toHaveBeenCalled();
    expect(core.setOutput).toHaveBeenCalledWith('version', '1.1.0');
    expect(core.setOutput).toHaveBeenCalledWith('skipped', 'false');
  });

  it('runs full release flow on merged PR with release label', async () => {
    mockMergedPR();
    mockInputs();
    const { run } = await import('../src/index');
    await run();
    expect(versionModule.writeVersion).toHaveBeenCalledWith('VERSION.md', '1.1.0');
    expect(changelogModule.prependEntry).toHaveBeenCalled();
    expect(gitModule.configureGit).toHaveBeenCalled();
    expect(gitModule.commitRelease).toHaveBeenCalledWith(
      ['VERSION.md', 'CHANGELOG.md'],
      'chore(release): v1.1.0'
    );
    expect(gitModule.createTag).toHaveBeenCalledWith('v1.1.0');
    expect(releaseModule.createRelease).toHaveBeenCalled();
    expect(core.setOutput).toHaveBeenCalledWith('version', '1.1.0');
    expect(core.setOutput).toHaveBeenCalledWith('tag', 'v1.1.0');
    expect(core.setOutput).toHaveBeenCalledWith('bump', 'minor');
    expect(core.setOutput).toHaveBeenCalledWith('skipped', 'false');
  });

  it('calls setFailed on error', async () => {
    mockMergedPR();
    mockInputs();
    vi.mocked(versionModule.readVersion).mockImplementation(() => {
      throw new Error('VERSION file not found');
    });
    const { run } = await import('../src/index');
    await run();
    expect(core.setFailed).toHaveBeenCalledWith('VERSION file not found');
  });

  it('skips GitHub Release creation when create-github-release is false', async () => {
    mockMergedPR();
    mockInputs({ 'create-github-release': 'false' });
    const { run } = await import('../src/index');
    await run();
    expect(releaseModule.createRelease).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 8.2 — Run tests to confirm they fail**

Run: `npx vitest run tests/index.test.ts`  
Expected: FAIL — `Cannot find module '../src/index'`

- [ ] **Step 8.3 — Create `src/index.ts`**

```typescript
import * as core from '@actions/core';
import * as github from '@actions/github';
import { detectBump, type BumpType } from './labels';
import { readVersion, bumpVersion, writeVersion } from './version';
import { prependEntry } from './changelog';
import { configureGit, commitRelease, createTag } from './git';
import { createRelease } from './github-release';

export async function run(): Promise<void> {
  try {
    const pr = github.context.payload.pull_request;
    if (!pr?.merged) {
      core.info('PR not merged — skipping');
      return;
    }

    const token = core.getInput('github-token', { required: true });
    const versionFile = core.getInput('version-file') || 'VERSION.md';
    const changelogFile = core.getInput('changelog-file') || 'CHANGELOG.md';
    const defaultBump = (core.getInput('default-bump') || 'patch') as BumpType;
    const tagPrefix = core.getInput('tag-prefix') || 'v';
    const createGhRelease = core.getInput('create-github-release') !== 'false';
    const failOnMultiple = core.getInput('fail-on-multiple-labels') !== 'false';
    const dryRun = core.getInput('dry-run') === 'true';
    const commitTemplate = core.getInput('commit-message-template') || 'chore(release): {tag}';

    const labels: string[] = (pr.labels as Array<{ name: string }>).map((l) => l.name);
    const bump = detectBump(labels, defaultBump, failOnMultiple);

    if (bump === 'none') {
      core.info('release:none label — skipping release');
      core.setOutput('bump', 'none');
      core.setOutput('skipped', 'true');
      return;
    }

    const current = readVersion(versionFile);
    const next = bumpVersion(current, bump as Exclude<BumpType, 'none'>);
    const tag = `${tagPrefix}${next}`;
    const message = commitTemplate.replace('{tag}', tag);

    core.info(`Current version: ${current}`);
    core.info(`Detected bump: ${bump}`);
    core.info(`Next version: ${next}`);
    core.info(`Creating tag: ${tag}`);

    if (dryRun) {
      core.info('Dry run — no changes written');
      core.setOutput('version', next);
      core.setOutput('tag', tag);
      core.setOutput('bump', bump);
      core.setOutput('skipped', 'false');
      return;
    }

    const date = new Date().toISOString().split('T')[0];

    writeVersion(versionFile, next);
    prependEntry(changelogFile, {
      version: next,
      date,
      prTitle: pr.title as string,
      prNumber: pr.number as number,
      bump,
    });

    await configureGit();
    await commitRelease([versionFile, changelogFile], message);
    await createTag(tag);

    if (createGhRelease) {
      await createRelease(
        token,
        tag,
        next,
        `${bump}: ${pr.title as string} (#${pr.number as number})`
      );
    }

    core.setOutput('version', next);
    core.setOutput('tag', tag);
    core.setOutput('bump', bump);
    core.setOutput('skipped', 'false');
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error));
  }
}

run();
```

- [ ] **Step 8.4 — Run tests to confirm they pass**

Run: `npx vitest run tests/index.test.ts`  
Expected: PASS — all 6 tests.

- [ ] **Step 8.5 — Run full test suite with coverage**

Run: `npx vitest run --coverage`  
Expected: All tests pass. Overall coverage ≥ 80%.

- [ ] **Step 8.6 — Build `dist/index.js`**

Run: `npm run build`  
Expected: `dist/index.js` created with no errors.

- [ ] **Step 8.7 — Typecheck**

Run: `npm run typecheck`  
Expected: No TypeScript errors.

- [ ] **Step 8.8 — Hand off to user**

Present `src/index.ts` and `tests/index.test.ts`. Wait for user to commit before proceeding.

---

## Task 9: CI Workflow (Story 1.9)

**Agent:** GitHub Actions Engineer  
**Files:** Create `.github/workflows/ci.yml`

- [ ] **Step 9.1 — Create `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  ci:
    name: CI
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Check formatting
        run: npm run format:check

      - name: Type check
        run: npm run typecheck

      - name: Run tests
        run: npm run test:coverage

      - name: Build
        run: npm run build

      - name: Verify dist is committed
        run: git diff --exit-code dist/
```

- [ ] **Step 9.2 — Hand off to user**

Present `ci.yml`. Wait for user to commit before proceeding.

---

## Task 10: CodeQL + Dependabot (Story 1.10)

**Agent:** DevOps/Security  
**Files:** Create `.github/workflows/codeql.yml`, `.github/dependabot.yml`

- [ ] **Step 10.1 — Create `.github/workflows/codeql.yml`**

```yaml
name: CodeQL

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '30 4 * * 1'

permissions:
  actions: read
  contents: read
  security-events: write

jobs:
  analyze:
    name: Analyze
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: javascript-typescript

      - name: Autobuild
        uses: github/codeql-action/autobuild@v3

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
```

- [ ] **Step 10.2 — Create `.github/dependabot.yml`**

```yaml
version: 2

updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
    open-pull-requests-limit: 5
    labels:
      - dependencies

  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly
    open-pull-requests-limit: 5
    labels:
      - dependencies
```

- [ ] **Step 10.3 — Hand off to user**

Present both files. Wait for user to commit before proceeding.

---

## Task 11: Release Workflow (Story 1.11)

**Agent:** GitHub Actions Engineer  
**Files:** Create `.github/workflows/release.yml`

- [ ] **Step 11.1 — Create `.github/workflows/release.yml`**

```yaml
name: Release

on:
  pull_request:
    types: [closed]
    branches: [main]

permissions:
  contents: write
  pull-requests: read

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    if: github.event.pull_request.merged == true

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Run PR Version Bot
        uses: ./
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          version-file: VERSION.md
          changelog-file: CHANGELOG.md
          default-bump: patch
```

- [ ] **Step 11.2 — Hand off to user**

Present `release.yml`. Wait for user to commit before proceeding.

---

## Task 12: GitHub Templates (Story 1.12)

**Agent:** GitHub Actions Engineer  
**Files:** Create all `.github/ISSUE_TEMPLATE/` files and PR template

- [ ] **Step 12.1 — Create `.github/ISSUE_TEMPLATE/bug.yml`**

```yaml
name: Bug Report
description: Report a bug in PR Version Bot
labels: [bug]
body:
  - type: markdown
    attributes:
      value: Thanks for taking the time to report a bug.

  - type: textarea
    id: description
    attributes:
      label: Describe the bug
      description: A clear description of what went wrong.
    validations:
      required: true

  - type: textarea
    id: steps
    attributes:
      label: Steps to reproduce
      placeholder: |
        1. Configure action with...
        2. Merge PR with label...
        3. See error...
    validations:
      required: true

  - type: textarea
    id: expected
    attributes:
      label: Expected behaviour
    validations:
      required: true

  - type: textarea
    id: actual
    attributes:
      label: Actual behaviour
    validations:
      required: true

  - type: input
    id: version
    attributes:
      label: Action version
      placeholder: e.g. v1.0.0
    validations:
      required: true

  - type: textarea
    id: workflow
    attributes:
      label: Workflow snippet
      description: Paste the relevant part of your workflow file.
      render: yaml
```

- [ ] **Step 12.2 — Create `.github/ISSUE_TEMPLATE/feature.yml`**

```yaml
name: Feature Request
description: Suggest a new feature or improvement
labels: [enhancement]
body:
  - type: textarea
    id: problem
    attributes:
      label: Problem statement
      description: What problem are you trying to solve?
    validations:
      required: true

  - type: textarea
    id: solution
    attributes:
      label: Proposed solution
    validations:
      required: true

  - type: textarea
    id: alternatives
    attributes:
      label: Alternatives considered
```

- [ ] **Step 12.3 — Create `.github/ISSUE_TEMPLATE/question.yml`**

```yaml
name: Question
description: Ask a question about using PR Version Bot
labels: [question]
body:
  - type: textarea
    id: goal
    attributes:
      label: What are you trying to do?
    validations:
      required: true

  - type: textarea
    id: tried
    attributes:
      label: What have you tried?
    validations:
      required: true
```

- [ ] **Step 12.4 — Create `.github/pull_request_template.md`**

```markdown
## Type of change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] Dependency update
- [ ] CI/tooling change

## Description

<!-- What does this PR do? -->

## Testing

<!-- How did you test this? -->

## Checklist

- [ ] Tests pass (`npm test`)
- [ ] Types check (`npm run typecheck`)
- [ ] Lint passes (`npm run lint`)
- [ ] `dist/index.js` rebuilt and committed (`npm run build`)
- [ ] Release label applied (`release:major`, `release:minor`, `release:patch`, or `release:none`)

## Notes

<!-- Anything reviewers should know -->
```

- [ ] **Step 12.5 — Hand off to user**

Present all 4 template files. Wait for user to commit before proceeding.

---

## Task 13: Documentation (Story 1.13)

**Agent:** Documentation  
**Files:** `README.md`, all `docs/` files, all `examples/` files

- [ ] **Step 13.1 — Create `README.md`**

````markdown
# PR Version Bot

[![CI](https://github.com/YOUR_ORG/pr-version-bot/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_ORG/pr-version-bot/actions/workflows/ci.yml)
[![CodeQL](https://github.com/YOUR_ORG/pr-version-bot/actions/workflows/codeql.yml/badge.svg)](https://github.com/YOUR_ORG/pr-version-bot/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> Reusable GitHub Action for automatic semantic versioning from merged pull requests.

Automatically bumps your semver, updates `CHANGELOG.md`, creates a git tag, and publishes a GitHub Release — triggered by a label on your PR.

## How it works

1. Merge a PR with a `release:minor` label
2. The action reads the label, bumps `VERSION`, prepends a `CHANGELOG.md` entry, commits both, creates a `v1.1.0` tag, and publishes a GitHub Release

## Quick start

See [docs/quick-start.md](docs/quick-start.md).

## Required labels

Create these labels in your repository:

| Label           | Effect                  |
| --------------- | ----------------------- |
| `release:major` | Bumps `1.0.0` → `2.0.0` |
| `release:minor` | Bumps `1.0.0` → `1.1.0` |
| `release:patch` | Bumps `1.0.0` → `1.0.1` |
| `release:none`  | Skips release entirely  |

## Example workflow

```yaml
name: Release

on:
  pull_request:
    types: [closed]
    branches: [main]

permissions:
  contents: write
  pull-requests: read

jobs:
  release:
    runs-on: ubuntu-latest
    if: github.event.pull_request.merged == true
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: YOUR_ORG/pr-version-bot@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

## Inputs

See [docs/configuration.md](docs/configuration.md) for full reference.

## Outputs

| Output    | Description                          |
| --------- | ------------------------------------ |
| `version` | New version e.g. `1.2.3`             |
| `tag`     | Created tag e.g. `v1.2.3`            |
| `bump`    | `major`, `minor`, `patch`, or `none` |
| `skipped` | `true` if release was skipped        |

## Roadmap

See [docs/roadmap.md](docs/roadmap.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
````

Replace `YOUR_ORG` with the actual GitHub org/username before publishing.

- [ ] **Step 13.2 — Create `docs/quick-start.md`**

```markdown
# Quick Start

Get up and running in under 5 minutes.

## 1. Add a VERSION file

Create `VERSION.md` in the root of your repo:
```

1.0.0

````

## 2. Add a CHANGELOG file

Create `CHANGELOG.md`:

```markdown
# Changelog
````

## 3. Create release labels

In your GitHub repo, go to **Issues → Labels** and create:

- `release:major`
- `release:minor`
- `release:patch`
- `release:none`

## 4. Add the workflow

Create `.github/workflows/release.yml`:

```yaml
name: Release

on:
  pull_request:
    types: [closed]
    branches: [main]

permissions:
  contents: write
  pull-requests: read

jobs:
  release:
    runs-on: ubuntu-latest
    if: github.event.pull_request.merged == true
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: YOUR_ORG/pr-version-bot@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

## 5. Merge a PR

Apply a `release:patch` label to your next PR and merge it. The action will:

1. Read the label
2. Bump `VERSION` from `1.0.0` to `1.0.1`
3. Prepend a `CHANGELOG.md` entry
4. Commit both files
5. Create tag `v1.0.1`
6. Publish a GitHub Release

`````

- [ ] **Step 13.3 — Create `docs/configuration.md`**

Write a table documenting every input and output with: name, type, required, default, and a usage example. Use the inputs/outputs from `action.yml` in Task 2. Each input gets a 1-2 sentence description of edge cases and accepted values.

- [ ] **Step 13.4 — Create `docs/labels.md`**

Document all 4 labels with: name, colour recommendation (`#0075ca`, `#e4e669`, `#d93f0b`, `#cfd3d7`), bump effect, and an example showing version before/after.

- [ ] **Step 13.5 — Create `docs/architecture.md`**

````markdown
# Architecture

## Data Flow

```mermaid
flowchart TD
    PR[Pull Request Merged]
    --> LABELS[labels.ts\nDetect bump type from PR labels]

    LABELS
    --> VERSION[version.ts\nRead VERSION file, compute next semver]

    VERSION
    --> CHANGELOG[changelog.ts\nPrepend entry to CHANGELOG.md]

    CHANGELOG
    --> GIT[git.ts\nCommit VERSION + CHANGELOG, create tag]

    GIT
    --> RELEASE[github-release.ts\nCreate GitHub Release via API]

    RELEASE
    --> OUTPUTS[Action outputs\nversion, tag, bump, skipped]
`````

## Module Responsibilities

| Module              | Responsibility                                           |
| ------------------- | -------------------------------------------------------- |
| `labels.ts`         | Pure function. Maps label strings to bump type. No I/O.  |
| `version.ts`        | Reads/writes `VERSION` file. Uses `semver` package.      |
| `changelog.ts`      | Reads/writes `CHANGELOG.md`. Prepends formatted entry.   |
| `git.ts`            | Runs git commands via `@actions/exec`. No shell strings. |
| `github-release.ts` | Calls GitHub REST API via `@actions/github` octokit.     |
| `index.ts`          | Wires all modules. Handles all `@actions/core` I/O.      |

````

- [ ] **Step 13.6 — Create `docs/roadmap.md`**

```markdown
# Roadmap

## MVP — v1.0.0 ✅
Label-driven semver bumps, CHANGELOG updates, git tags, GitHub Releases, dry-run mode, CI/CD, CodeQL, Dependabot.

## v1.1.0 — Config file
Support `.versionbot.yml` for per-repo configuration without workflow changes.

## v1.2.0 — package.json sync
Optionally update `version` in `package.json` alongside the `VERSION` file.

## v1.3.0 — Conventional commits fallback
Use commit message prefixes (`feat:`, `fix:`, `BREAKING CHANGE:`) when no release label is present.

## v1.4.0 — Slack/Discord notifications
Post a release summary to a configured webhook after each release.

## v2.0.0 — Monorepo support
Support multiple packages in a single repo, each with independent versioning.

## v2.1.0 — Pre-release / RC versions
Support `release:prerelease` and `release:rc` labels for pre-release versioning.

## v3.0.0 — GitHub Marketplace
Public Marketplace listing with verified branding and usage metrics.
```

- [ ] **Step 13.7 — Create `docs/versioning-policy.md`**

```markdown
# Versioning Policy

This action and the projects using it follow [Semantic Versioning](https://semver.org/).

## Bump types

| Type | When to use | Example |
|---|---|---|
| `major` | Breaking change — existing workflows may need updating | `1.2.3` → `2.0.0` |
| `minor` | New feature, backwards-compatible | `1.2.3` → `1.3.0` |
| `patch` | Bug fix, backwards-compatible | `1.2.3` → `1.2.4` |
| `none` | No release needed (docs, CI, chore) | version unchanged |

## When in doubt

Use `patch` for fixes, `minor` for features, `major` for anything that changes how callers use the action (renamed inputs, removed outputs, changed defaults).
```

- [ ] **Step 13.8 — Create `docs/troubleshooting.md`**

```markdown
# Troubleshooting

## No release label on PR

**Symptom:** Action runs but version is bumped by `patch` unexpectedly.

**Cause:** No `release:*` label was applied before merging. The action defaults to `default-bump` (default: `patch`).

**Fix:** Apply a label before merging, or set `default-bump: none` to skip releases without a label.

---

## Multiple release labels error

**Symptom:** Action fails with `Multiple release labels found: release:major, release:minor`.

**Cause:** PR has more than one `release:*` label and `fail-on-multiple-labels` is `true` (default).

**Fix:** Remove extra labels. Or set `fail-on-multiple-labels: false` to use the first match.

---

## VERSION file parse error

**Symptom:** Action fails with `Invalid semver in VERSION`.

**Cause:** The `VERSION` file contains something other than a valid semver string (e.g. `v1.0.0` with a `v` prefix, or a blank file).

**Fix:** Ensure `VERSION` contains exactly a bare semver: `1.0.0` with no prefix and no extra whitespace beyond a trailing newline.

---

## dist out of sync

**Symptom:** CI fails on `git diff --exit-code dist/`.

**Cause:** `src/` was changed but `npm run build` was not run before committing.

**Fix:** Run `npm run build` and commit the updated `dist/index.js`.
```

- [ ] **Step 13.9 — Create ADRs**

Create `docs/adrs/ADR-001-use-semver.md`:
```markdown
# ADR-001 — Use semver for versioning

- **Status:** Accepted
- **Date:** 2026-06-04
- **Context:** Need a versioning scheme that is widely understood, supported by tooling, and works for both the action itself and consuming repos.
- **Decision:** Semantic Versioning 2.0.0. Version stored as a bare string in a `VERSION` file. The `semver` npm package handles all parsing and incrementing.
- **Consequences:** Version is always a string. Never parsed as a float. Consumers must maintain a `VERSION` file.
```

Create `docs/adrs/ADR-002-use-pr-labels.md`:
```markdown
# ADR-002 — Use PR labels to drive version bumps

- **Status:** Accepted
- **Date:** 2026-06-04
- **Context:** Version bump type must be communicated from developer to automation. Options: commit message conventions, PR title conventions, PR labels.
- **Decision:** PR labels (`release:major`, `release:minor`, `release:patch`, `release:none`). Labels are explicit, visible in the GitHub UI, and require deliberate intent. Conventional commits support deferred to v1.3.0.
- **Consequences:** Users must create labels in their repos. No automatic inference from commit history.
```

Create `docs/adrs/ADR-003-use-github-releases.md`:
```markdown
# ADR-003 — Create GitHub Releases

- **Status:** Accepted
- **Date:** 2026-06-04
- **Context:** Options: git tag only, or git tag + GitHub Release. GitHub Releases are visible in the repo UI, support release notes, enable download tracking, and are required for GitHub Marketplace.
- **Decision:** Create GitHub Release via `octokit.rest.repos.createRelease`. Controllable via `create-github-release` input (default: `true`).
- **Consequences:** Requires `contents: write` on the workflow token.
```

- [ ] **Step 13.10 — Create example workflows**

Create `examples/basic.yml`:
```yaml
name: Release

on:
  pull_request:
    types: [closed]
    branches: [main]

permissions:
  contents: write
  pull-requests: read

jobs:
  release:
    runs-on: ubuntu-latest
    if: github.event.pull_request.merged == true
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: YOUR_ORG/pr-version-bot@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

Create `examples/strict-labels.yml`:
```yaml
name: Release (strict)

on:
  pull_request:
    types: [closed]
    branches: [main]

permissions:
  contents: write
  pull-requests: read

jobs:
  release:
    runs-on: ubuntu-latest
    if: github.event.pull_request.merged == true
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: YOUR_ORG/pr-version-bot@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          fail-on-multiple-labels: 'true'
          default-bump: none
```

Create `examples/dry-run.yml`:
```yaml
name: Release (dry run)

on:
  pull_request:
    types: [closed]
    branches: [main]

permissions:
  contents: write
  pull-requests: read

jobs:
  release:
    runs-on: ubuntu-latest
    if: github.event.pull_request.merged == true
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - id: version
        uses: YOUR_ORG/pr-version-bot@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          dry-run: 'true'

      - name: Show planned version
        run: echo "Would release ${{ steps.version.outputs.tag }}"
```

- [ ] **Step 13.11 — Hand off to user**

Present all documentation files. This completes the MVP. Wait for user to commit.

---

## Self-Review Checklist

- [x] **Spec coverage:** All 13 stories covered across Tasks 1–13. All inputs, outputs, labels, modules, workflows, and working files accounted for.
- [x] **Placeholder scan:** No TBD/TODO in implementation tasks. Steps 13.3 and 13.4 describe content precisely enough to write without ambiguity.
- [x] **Type consistency:** `BumpType` defined in `labels.ts` and imported by `version.ts` and `index.ts`. `ChangelogEntry` defined in `changelog.ts` and used in `index.ts`. `detectBump`, `readVersion`, `bumpVersion`, `writeVersion`, `prependEntry`, `configureGit`, `commitRelease`, `createTag`, `createRelease` — all names consistent across definition and usage tasks.
````
