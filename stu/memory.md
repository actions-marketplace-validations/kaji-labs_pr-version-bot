# Architecture Decision Records

## ADR Index

| ID      | Title                                                               | Status     | Date       |
| ------- | ------------------------------------------------------------------- | ---------- | ---------- |
| ADR-001 | Runtime: TypeScript bundled to dist/index.js via esbuild            | Superseded | 2026-06-04 |
| ADR-002 | Version trigger: PR labels over conventional commits                | Accepted   | 2026-06-04 |
| ADR-003 | Releases: GitHub Releases API via octokit                           | Accepted   | 2026-06-04 |
| ADR-004 | Module: CommonJS (not ESM) for GitHub Actions compatibility         | Accepted   | 2026-06-04 |
| ADR-005 | Bundler: esbuild over @vercel/ncc                                   | Accepted   | 2026-06-04 |
| ADR-006 | Configuration: optional .versionbot.yml file with input precedence  | Accepted   | 2026-06-04 |
| ADR-007 | License: Source-Available No-Resale over MIT                        | Accepted   | 2026-06-04 |
| ADR-008 | package.json sync: in-place update preserving all fields            | Accepted   | 2026-06-04 |
| ADR-009 | Conventional commits: scan on no-label PRs, labels always win       | Accepted   | 2026-06-04 |
| ADR-010 | Notifications: built-in https, HTTPS-only, non-fatal on failure     | Accepted   | 2026-06-04 |
| ADR-011 | Monorepo: shared bump type, per-package version files               | Accepted   | 2026-06-04 |
| ADR-012 | Pre-release: 1-based numbering, manual construction over semver.inc | Accepted   | 2026-06-04 |

---

## ADR-001 — Runtime: TypeScript bundled to dist/index.js

- **Status:** Superseded by ADR-005
- **Date:** 2026-06-04
- **Context:** GitHub JavaScript actions need a bundled entry point. Options: Docker (slow, heavy), composite/bash (not testable), compiled JS (fast, standard).
- **Decision:** TypeScript source compiled to a single `dist/index.js`. `dist/` committed to repo so GitHub can run it without a build step at action invocation time.
- **Consequences:** `dist/` must be rebuilt and committed whenever `src/` changes. Originally used `@vercel/ncc`; superseded by esbuild in Epic 2 (see ADR-005).

---

## ADR-002 — Version trigger: PR labels over conventional commits

- **Status:** Accepted
- **Date:** 2026-06-04
- **Context:** Two main patterns for inferring version bump: PR labels or commit message conventions. Labels require explicit intent; commits are implicit.
- **Decision:** PR labels for MVP. Labels are visible in the GitHub UI, require deliberate action, and are easy to audit. Conventional commit support deferred to Epic 4.
- **Consequences:** Users must create and apply the 4 release labels in their repos. Label names are now configurable via `.versionbot.yml` (Epic 2).

---

## ADR-003 — Releases: GitHub Releases API via octokit

- **Status:** Accepted
- **Date:** 2026-06-04
- **Context:** Could push a git tag only, or also create a GitHub Release.
- **Decision:** Create GitHub Release via `octokit.rest.repos.createRelease`. Controllable via `create-github-release` input.
- **Consequences:** Requires `contents: write` permission on the workflow token.

---

## ADR-004 — Module: CommonJS (not ESM)

- **Status:** Accepted
- **Date:** 2026-06-04
- **Context:** `@actions/*` packages and bundlers work most reliably with CommonJS output. ESM adds complexity with no benefit for this use case.
- **Decision:** `"module": "commonjs"` in tsconfig. No `"type": "module"` in package.json.
- **Consequences:** All imports use standard require-style resolution after compilation. esbuild outputs CJS via `--format=cjs`.

---

## ADR-005 — Bundler: esbuild over @vercel/ncc

- **Status:** Accepted
- **Date:** 2026-06-04
- **Context:** `@vercel/ncc` 0.38.x cannot bundle `@actions/core` v3 which uses ESM exports (`exports` field). Build failed with "Package path . is not exported". Supersedes ADR-001.
- **Decision:** Replace `@vercel/ncc` with `esbuild --bundle --platform=node --target=node20 --format=cjs`. esbuild handles ESM packages correctly, is faster, and is already a transitive dependency via vitest.
- **Consequences:** `dist/index.js` is now ~1.7MB (was ~1.1MB). No source map committed by default (esbuild produces one but it is gitignored). Build script is simpler. Resolves B-005.

---

## ADR-006 — Configuration: optional .versionbot.yml with input precedence

- **Status:** Accepted
- **Date:** 2026-06-04
- **Context:** Users wanted to configure the action without editing workflow YAML on every repo. Options: config file, environment variables, separate setup step.
- **Decision:** Optional `.versionbot.yml` in the repo root, parsed with `js-yaml`. Precedence: workflow inputs → config file → built-in defaults. Token never accepted in config file.
- **Consequences:** New `src/config.ts` module. All action settings (except `github-token`) can be set in the config file. Label names are also configurable via `labels:` block.

