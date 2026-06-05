# Backlog

## Open Items

### B-016 — Enrich release notes with PR link, author, and label used

- **Logged:** 2026-06-04 | **Closed:** 2026-06-05
- **Resolution:** `src/github-release.ts` updated — `createRelease` now accepts a `ReleaseContext` object and generates a structured body with PR link, author handle, and compare URL. Both call sites in `src/index.ts` updated.

---

### B-017 — Include PR link in CHANGELOG.md entries

- **Logged:** 2026-06-04 | **Closed:** 2026-06-05
- **Resolution:** `src/changelog.ts` — `ChangelogEntry` gained optional `prUrl?: string`; `buildEntry` renders `([#42](url))` when present, falls back to `(#42)`. Both `prependEntry` call sites in `src/index.ts` pass `pr.html_url`.

---

### B-008 — [GO PUBLIC] Enable CodeQL scanning (remove continue-on-error)

- **Logged:** 2026-06-04
- **Priority:** High — do before making repo public
- **Description:** `.github/workflows/codeql.yml` has `continue-on-error: true` on the analyze step because the repo is private and lacks GitHub Advanced Security. When the repo goes public, CodeQL is free. Remove `continue-on-error: true` from the analyze step so CodeQL failures break CI properly.
- **File:** `.github/workflows/codeql.yml` — remove `continue-on-error: true` from the `Perform CodeQL Analysis` step.
- **Status:** Open

---

### B-009 — [GO PUBLIC] Pin all GitHub Actions to exact commit SHAs (resolves B-004)

- **Logged:** 2026-06-04
- **Priority:** High — do before making repo public
- **Description:** All workflows use major-version pins (`@v4`, `@v6`). Before going public, pin to exact SHAs for supply-chain security (OSSF Scorecard requirement). Use `pin-github-action` or `step-security/harden-runner` to automate. Supersedes B-004.
- **Workflows to update:** `ci.yml`, `codeql.yml`, `release.yml`, `build-dist.yml`
- **Status:** Open

---

### B-010 — [GO PUBLIC] Ensure SECURITY.md advisory URL is correct

- **Logged:** 2026-06-04 | **Closed:** 2026-06-05
- **Resolution:** Verified — `SECURITY.md` correctly links to `https://github.com/kaji-labs/pr-version-bot/security/advisories/new`. No `YOUR_ORG` placeholder remains. Feature becomes active automatically when repo goes public.

---

### B-011 — [GO PUBLIC] Add branch protection rules to main

- **Logged:** 2026-06-04
- **Priority:** High — do before making repo public
- **Description:** Document and configure branch protection on `main`: require PR, require CI to pass (CI workflow), require at least 1 approval, block force pushes, require branch up-to-date. Note: once branch protection is on, the `build-dist.yml` auto-commit workflow will fail because it pushes directly to main — either exempt the `github-actions[bot]` user or migrate to Release PR mode (Epic 11).
- **Status:** Open

---

### B-012 — [GO PUBLIC] Update README badges to show live status

- **Logged:** 2026-06-04
- **Priority:** Medium — do before making repo public
- **Description:** README currently has CI and CodeQL badge URLs pointing to `kaji-labs/pr-version-bot`. Once public, these badges will show live build status. Also add: a version badge using Shields.io GitHub release (`https://img.shields.io/github/v/release/kaji-labs/pr-version-bot`), and a test coverage badge if coverage reports are uploaded to a service.
- **Status:** Open

---

### B-013 — [GO PUBLIC] Create the 4 release labels in the repo

- **Logged:** 2026-06-04
- **Priority:** High — needed for release workflow to function
- **Description:** The release workflow requires `release:major`, `release:minor`, `release:patch`, and `release:none` labels to exist in the GitHub repo. Create them via: `gh label create "release:major" --color "d93f0b"` etc. Also create `dependencies` label used by Dependabot.
- **Status:** Open

---

### B-014 — [GO PUBLIC] Review and tighten CODEOWNERS

- **Logged:** 2026-06-04 | **Closed:** 2026-06-05
- **Resolution:** `.github/CODEOWNERS` expanded to require `@Rashay01` review on `/action.yml`, `/src/`, `/.github/workflows/`, and `/LICENSE`.

