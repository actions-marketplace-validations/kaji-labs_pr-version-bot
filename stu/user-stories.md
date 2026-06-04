# User Stories

## Epic 1 — MVP

> All 13 stories delivered. Moved to completed-user-stories.md.

---

## Epic 2 — Config File Support (.versionbot.yml)

Allow per-repo configuration via a `.versionbot.yml` file, so users can customise the action without touching their workflow YAML.

### Story 2.1 — Config file schema and loader

> As a user, I want to configure the action via a `.versionbot.yml` file, so that I don't have to pass every option as a workflow input.

**AC:**

- [ ] Action reads `.versionbot.yml` from the repo root if it exists
- [ ] Config file supports all 9 non-token inputs: `versionFile`, `changelogFile`, `defaultBump`, `tagPrefix`, `createGithubRelease`, `failOnMultipleLabels`, `dryRun`, `targetBranch`, `commitMessageTemplate`
- [ ] Workflow inputs override config file values (inputs take precedence)
- [ ] Config file is optional — action works identically when file is absent
- [ ] Invalid config file (bad YAML, unknown keys) throws a descriptive error
- [ ] `src/config.ts` module handles loading and merging
- [ ] Unit tests cover: file present, file absent, partial config, invalid YAML, input override

**SC:**

- [ ] Config file never logged in full (could contain sensitive paths)
- [ ] No secrets or tokens accepted in config file (github-token must stay as workflow input)

---

### Story 2.2 — Label name customisation

> As a user, I want to customise the release label names, so that I can use my own label conventions.

**AC:**

- [ ] `.versionbot.yml` supports a `labels` block:
  ```yaml
  labels:
    major: breaking-change
    minor: feature
    patch: bugfix
    none: no-release
  ```
- [ ] Custom label names work end-to-end (detectBump uses configured names)
- [ ] Default label names (`release:major` etc.) used when `labels` block absent
- [ ] Unit tests cover custom labels, partial labels block, default fallback

**SC:**

- [ ] Label names validated as non-empty strings

---

### Story 2.3 — Config file docs and examples

> As a user, I want documentation and an example config file, so that I can adopt config-file support quickly.

**AC:**

- [ ] `docs/configuration.md` updated with config file section
- [ ] `.versionbot.yml.example` added to repo root showing all options
- [ ] `examples/with-config-file.yml` workflow example added
- [ ] `docs/troubleshooting.md` updated with config file error cases

**SC:**

- [ ] Example config file contains no real tokens or org names

---

## Epic 3 — package.json Version Sync

> Stories TBD after Epic 2 ships.

## Epic 4 — Conventional Commits Fallback

> Stories TBD after Epic 3 ships.

## Epic 5 — Slack/Discord Notifications

> Stories TBD after Epic 4 ships.

## Epic 6 — Monorepo Support

> Stories TBD after Epic 5 ships.

## Epic 7 — Pre-release / RC Versions

> Stories TBD after Epic 6 ships.

## Epic 8 — GitHub Marketplace Release

> Stories TBD after Epic 7 ships.
