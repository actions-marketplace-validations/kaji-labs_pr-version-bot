# Backlog

## Open Items

### B-001 — Dependencies: undici vulnerability in @actions/github

- **Logged:** 2026-06-04 by scaffold agent
- **Triggered by:** Story 1.1
- **Priority:** Medium
- **Description:** `@actions/github` 6.x pulls in `undici <=6.23.0` which has several HTTP-related CVEs (request smuggling, decompression DoS, WebSocket issues). `npm audit fix` cannot resolve this — requires `@actions/github` to release a new version with an updated `undici`. Monitor `@actions/github` releases and upgrade when a patched version ships. The vulnerability only affects the GitHub API client at action runtime inside GitHub's infrastructure, not user-facing traffic.
- **Status:** Open

---

### B-003 — git.ts: commitRelease called with empty files array

- **Logged:** 2026-06-04 by review agent
- **Triggered by:** Story 1.6
- **Priority:** Low
- **Description:** `commitRelease([])` would run `git commit -m ...` with nothing staged. Git would error with "nothing to commit". Internal function — callers are responsible for passing non-empty file lists. Consider adding a guard: `if (files.length === 0) return;` or throw explicitly. Not a risk in current usage since index.ts always passes `[versionFile, changelogFile]`.
- **Status:** Open

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
