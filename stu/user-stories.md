# User Stories

## Epic 1 — MVP

> All 13 stories delivered. Moved to completed-user-stories.md.

---

## Epic 2 — Config File Support (.versionbot.yml)

> All 3 stories delivered. Moved to completed-user-stories.md.

---

## Epic 3 — package.json Version Sync

> All 3 stories delivered. Moved to completed-user-stories.md.

---

## Epic 4 — Conventional Commits Fallback

> All 3 stories delivered. Moved to completed-user-stories.md.

---

## Epic 5 — Slack/Discord Notifications

> All 4 stories delivered. Moved to completed-user-stories.md.

---

## Epic 6 — Monorepo Support

Support multiple independently-versioned packages in a single repository. Each package maintains its own `VERSION.md` and `CHANGELOG.md`. A single merged PR bumps all configured packages by the same bump type.

### Story 6.1 — Multi-package version bumping

> As a monorepo maintainer, I want the action to bump the version for each configured package path, so that all packages release together from a single PR.

**AC:**

- [ ] New input `packages` — comma-separated list of package paths (e.g. `packages/api,packages/web`)
- [ ] When `packages` is set, the action reads `{package}/VERSION.md` for each path, bumps it, and writes it back
- [ ] All packages bumped by the same bump type (determined by PR label or conventional commits)
- [ ] All bumped `VERSION.md` files committed in a single release commit alongside `CHANGELOG.md` files
- [ ] When `packages` is empty or not set, single-package behaviour is unchanged (backward-compatible)
- [ ] If any package `VERSION.md` is missing, action fails with a descriptive error naming the missing path
- [ ] New `src/monorepo.ts` module exports `resolvePackages(packages: string[], versionFile: string): string[]` returning the list of resolved version file paths
- [ ] Unit tests: single package path, multiple paths, empty packages (falls through to root), missing VERSION.md error

**SC:**

- [ ] Package paths validated as non-empty strings — no path traversal (`..`) allowed
- [ ] Each package path treated as relative to the repo root

---

### Story 6.2 — Per-package CHANGELOG.md updates

> As a monorepo maintainer, I want each package to have its own CHANGELOG.md updated on release, so that users of individual packages can track their history.

**AC:**

- [ ] When `packages` is configured, action prepends a changelog entry to `{package}/CHANGELOG.md` for each package
- [ ] Each entry uses the package's own new version (e.g. `packages/api` gets `## [1.2.0] - ...`)
- [ ] If `{package}/CHANGELOG.md` does not exist, it is created
- [ ] All package `CHANGELOG.md` files included in the release commit
- [ ] Root `CHANGELOG.md` still updated when `packages` not configured (single-package mode)
- [ ] Unit tests cover: multi-package changelog, create-if-missing, single-package fallback

**SC:**

- [ ] Changelog entries never include absolute paths — only relative package paths shown

---

### Story 6.3 — Config file support for packages

> As a user, I want to configure the packages list in `.versionbot.yml`, so that I don't have to maintain a long workflow input.

**AC:**

- [ ] `.versionbot.yml` supports `packages: [packages/api, packages/web]` (YAML array)
- [ ] Workflow input `packages` overrides config file value
- [ ] `src/config.ts` updated: `BotConfig` has `packages?: string[]`, `ResolvedConfig` has `packages: string[]` (default `[]`)
- [ ] `mergeConfig` parses comma-separated workflow input string into array
- [ ] Unit tests for array in file config, comma-separated input string, empty default

**SC:**

- [ ] Empty or missing `packages` defaults to `[]` — single-package mode

---

### Story 6.4 — Docs and examples for monorepo support

> As a user, I want clear documentation for the monorepo feature so I can configure it in minutes.

**AC:**

- [ ] `docs/configuration.md` updated with `packages` input and config file field
- [ ] `docs/troubleshooting.md` updated with monorepo-specific errors (missing VERSION.md, path traversal)
- [ ] `examples/monorepo.yml` created showing a two-package setup
- [ ] `.versionbot.yml.example` updated with `packages` field (commented out)
- [ ] `docs/roadmap.md` updated to mark Epic 6 complete

**SC:**

- [ ] No real org names or paths in examples beyond `packages/api` and `packages/web` placeholders

---

## Epic 7 — Pre-release / RC Versions

Support pre-release and release-candidate versioning via dedicated labels, allowing teams to publish `1.2.0-alpha.1` or `1.2.0-rc.1` before a stable release.

### Story 7.1 — Pre-release version bumping

> As a release manager, I want to publish pre-release versions (alpha, beta, rc) so that teams can test before the stable release ships.

**AC:**

- [ ] New labels supported: `release:alpha`, `release:beta`, `release:rc`
- [ ] `release:alpha` → bumps patch and appends `-alpha.N` (e.g. `1.2.3` → `1.2.4-alpha.1`)
- [ ] `release:beta` → bumps patch and appends `-beta.N` (e.g. `1.2.3` → `1.2.4-beta.1`)
- [ ] `release:rc` → bumps patch and appends `-rc.N` (e.g. `1.2.3` → `1.2.4-rc.1`)
- [ ] If current version is already a pre-release of the same channel (e.g. `1.2.4-alpha.1`), increments the pre-release number (→ `1.2.4-alpha.2`)
- [ ] Pre-release labels configurable via `.versionbot.yml` `labels` block (same pattern as existing labels)
- [ ] `src/version.ts` updated with `bumpPrerelease(current, channel)` function
- [ ] Unit tests: fresh pre-release, increment pre-release, rc from stable, alpha→beta promotion

**SC:**

- [ ] Pre-release identifiers never contain spaces or special characters beyond hyphen and dot
- [ ] `release:none` always skips — takes precedence over pre-release labels

---

### Story 7.2 — Stable release from pre-release

> As a release manager, I want to publish a stable release that clears the pre-release suffix, so that `1.2.4-rc.3` becomes `1.2.4`.

**AC:**

- [ ] When current version is a pre-release (e.g. `1.2.4-rc.3`) and a standard `release:patch`, `release:minor`, or `release:major` label is applied, the pre-release suffix is stripped cleanly
- [ ] `release:patch` on `1.2.4-rc.3` → `1.2.4` (no additional bump — patch was already applied when pre-release started)
- [ ] `release:minor` on `1.2.4-rc.3` → `1.3.0` (bumps to next minor)
- [ ] `release:major` on `1.2.4-rc.3` → `2.0.0`
- [ ] Unit tests cover all three promotion paths

**SC:**

- [ ] Stable version never contains a hyphen or pre-release identifier

---

### Story 7.3 — Docs and examples for pre-release versioning

> As a user, I want documentation for the pre-release feature so I can understand the version lifecycle.

**AC:**

- [ ] `docs/labels.md` updated with pre-release labels table and version lifecycle diagram
- [ ] `docs/configuration.md` updated with pre-release label customisation
- [ ] `docs/versioning-policy.md` updated with pre-release lifecycle (alpha → beta → rc → stable)
- [ ] `examples/prerelease.yml` created showing pre-release workflow
- [ ] `docs/roadmap.md` updated to mark Epic 7 in progress

**SC:**

- [ ] No real tokens in examples

---

## Epic 8 — GitHub Marketplace Release

> Stories TBD after Epic 7 ships.
