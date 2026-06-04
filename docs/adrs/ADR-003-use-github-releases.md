# ADR-003 — Create GitHub Releases

- **Status:** Accepted
- **Date:** 2026-06-04

## Context

Options: push a git tag only, or push a git tag and create a GitHub Release. GitHub Releases are visible in the repo UI, support release notes, enable download tracking, and are required for GitHub Marketplace listing.

## Decision

Create GitHub Release via `octokit.rest.repos.createRelease`. Controlled by the `create-github-release` input (default: `'true'`).

## Consequences

- Requires `contents: write` on the workflow token
- Release body is a single-line summary — full changelog is in `CHANGELOG.md`
- Disabled via `create-github-release: 'false'` for repos that only want git tags
