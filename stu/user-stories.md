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

> All 4 stories delivered. Moved to completed-user-stories.md.

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
