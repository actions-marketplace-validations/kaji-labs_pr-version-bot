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

> All 3 stories delivered. Moved to completed-user-stories.md.

---

## Epic 8 — GitHub Marketplace Release

Publish PR Version Bot to the GitHub Marketplace so teams can discover and install it in one click. Covers all Marketplace requirements, branding, listing content, major-version tag automation, and the final pre-publish checklist.

### Story 8.1 — Marketplace metadata and branding

> As a maintainer, I want `action.yml` to be fully Marketplace-compliant and visually branded, so that the action appears correctly in search results and on the listing page.

**AC:**

- [ ] `action.yml` has `name` ≤ 64 characters — current: `PR Version Bot` ✅
- [ ] `action.yml` has a `description` field ≤ 125 characters suitable for Marketplace search snippets
- [ ] `action.yml` `branding` block has `icon` set to a valid Feather icon name and `color` to one of the allowed Marketplace colours (`white`, `yellow`, `blue`, `green`, `orange`, `red`, `purple`, `gray-dark`)
- [ ] `action.yml` has an `author` field set to `Rashay Daya`
- [ ] All inputs have `description` fields — none left blank or using placeholder text
- [ ] All outputs have `description` fields — none left blank
- [ ] `README.md` includes a `## Usage` section with a minimal copy-paste example (required by Marketplace guidelines)
- [ ] Run `act` or GitHub Actions runner locally to verify `action.yml` is parseable, OR verify via the GitHub repo's Actions tab
- [ ] Unit test (or manual check): confirm `action.yml` passes `@actions/toolkit` schema validation

**SC:**

- [ ] `author` field in `action.yml` is Rashay Daya — not the org name
- [ ] No sensitive data (tokens, secrets, emails) in `action.yml`

---

### Story 8.2 — Marketplace listing content

> As a potential adopter, I want a compelling Marketplace listing page with a clear description, badges, and usage examples, so that I can evaluate and install the action in under 2 minutes.

**AC:**

- [ ] `README.md` is the source for the Marketplace listing — it must stand alone as a complete product page
- [ ] `README.md` contains in order: title + badges, one-line pitch, how-it-works list, quick-start code block, required labels table, all inputs table, all outputs table, links to full docs
- [ ] All badge URLs in `README.md` are live and functional (CI, CodeQL, license badge)
- [ ] A version badge is added: `![Version](https://img.shields.io/github/v/release/kaji-labs/pr-version-bot?label=version&color=orange)`
- [ ] The quick-start example in `README.md` references the Marketplace-style action ref `kaji-labs/pr-version-bot@v1` (major version alias)
- [ ] `docs/quick-start.md` is updated to show both the Marketplace install URL and the workflow snippet
- [ ] Add a `## Why PR Version Bot?` section to `README.md` listing 3–5 differentiators vs. manual versioning

**SC:**

- [ ] No real webhook URLs, PATs, or org-specific secrets in any public-facing doc
- [ ] All example action refs use `kaji-labs/pr-version-bot@v1` — never a SHA or private URL

---

### Story 8.3 — Major version floating tag automation

> As a user, I want to reference `kaji-labs/pr-version-bot@v1` and always get the latest v1.x.x patch, so that I receive bug fixes automatically without pinning exact versions.

**AC:**

- [ ] `release.yml` workflow updated: after a successful release, force-updates the major version floating tag (e.g. `v1`) to point to the same commit as the new tag
- [ ] Logic: extract major version from new tag (`v1.2.3` → `v1`), run `git tag -f v1 {new-tag}` and `git push origin v1 --force`
- [ ] Major tag update only runs when the new release is NOT a pre-release (no `-alpha`, `-beta`, `-rc` suffix)
- [ ] Unit test for tag extraction: `extractMajorTag('v1.2.3') === 'v1'`, `extractMajorTag('v2.0.0') === 'v2'`, `extractMajorTag('v1.2.3-rc.1') === null`
- [ ] New `src/release-tag.ts` exports `extractMajorTag(tag: string): string | null`

**SC:**

- [ ] `--force` push to major tag is intentional and documented — standard GitHub Actions pattern
- [ ] Only the major tag is force-pushed — exact version tags (`v1.2.3`) are never overwritten

---

### Story 8.4 — Pre-publish checklist and v1.0.0 release

