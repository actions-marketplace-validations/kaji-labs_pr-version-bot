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
- [ ] `VERSION.md` file contains `0.0.0`
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

- [ ] `action.yml` defines all 10 inputs with descriptions and defaults
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

> As the action, I want to read and bump the VERSION.md file, so that I can compute the next release version.

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

---

### Story 1.6 — git.ts

> As the action, I want to commit files and push a tag, so that the release is recorded in git history.

**AC:**

- [ ] `configureGit()` sets `user.name` to `github-actions[bot]` and `user.email` to `github-actions[bot]@users.noreply.github.com`
- [ ] `commitRelease(files, message)` stages each file and commits with the given message
- [ ] `createTag(tag)` creates a tag and pushes it + the commit to origin
- [ ] Tests mock `@actions/exec` and verify correct git commands are called
- [ ] Coverage ≥ 80%

**SC:**

- [ ] No tokens passed as CLI arguments
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
- [ ] Uses `octokit.rest.repos.createRelease`

---

### Story 1.8 — index.ts

> As a GitHub Actions workflow, I want the action entry point to wire all modules together.

**AC:**

- [ ] Exits early (success) if PR is not merged
- [ ] Reads all inputs via `@actions/core`
- [ ] Calls modules in correct order
- [ ] Sets `skipped=true` and exits 0 when `bump === none`
- [ ] In dry-run mode: logs intended changes, emits outputs, skips all write operations
- [ ] Emits `version`, `tag`, `bump`, `skipped` outputs on success
- [ ] Calls `core.setFailed` on any thrown error
- [ ] Tests mock all 6 modules + `@actions/core` + `@actions/github`
- [ ] Coverage ≥ 80%

**SC:**

- [ ] Token never logged
- [ ] `core.setFailed` used (not `process.exit`)

---

### Story 1.9 — ci.yml

> As a contributor, I want CI to run on every PR.

**AC:**

- [ ] Triggers on `pull_request` to `main` and `push` to `main`
- [ ] Steps: `npm ci` → lint → format:check → typecheck → test → build → dist check
- [ ] Runs on `ubuntu-latest`, Node.js 20

**SC:**

- [ ] Permissions: `contents: read` only

---

### Story 1.10 — CodeQL + Dependabot

> As a maintainer, I want automated security scanning and dependency updates.

**AC:**

- [ ] `codeql.yml` runs on push, PRs, and weekly schedule
- [ ] `dependabot.yml` checks npm and github-actions weekly

**SC:**

- [ ] CodeQL permissions: `security-events: write`, `actions: read`, `contents: read`

---

### Story 1.11 — release.yml

> As the action, I want to use itself to release itself.

**AC:**

- [ ] Triggers on `pull_request` closed to `main`
- [ ] Runs only when merged
- [ ] Uses `actions/checkout@v4` with `fetch-depth: 0`
- [ ] Calls `./` with version-file, changelog-file, default-bump

**SC:**

- [ ] Permissions: `contents: write`, `pull-requests: read` only

---

### Story 1.12 — GitHub Templates

> As a contributor, I want issue and PR templates.

**AC:**

- [ ] Bug, feature, question issue templates present
- [ ] PR template with type checklist and dist check reminder

**SC:**

- [ ] Templates do not request sensitive information

---

### Story 1.13 — Documentation

> As a user, I want clear documentation so I can adopt this action in under 5 minutes.

**AC:**

- [ ] README covers: what it does, quick start, labels, inputs/outputs, example workflow, badges
- [ ] docs/quick-start.md, configuration.md, labels.md, architecture.md, roadmap.md, versioning-policy.md, troubleshooting.md present
- [ ] 3 ADRs in docs/adrs/
- [ ] examples/basic.yml, strict-labels.yml, dry-run.yml present

**SC:**

- [ ] No real tokens in examples

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
