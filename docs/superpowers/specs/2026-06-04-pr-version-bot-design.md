# PR Version Bot — Design Spec

**Date:** 2026-06-04  
**Status:** Approved  
**Scope:** MVP (v1.0.0) — stories 1.1–1.13

---

## Overview

A reusable GitHub Action that automatically bumps semantic versions, updates CHANGELOG.md, creates a git tag, and publishes a GitHub Release when a pull request is merged. Version bump type is determined by PR labels. Built in TypeScript, compiled to a single `dist/index.js`, targeting Node.js 20.

---

## Architecture

```
GitHub Event: pull_request (type: closed, merged: true)
        │
        ▼
  src/index.ts          entry point — wires modules, handles dry-run, emits outputs
        │
  ┌─────┴──────┐
  │            │
labels.ts   git.ts       read PR labels / read VERSION file
  │            │
  └─────┬──────┘
        │
   version.ts            parse semver, apply bump, return next version
        │
  changelog.ts           prepend dated entry to CHANGELOG.md
        │
     git.ts              commit VERSION.md + CHANGELOG, create tag
        │
 github-release.ts       call GitHub API to create Release
        │
        ▼
   action outputs        version, tag, bump, skipped
```

---

## Repo Structure

```
pr-version-bot/
├── action.yml
├── src/
│   ├── index.ts
│   ├── version.ts
│   ├── labels.ts
│   ├── changelog.ts
│   ├── git.ts
│   └── github-release.ts
├── tests/
│   ├── version.test.ts
│   ├── labels.test.ts
│   ├── changelog.test.ts
│   ├── action-inputs.test.ts
│   └── fixtures/
├── dist/                        committed, built from src/
├── examples/
│   ├── basic.yml
│   ├── strict-labels.yml
│   └── dry-run.yml
├── docs/                        project documentation
│   ├── quick-start.md
│   ├── configuration.md
│   ├── labels.md
│   ├── troubleshooting.md
│   ├── architecture.md
│   ├── roadmap.md
│   ├── versioning-policy.md
│   └── adrs/
│       ├── ADR-001-use-semver.md
│       ├── ADR-002-use-pr-labels.md
│       └── ADR-003-use-github-releases.md
├── stu/                         working files — agents read/write here
│   ├── user-stories.md
│   ├── completed-user-stories.md
│   ├── memory.md
│   ├── backlog.md
│   └── backend-feature-requests.md
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── release.yml
│   │   └── codeql.yml
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug.yml
│   │   ├── feature.yml
│   │   └── question.yml
│   └── pull_request_template.md
├── README.md
├── CHANGELOG.md
├── VERSION.md
├── LICENSE
├── SECURITY.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── package.json
├── tsconfig.json
├── eslint.config.js
├── prettier.config.js
└── vitest.config.ts
```

---

## Action Inputs

| Input | Default | Description |
|---|---|---|
| `version-file` | `VERSION.md` | Path to the file containing the current semver |
| `changelog-file` | `CHANGELOG.md` | Path to changelog |
| `default-bump` | `patch` | Bump type when no release label is present |
| `tag-prefix` | `v` | Prefix for git tags (e.g. `v1.2.3`) |
| `create-github-release` | `true` | Whether to create a GitHub Release |
| `fail-on-multiple-labels` | `true` | Fail if PR has more than one release label |
| `dry-run` | `false` | Run without writing anything |
| `target-branch` | `main` | Branch to commit release changes to |
| `commit-message-template` | `chore(release): {tag}` | Template for the release commit message |

## Action Outputs

| Output | Description |
|---|---|
| `version` | New semantic version (e.g. `1.2.3`) |
| `tag` | Created git tag (e.g. `v1.2.3`) |
| `bump` | Bump type: `major`, `minor`, `patch`, or `none` |
| `skipped` | `true` if release was skipped (`release:none`) |

---

## Labels

| Label | Bump |
|---|---|
| `release:major` | Breaking change → `2.0.0` |
| `release:minor` | New feature → `1.1.0` |
| `release:patch` | Bug fix → `1.0.1` |
| `release:none` | Skip release entirely |
| *(no label)* | Defaults to `default-bump` input |

---

## Core Logic (index.ts)

1. Check `github.event.pull_request.merged == true` — exit early if not merged
2. Read labels from PR via `@actions/github`
3. Detect bump type via `labels.ts`
4. If `bump === none` → set `skipped=true`, emit outputs, exit 0
5. Read VERSION.md file → parse semver via `version.ts`
6. Compute next version
7. If `dry-run === true` → log what would happen, emit outputs, exit 0
8. Write next version to VERSION.md file
9. Prepend CHANGELOG entry via `changelog.ts`
10. Commit both files + create tag via `git.ts`
11. Create GitHub Release via `github-release.ts`
12. Emit outputs

---

## MVP Stories

Stories are sequential. User commits after each story completes.

