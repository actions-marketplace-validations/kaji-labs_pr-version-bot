# Architecture Decision Records

## ADR Index

| ID      | Title                                                       | Status   | Date       |
| ------- | ----------------------------------------------------------- | -------- | ---------- |
| ADR-001 | Runtime: TypeScript compiled to dist/index.js via ncc       | Accepted | 2026-06-04 |
| ADR-002 | Version trigger: PR labels over conventional commits        | Accepted | 2026-06-04 |
| ADR-003 | Releases: GitHub Releases API via octokit                   | Accepted | 2026-06-04 |
| ADR-004 | Module: CommonJS (not ESM) for GitHub Actions compatibility | Accepted | 2026-06-04 |

---

## ADR-001 — Runtime: TypeScript compiled to dist/index.js via ncc

- **Status:** Accepted
- **Date:** 2026-06-04
- **Context:** GitHub JavaScript actions need a bundled entry point. Options: Docker (slow, heavy), composite/bash (not testable), compiled JS (fast, standard).
- **Decision:** TypeScript source compiled to a single `dist/index.js` via `@vercel/ncc`. `dist/` committed to repo so GitHub can run it without a build step at action invocation time.
- **Consequences:** `dist/` must be rebuilt and committed whenever `src/` changes. CI enforces this with `git diff --exit-code dist/`.

---

## ADR-002 — Version trigger: PR labels over conventional commits

- **Status:** Accepted
- **Date:** 2026-06-04
- **Context:** Two main patterns for inferring version bump: PR labels or commit message conventions. Labels require explicit intent; commits are implicit.
- **Decision:** PR labels for MVP. Labels are visible in the GitHub UI, require deliberate action, and are easy to audit. Conventional commit support deferred to Epic 4.
- **Consequences:** Users must create and apply the 4 release labels in their repos.

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
- **Context:** `@vercel/ncc` and `@actions/*` packages work most reliably with CommonJS. ESM adds complexity with no benefit for this use case.
- **Decision:** `"module": "commonjs"` in tsconfig. No `"type": "module"` in package.json.
- **Consequences:** All imports use standard require-style resolution after compilation.
