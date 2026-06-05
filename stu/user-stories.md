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

> All 3 stories delivered. Moved to completed-user-stories.md.

---

## Epic 10 — PR Template Checkbox Label Detection

> All 3 stories delivered. Moved to completed-user-stories.md.

---

## Epic 11 — Branch Protection Compatibility

> All 3 stories delivered. Moved to completed-user-stories.md.