| Story | Owner Agent | What ships |
|---|---|---|
| 1.1 | GitHub Actions Engineer | Repo scaffold — `package.json`, `tsconfig.json`, `vitest.config.ts`, `eslint.config.js`, `prettier.config.js`, `LICENSE`, `SECURITY.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `VERSION.md` (0.0.0), empty `CHANGELOG.md`, `stu/` working files |
| 1.2 | GitHub Actions Engineer | `action.yml` — inputs, outputs, branding, Node.js 20 runtime |
| 1.3 | TypeScript Backend | `src/labels.ts` + tests — read PR labels, detect bump, fail on multiple, default to patch |
| 1.4 | TypeScript Backend | `src/version.ts` + tests — parse semver from VERSION.md, apply bump |
| 1.5 | TypeScript Backend | `src/changelog.ts` + tests — prepend dated entry to CHANGELOG.md |
| 1.6 | TypeScript Backend | `src/git.ts` + tests — commit VERSION.md + CHANGELOG, create tag |
| 1.7 | TypeScript Backend | `src/github-release.ts` + tests — create GitHub Release |
| 1.8 | TypeScript Backend | `src/index.ts` — wire all modules, dry-run, outputs, skip logic |
| 1.9 | GitHub Actions Engineer | CI workflow (`ci.yml`) — lint, typecheck, test, build, dist check |
| 1.10 | DevOps/Security | CodeQL (`codeql.yml`) + Dependabot (`dependabot.yml`) |
| 1.11 | GitHub Actions Engineer | Release workflow (`release.yml`) — action uses itself |
| 1.12 | GitHub Actions Engineer | GitHub templates — issue templates, PR template |
| 1.13 | Documentation | `README.md`, `docs/quick-start.md`, `docs/configuration.md`, `docs/labels.md`, `docs/architecture.md`, `docs/roadmap.md`, `docs/versioning-policy.md`, ADRs, `examples/` |

---

## Agent Workflow (MVP only)

```
Story assigned
      │
      ▼
Product Architect Agent
  reads stu/user-stories.md
  writes full AC + SC for story
  writes ADRs to stu/memory.md
      │
      ▼
GitHub Actions Engineer  (stories 1.2, 1.9, 1.10, 1.11, 1.12)
  OR
TypeScript Backend Agent (stories 1.3–1.8)
      │
      ▼
Test Engineer Agent
  verifies tests pass, coverage ≥ 80%
  logs any debt to stu/backlog.md
      │
      ▼
DevOps/Security Agent
  least-privilege check, secrets review, permissions audit
  runs on stories 1.9–1.11 + security pass on each story
      │
      ▼
Documentation Agent
  updates docs/ after each story
  owns story 1.13
      │
      ▼
Review Agent
  final gate — bugs, drift, coverage, professionalism
      │
      ▼
User commits ✓
```

This workflow applies only until MVP (v1.0.0) is complete. Post-MVP epics will define their own workflow.

---

## Test Strategy

Framework: **Vitest**. Target coverage: **≥ 80%** (90% preferred).

| Test file | Cases |
|---|---|
| `version.test.ts` | `1.0.0 + patch = 1.0.1`, `+ minor = 1.1.0`, `+ major = 2.0.0`, invalid VERSION fails, missing VERSION fails |
| `labels.test.ts` | single label detected, `release:none` skips, multiple labels fails, no label defaults to patch |
| `changelog.test.ts` | entry prepended with correct date, PR title, version |
| `action-inputs.test.ts` | dry-run logs without writing, outputs emitted correctly |

---

## CI/CD Workflows

### `ci.yml` (every PR)
```
npm ci → lint → format:check → typecheck → test → build → git diff --exit-code dist/
```

### `codeql.yml`
CodeQL security scan on push to main and PRs.

### `release.yml` (merged PRs on main)
Action uses itself. Requires `contents: write`, `pull-requests: read`. No other permissions.

---

## Future Epics (post-MVP)

| Epic | Feature |
|---|---|
| 2 | Config file support (`.versionbot.yml`) |
| 3 | `package.json` version sync |
| 4 | Conventional commits fallback |
| 5 | Slack/Discord notifications |
| 6 | Monorepo support |
| 7 | Pre-release / RC versions |
| 8 | GitHub Marketplace release |

---

## Working Files (stu/)

| File | Purpose |
|---|---|
| `stu/user-stories.md` | Active story queue with AC + SC. Agents read before touching code. |
| `stu/completed-user-stories.md` | Archive of finished stories. Newest first. Append-only. |
| `stu/memory.md` | ADR log. Every design decision recorded here. Never deleted. |
| `stu/backlog.md` | Tech debt logged by agents during stories. Open → Closed lifecycle. |
| `stu/backend-feature-requests.md` | Not applicable for MVP — included for future workflow parity. |

---

## Constraints

- No auto-commits during MVP build — user commits after each story
- `dist/` must be committed alongside `src/` changes
- All permissions follow least-privilege: only `contents: write` + `pull-requests: read` for release workflow
- Money/version values never parsed as float — always string semver
- AI-assisted code: all contributors responsible for reviewing and understanding changes before PR
