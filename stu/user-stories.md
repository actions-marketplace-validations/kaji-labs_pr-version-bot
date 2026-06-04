# User Stories

## Epic 1 — MVP

> All 13 stories delivered. Moved to completed-user-stories.md.

---

## Epic 2 — Config File Support (.versionbot.yml)

> All 3 stories delivered. Moved to completed-user-stories.md.

---

## Epic 3 — package.json Version Sync

Optionally sync the `version` field in `package.json` alongside `VERSION.md` when a release is created.

### Story 3.1 — Detect and update package.json version

> As a Node.js project user, I want the action to update my `package.json` version automatically, so that my npm package version stays in sync with my releases.

**AC:**

- [ ] New input `sync-package-json` (default: `'false'`)
- [ ] When `'true'`, action reads `package.json`, updates `version` field to match new semver, writes it back
- [ ] `package.json` committed alongside `VERSION.md` and `CHANGELOG.md` in the release commit
- [ ] If `package.json` does not exist, action logs a warning and continues (does not fail)
- [ ] Unit tests cover: sync enabled with valid package.json, sync enabled with missing file, sync disabled (no-op)

**SC:**

- [ ] `package.json` never read as float — version always treated as string
- [ ] No other fields in `package.json` modified

---

### Story 3.2 — Config file support for sync-package-json

> As a user, I want to enable package.json sync in `.versionbot.yml`, so that I don't have to change my workflow.

**AC:**

- [ ] `.versionbot.yml` supports `syncPackageJson: true/false`
- [ ] Workflow input overrides config file value
- [ ] `src/config.ts` updated: `BotConfig` and `ResolvedConfig` include `syncPackageJson: boolean`
- [ ] `mergeConfig` handles new field correctly (default: `false`)
- [ ] Unit tests updated

**SC:**

- [ ] Default is `false` — no unintended package.json modifications for existing users

---

### Story 3.3 — Docs for package.json sync

> As a user, I want documentation for the package.json sync feature.

**AC:**

- [ ] `docs/configuration.md` updated with `sync-package-json` input and `syncPackageJson` config key
- [ ] `docs/troubleshooting.md` updated with common package.json sync errors
- [ ] `examples/nodejs-with-package-json.yml` created

**SC:**

- [ ] No real tokens in examples

---

## Epic 4 — Conventional Commits Fallback

> All 3 stories delivered. Moved to completed-user-stories.md.

## Epic 5 — Slack/Discord Notifications

> Stories TBD after Epic 4 ships.

## Epic 6 — Monorepo Support

> Stories TBD after Epic 5 ships.

## Epic 7 — Pre-release / RC Versions

> Stories TBD after Epic 6 ships.

## Epic 8 — GitHub Marketplace Release

> Stories TBD after Epic 7 ships.