> As a maintainer, I want a documented pre-publish checklist and a clean v1.0.0 release, so that the Marketplace listing launches professionally with no known issues.

**AC:**

- [ ] All `[GO PUBLIC]` backlog items resolved: B-008 through B-015
- [ ] `VERSION.md` bumped to `1.0.0` manually (the first stable release)
- [ ] A `CHANGELOG.md` entry for v1.0.0 summarising features across Epics 1–6
- [ ] A GitHub Release for `v1.0.0` with a hand-crafted body highlighting key features
- [ ] Repo made public on GitHub before Marketplace submission
- [ ] Marketplace submission via GitHub UI: Settings → Actions → Publish to Marketplace — category `Continuous Integration`
- [ ] After publishing, listing visible at `github.com/marketplace/actions/pr-version-bot`
- [ ] `docs/release-checklist.md` created capturing the full pre-publish checklist for future major releases

**SC:**

- [ ] Repo must be public BEFORE Marketplace submission — private repos cannot be listed
- [ ] `SECURITY.md` private advisory URL must be live before going public
- [ ] No uncommitted files at the time of v1.0.0 release
- [ ] CodeQL must pass cleanly (no `continue-on-error`) before submission

---

## Epic 9 — Release Badge & README Auto-Sync

Automatically generate a dynamic version badge JSON file and update a designated README block with the latest version, install snippet, and major version alias on every release. Gives the repo a professional, always-current appearance with zero manual effort.

### Story 9.1 — Dynamic version badge JSON generation

> As a repo maintainer, I want the action to generate a Shields.io-compatible badge JSON file on release, so that my README always shows the current version without manual updates.

**AC:**

- [ ] New input `generate-badge` (default: `'false'`)
- [ ] When `'true'`, action writes `/.badges/version.json` after a successful release with:
  ```json
  { "schemaVersion": 1, "label": "version", "message": "v1.2.3", "color": "orange" }
  ```
- [ ] `message` uses the `tag-prefix` + new version (e.g. `v1.2.3`)
- [ ] `color` configurable via `badge-color` input (default: `'orange'`)
- [ ] Badge file committed alongside `VERSION.md` and `CHANGELOG.md` in the release commit
- [ ] Badge file path configurable via `badge-file` input (default: `.badges/version.json`)
- [ ] New `src/badge.ts` module exports `generateBadgeJson(tag, color)` and `writeBadgeFile(path, json)`
- [ ] Unit tests: correct JSON shape, custom color, custom path, not written in dry-run

**SC:**

- [ ] Badge file never contains sensitive information — only version string and color
- [ ] Badge directory created if it does not exist

---

### Story 9.2 — README block auto-update

> As a repo maintainer, I want the action to update a marked section of my README on every release, so that the install snippet always shows the latest pinned version.

**AC:**

- [ ] New input `update-readme` (default: `'false'`)
- [ ] When `'true'`, action reads README (default: `README.md`, configurable via `readme-file` input)
- [ ] Replaces content between `<!-- VERSIONBOT:START -->` and `<!-- VERSIONBOT:END -->` with a generated block:

  ````markdown
  <!-- VERSIONBOT:START -->

  > Current stable release: **v1.2.3**

  **Pinned version (recommended):**

  ```yaml
  - uses: kaji-labs/pr-version-bot@v1.2.3
  ```
  ````

  **Major version alias:**

  ```yaml
  - uses: kaji-labs/pr-version-bot@v1
  ```

  <!-- VERSIONBOT:END -->

  ```

  ```

- [ ] If markers are not found in the README, logs `core.info` and skips — does not fail
- [ ] Marker strings configurable via `readme-start-marker` and `readme-end-marker` inputs
- [ ] README file committed in the same release commit
- [ ] Unit tests: markers present and replaced, markers absent (no-op), custom markers, not written in dry-run

**SC:**

- [ ] README update never removes content outside the marked block
- [ ] Generated block contains no sensitive information

---

### Story 9.3 — Config file support and docs

> As a user, I want to configure badge and README sync in `.versionbot.yml`, and have clear documentation on how to set up the markers.

**AC:**

