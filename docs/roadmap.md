# Roadmap

## v1.0.0 — MVP ✅

Label-driven semver bumps, CHANGELOG.md updates, git tags, GitHub Releases, dry-run mode, CI/CD pipeline, CodeQL scanning, Dependabot.

## v1.1.0 — Config file

Support `.versionbot.yml` for per-repo configuration without workflow changes.

```yaml
versionFile: VERSION.md
changelogFile: CHANGELOG.md
defaultBump: patch
labels:
  major: release:major
  minor: release:minor
  patch: release:patch
  none: release:none
```

## v1.2.0 — package.json sync

Optionally sync the `version` field in `package.json` alongside `VERSION.md`.

## v1.3.0 — Conventional commits fallback

Use commit message prefixes (`feat:`, `fix:`, `BREAKING CHANGE:`) to infer bump type when no release label is present.

## v1.4.0 — Slack / Discord notifications

Post a release summary to a configured webhook URL after each release.

## v2.0.0 — Monorepo support ✅

Support multiple independently-versioned packages. Configure via `packages` input or `.versionbot.yml`.

## v2.1.0 — Pre-release / RC versions ✅

Pre-release versioning via `release:alpha`, `release:beta`, `release:rc` labels.
Channel promotion (`alpha.1` → `alpha.2`) and stable promotion (`rc.3` → `1.2.4`).

## v3.0.0 — GitHub Marketplace

Public Marketplace listing with verified branding and usage telemetry.