---

## ADR-007 — License: Source-Available No-Resale over MIT

- **Status:** Accepted
- **Date:** 2026-06-04
- **Context:** MIT allows anyone to sell or commercialise the tool without restriction. The copyright holder wants to retain commercial rights while keeping the tool freely usable.
- **Decision:** Custom Source-Available No-Resale License. Free for personal, educational, open-source, and internal business use. Selling, repackaging, or hosting as a paid product requires written permission from Rashay Daya.
- **Consequences:** Not OSI-approved. Cannot be listed on GitHub Marketplace as "open source". CODEOWNERS restricts LICENSE changes to `@Rashay01`.

---

## ADR-008 — package.json sync: in-place update preserving all fields

- **Status:** Accepted
- **Date:** 2026-06-04
- **Context:** When syncing `package.json`, options were: (1) update only the `version` field in-place, (2) regenerate the file from scratch, (3) use `npm version` CLI. Option 1 preserves formatting intent and field order. Option 2 loses comments and ordering. Option 3 adds a dependency on npm being available.
- **Decision:** Parse JSON, update only the `version` key, re-serialise with `JSON.stringify(pkg, null, 2) + '\n'`. Preserves all existing fields. Feature is opt-in (`sync-package-json: 'false'` default).
- **Consequences:** File ordering and key order preserved. JSON comments (non-standard) are lost on write. Missing `package.json` logs a warning and skips gracefully — does not fail the release.

---

## ADR-009 — Conventional commits: scan on no-label PRs, labels always win

- **Status:** Accepted
- **Date:** 2026-06-04
- **Context:** Conventional commit detection needs a trigger condition. Options: always scan commits, scan when no label, only scan when explicitly enabled.
- **Decision:** Scan only when `useConventionalCommits: true` AND the PR has zero release labels. Labels always take precedence — this preserves the existing label-driven workflow for users who mix approaches. Opt-in default (`false`) ensures no behaviour change for existing users.
- **Consequences:** Users relying purely on conventional commits must set `default-bump: none` to avoid falling back to patch. Documented in `examples/conventional-commits.yml`.

---

## ADR-010 — Notifications: built-in https, HTTPS-only, non-fatal on failure

- **Status:** Accepted
- **Date:** 2026-06-04
- **Context:** Webhook notifications need an HTTP client. Options: (1) add a library like `node-fetch` or `axios`, (2) use Node.js built-in `https`, (3) use `@actions/http-client`. Adding a library increases bundle size and attack surface. `@actions/http-client` pulls in `undici` (already a vulnerability). Built-in `https` requires more code but has no deps.
- **Decision:** Use Node.js built-in `https`. Enforce HTTPS-only (reject `http://` URLs at call time). Treat non-2xx responses as non-fatal warnings — the release is already published, notification failure should not roll it back.
- **Consequences:** Webhook URLs must start with `https://`. Failures log a warning with the status code but do not expose the URL. No new runtime dependencies.

---

## ADR-011 — Monorepo: shared bump type, per-package version files

- **Status:** Accepted
- **Date:** 2026-06-04
- **Context:** Monorepo versioning options: (1) single shared version for all packages, (2) independent per-package versions bumped by the same bump type, (3) per-package labels with different bump types per package.
- **Decision:** Option 2 — each package has its own `VERSION.md` and `CHANGELOG.md`, but all packages are bumped by the same bump type from the PR label. The first package's version is used as the canonical version for the git tag and release name.
- **Consequences:** All packages in a mono-bump release are kept in version lockstep. Per-package independent bumping (e.g. api gets minor, web gets patch) is not supported — deferred to a future story. Path traversal is explicitly blocked at validation time.

---

## ADR-012 — Pre-release: 1-based numbering, manual construction over semver.inc

- **Status:** Accepted
- **Date:** 2026-06-04
- **Context:** semver.inc with 'prerelease' identifier produces `.0` suffix (e.g. `1.2.4-alpha.0`). The stories specify 1-based (`alpha.1`). semver.inc also handles channel switching inconsistently.
- **Decision:** Manually construct pre-release versions in `bumpPrerelease`: extract major/minor/patch from semver.parse, compute the new version string directly. Same-channel increments counter+1; different-channel or stable→prerelease starts at 1. release:none always wins — checked before failOnMultiple and before returning any label result.
- **Consequences:** Pre-release format is always `X.Y.Z-channel.N` where N ≥ 1. No `.0` versions ever published. Switching channels keeps the same patch base (e.g. `1.2.4-alpha.3` → `1.2.4-beta.1`, not `1.2.5-beta.1`).