- [ ] `.versionbot.yml` supports: `generateBadge`, `badgeColor`, `badgeFile`, `updateReadme`, `readmeFile`, `readmeStartMarker`, `readmeEndMarker`
- [ ] Workflow inputs override config file values for all 7 new fields
- [ ] `src/config.ts` updated with all fields in `BotConfig`, `ResolvedConfig`, and `mergeConfig`
- [ ] Unit tests for each field: config file path, input override, default values
- [ ] `docs/configuration.md` updated with all 7 new inputs
- [ ] `docs/quick-start.md` updated with badge setup example
- [ ] `examples/with-version-badge.yml` created showing badge + README sync
- [ ] `.versionbot.yml.example` updated with new fields (commented out)
- [ ] README for this repo updated with: live badge URL using the generated `.badges/version.json`, and VERSIONBOT markers around the install snippet

**SC:**

- [ ] No real API keys, tokens, or org-specific URLs hardcoded in docs or examples
- [ ] Badge JSON schema follows Shields.io endpoint spec exactly (`schemaVersion`, `label`, `message`, `color`)

---

## Epic 10 — PR Template Checkbox Label Detection

> All 3 stories delivered. Moved to completed-user-stories.md.

---

## Epic 11 — Branch Protection Compatibility

Handle repos where `main` is protected and direct pushes are not allowed. The action currently commits `VERSION.md` and `CHANGELOG.md` directly to the target branch, which fails when branch protection rules require PRs or signed commits.

### Story 11.1 — Detect branch protection and fail clearly

> As a user with branch protection enabled, I want the action to detect that it cannot push directly to main and fail with a clear, actionable error message, so I understand exactly what to fix.

**AC:**

- [ ] When `git push` fails due to branch protection, action catches the error and re-throws with a descriptive message explaining that direct pushes to the target branch are blocked and suggesting the `use-release-pr` option (Story 11.2)
- [ ] Error message includes the target branch name and a link to the docs
- [ ] Unit tests: push failure wraps error with helpful message

**SC:**

- [ ] Error message never includes the GITHUB_TOKEN or any credential

---

### Story 11.2 — Release PR mode

> As a user with branch protection, I want the action to open a release PR instead of pushing directly to main, so that the release commit goes through the normal PR review flow.

**AC:**

- [ ] New input `use-release-pr` (default: `'false'`)
- [ ] When `'true'`, instead of committing directly to the target branch:
  1. Creates a new branch `release/{tag}` (e.g. `release/v1.2.3`)
  2. Commits `VERSION.md`, `CHANGELOG.md` (and any other release files) to that branch
  3. Opens a PR from `release/{tag}` → `target-branch` via GitHub API
  4. PR title: `chore(release): {tag}` (uses `commit-message-template`)
  5. PR body: auto-generated with the CHANGELOG entry for this release
  6. PR is created with `release:none` label so it does NOT trigger another release on merge
  7. Git tag is created pointing to the release branch commit (not main)
- [ ] Action outputs `release-pr-url` with the URL of the created PR
- [ ] Action skips `createTag` and `createRelease` until the release PR is merged (or they happen immediately depending on `tag-on-release-pr` input — default `'true'` for immediate tag)
- [ ] Unit tests: release branch created, PR opened, release:none label applied, tag created on branch

**SC:**

- [ ] Release PR branch name never contains special characters beyond `/`, `.`, `-`
- [ ] `GITHUB_TOKEN` requires `pull-requests: write` permission when `use-release-pr` is enabled
- [ ] Release PR always gets `release:none` label to prevent recursive release triggering

---

### Story 11.3 — Config file support and docs

> As a user, I want to configure release PR mode in `.versionbot.yml` and have clear documentation on setting it up with branch protection.

**AC:**

- [ ] `.versionbot.yml` supports `useReleasePr: true/false` and `tagOnReleasePr: true/false`
- [ ] `src/config.ts` updated with both new fields
- [ ] `docs/configuration.md` updated with `use-release-pr` and `tag-on-release-pr` inputs
- [ ] `docs/troubleshooting.md` updated with branch protection section explaining both approaches
- [ ] `examples/with-branch-protection.yml` created showing `use-release-pr: 'true'` with `pull-requests: write` permission
- [ ] `docs/quick-start.md` updated with branch protection note

**SC:**

- [ ] Examples clearly show the `pull-requests: write` permission requirement
- [ ] No real tokens or org names beyond `kaji-labs` in examples
