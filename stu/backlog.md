# Backlog

## Open Items

### B-001 — Dependencies: undici vulnerability in @actions/github

- **Logged:** 2026-06-04 by scaffold agent
- **Triggered by:** Story 1.1
- **Priority:** Medium
- **Description:** `@actions/github` 6.x pulls in `undici <=6.23.0` which has several HTTP-related CVEs (request smuggling, decompression DoS, WebSocket issues). `npm audit fix` cannot resolve this — requires `@actions/github` to release a new version with an updated `undici`. Monitor `@actions/github` releases and upgrade when a patched version ships. The vulnerability only affects the GitHub API client at action runtime inside GitHub's infrastructure, not user-facing traffic.
- **Status:** Open

---

### B-005 — Dependencies: @actions/core v3 incompatible with @vercel/ncc

- **Logged:** 2026-06-04 by dependency upgrade
- **Triggered by:** Dependabot PR #7
- **Priority:** Low
- **Description:** `@actions/core` v3.x uses ESM exports which `@vercel/ncc` (0.38.x) cannot bundle — fails with "Package path . is not exported". Pinned at `^1.11.1`. Revisit when `@vercel/ncc` adds full ESM package support, or when we migrate the build to a bundler that handles ESM (e.g. esbuild directly). No security vulnerability in v1.x — this is purely a version upgrade.
- **Status:** Open

---

### B-004 — Security: Pin GitHub Actions to exact SHAs in workflows

- **Logged:** 2026-06-04 by review agent
- **Triggered by:** Story 1.10
- **Priority:** Low
- **Description:** `codeql.yml` and `ci.yml` use major-version action pins (`@v3`, `@v4`). For highest supply-chain security, pin to exact commit SHAs (e.g. `actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af68`). OSSF Scorecard and GitHub's own hardening guide recommend SHA pinning. Low priority for a dev portfolio — address before Marketplace listing.
- **Status:** Open

---

### B-003 — git.ts: commitRelease called with empty files array

- **Logged:** 2026-06-04 by review agent
- **Triggered by:** Story 1.6
- **Priority:** Low
- **Description:** `commitRelease([])` would run `git commit -m ...` with nothing staged. Git would error with "nothing to commit". Internal function — callers are responsible for passing non-empty file lists. Consider adding a guard: `if (files.length === 0) return;` or throw explicitly. Not a risk in current usage since index.ts always passes `[versionFile, changelogFile]`.
- **Status:** Open

---

### B-002 — Dependencies: esbuild moderate vulnerability in vitest/vite

- **Logged:** 2026-06-04 by scaffold agent
- **Triggered by:** Story 1.1
- **Priority:** Low
- **Description:** `esbuild <=0.24.2` (via vitest/vite) has a moderate GHSA-67mh-4wv8-2f99 vulnerability allowing websites to send requests to the dev server. Fix requires upgrading vitest to v4 (breaking change). This is dev-only — the esbuild dev server is never exposed in CI or production. Revisit when vitest v4 API stabilises and migration guide is available.
- **Status:** Open

---

## Closed Items

<!-- Resolved items moved here (never deleted) -->