---

### B-015 — [GO PUBLIC] Verify build-dist.yml auto-commit works with branch protection

- **Logged:** 2026-06-04
- **Priority:** High — likely breaks when branch protection is added
- **Description:** `build-dist.yml` pushes directly to `main` after merging src changes. If branch protection is enabled (see B-011), this push will be rejected unless `github-actions[bot]` is exempt or a PAT is used. Options: (1) exempt `github-actions[bot]` from push restrictions in branch protection settings, (2) switch to Release PR mode (Epic 11), (3) require dist to be built locally and committed by developers (original approach before build-dist.yml was added).
- **Status:** Open

---

### B-007 — conventional.ts: conventional scan can silently downgrade defaultBump

- **Logged:** 2026-06-04 by review agent
- **Triggered by:** Story 4.1
- **Priority:** Low
- **Description:** When `useConventionalCommits` is true and no release label exists, `detectBump` already returns `defaultBump` (e.g. `minor`). If the conventional scan then detects only `fix:` commits, `bump` is overwritten to `patch`, silently downgrading below the configured default. Current semantics: conventional commits always override `defaultBump`. Consider whether conventional result should be floored at `defaultBump` using `higher(conventionalBump, defaultBump)`. Deferred — current behaviour is consistent and documented.
- **Status:** Open

---

### B-001 — Dependencies: undici vulnerability in @actions/github

- **Logged:** 2026-06-04 by scaffold agent
- **Triggered by:** Story 1.1
- **Priority:** Medium
- **Description:** `@actions/github` 6.x pulls in `undici <=6.23.0` which has several HTTP-related CVEs (request smuggling, decompression DoS, WebSocket issues). `npm audit fix` cannot resolve this — requires `@actions/github` to release a new version with an updated `undici`. Monitor `@actions/github` releases and upgrade when a patched version ships. The vulnerability only affects the GitHub API client at action runtime inside GitHub's infrastructure, not user-facing traffic.
- **Status:** Open

---

### B-003 — git.ts: commitRelease called with empty files array

- **Logged:** 2026-06-04 | **Closed:** 2026-06-05
- **Resolution:** `src/git.ts` — `commitRelease` now throws `'commitRelease called with an empty files array'` immediately when `files.length === 0`. 1 new unit test.

---

### B-004 — Security: Pin GitHub Actions to exact SHAs in workflows

- **Logged:** 2026-06-04 by review agent
- **Triggered by:** Story 1.10
- **Priority:** Low
- **Description:** `codeql.yml` and `ci.yml` use major-version action pins (`@v3`, `@v4`). For highest supply-chain security, pin to exact commit SHAs (e.g. `actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af68`). OSSF Scorecard and GitHub's own hardening guide recommend SHA pinning. Low priority for a dev portfolio — address before Marketplace listing.
- **Status:** Open

---

### B-006 — config.ts: LabelMapConfig and LabelConfig are duplicate interfaces

- **Logged:** 2026-06-04 by review agent
- **Triggered by:** Story 2.2
- **Priority:** Low
- **Description:** `src/labels.ts` exports `LabelMapConfig` and `src/config.ts` exports `LabelConfig` — both are `{ major, minor, patch, none: string }`. Avoiding circular deps (config imports BumpType from labels) meant keeping them separate. Consider extracting shared types to `src/types.ts` to eliminate the duplication.
- **Status:** Open

---

## Closed Items

### B-002 — Dependencies: esbuild moderate vulnerability in vitest/vite

- **Closed:** 2026-06-04 (Epic 2 — upgraded vitest to v4.1.8 which bundles esbuild 0.25+, resolving GHSA-67mh-4wv8-2f99. Also migrated build from ncc to esbuild directly.)

---

### B-005 — Dependencies: @actions/core v3 incompatible with @vercel/ncc

- **Closed:** 2026-06-04 (Epic 2 — replaced `@vercel/ncc` with `esbuild` as the bundler. esbuild handles @actions/core v3 ESM exports correctly. Build now produces 1.7MB dist/index.js cleanly.)
