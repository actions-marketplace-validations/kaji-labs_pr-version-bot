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

Use commit message prefixes to infer the bump type when no release label is present on the merged PR.

### Story 4.1 — Detect bump type from conventional commits

> As a user, I want the action to read commit messages and determine the version bump automatically, so that I don't need to apply a label to every PR.

**AC:**

- [ ] When no `release:*` label is on the PR and `default-bump` is `none`, action scans commit messages in the merged PR
- [ ] `feat:` or `feat(scope):` prefix → `minor` bump
- [ ] `fix:` or `fix(scope):` prefix → `patch` bump
- [ ] `BREAKING CHANGE:` in commit body or `feat!:` / `fix!:` → `major` bump
- [ ] Multiple commits: highest bump type wins (`major` > `minor` > `patch`)
- [ ] No matching commit prefix → falls back to configured `default-bump` (which may be `none` to skip)
- [ ] New `src/conventional.ts` module exports `detectBumpFromCommits(commits: string[]): BumpType | null`
- [ ] Uses GitHub API (`octokit.rest.pulls.listCommits`) to fetch PR commits
- [ ] New input `use-conventional-commits` (default: `'false'`) enables this behaviour
- [ ] Unit tests: feat → minor, fix → patch, breaking change → major, multiple commits highest wins, no match → null

**SC:**

- [ ] Commit messages never logged in full — only bump result logged
- [ ] Feature is opt-in — no behaviour change for existing users

---

### Story 4.2 — Config file support for conventional commits

> As a user, I want to enable conventional commits detection in `.versionbot.yml`, so that I can configure it without touching my workflow.

**AC:**

- [ ] `.versionbot.yml` supports `useConventionalCommits: true/false`
- [ ] Workflow input `use-conventional-commits` overrides config file value
- [ ] `src/config.ts` updated: `BotConfig` and `ResolvedConfig` include `useConventionalCommits: boolean`
- [ ] `mergeConfig` handles new field correctly (default: `false`)
- [ ] Unit tests for config file path and input override

**SC:**

- [ ] Default is `false` — no behaviour change for existing users

---

### Story 4.3 — Docs and examples for conventional commits

> As a user, I want documentation for the conventional commits feature so I can adopt it quickly.

**AC:**

- [ ] `docs/configuration.md` updated with `use-conventional-commits` input and `useConventionalCommits` config field
- [ ] `docs/troubleshooting.md` updated with conventional commits troubleshooting (no commits matched, API rate limit)
- [ ] `examples/conventional-commits.yml` created showing usage with `default-bump: none`
- [ ] `docs/labels.md` updated to note that labels take precedence over commit scanning

**SC:**

- [ ] No real tokens in examples

---

## Epic 4 — Conventional Commits Fallback

> All 3 stories delivered. Moved to completed-user-stories.md.

---

## Epic 5 — Slack/Discord Notifications

> All 4 stories delivered. Moved to completed-user-stories.md.

## Epic 6 — Monorepo Support

> Stories TBD after Epic 5 ships.

## Epic 7 — Pre-release / RC Versions

> Stories TBD after Epic 6 ships.

## Epic 8 — GitHub Marketplace Release

> Stories TBD after Epic 7 ships.
