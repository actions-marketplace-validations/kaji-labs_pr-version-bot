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

## Epic 5 — Slack/Discord Notifications

Send a release summary notification to Slack or Discord when a release is created.

### Story 5.1 — Slack webhook notification

> As a team using Slack, I want the action to post a release message to our Slack channel automatically, so that the team is notified when a new version ships.

**AC:**

- [ ] New input `slack-webhook-url` — when provided, a POST is sent to the URL after a successful release
- [ ] Slack message payload: `{ "text": "🚀 Released {tag}: {prTitle} (#{prNumber})" }`
- [ ] Message is NOT sent when `skipped=true` (release:none) or dry-run mode
- [ ] If the webhook request fails (non-2xx or network error), action logs a warning and continues — does not fail the release
- [ ] New `src/notify.ts` module exports `sendSlackNotification(webhookUrl, message)` — uses Node.js `https` (no new runtime deps)
- [ ] Unit tests: success post, non-2xx response (warning, no throw), `skipped=true` (no post sent), dry-run (no post sent)

**SC:**

- [ ] Webhook URL never logged — only logged as `[slack webhook]` if debug needed
- [ ] No token or credentials stored beyond the action run
- [ ] Uses HTTPS only — HTTP webhook URLs rejected with a descriptive error

---

### Story 5.2 — Discord webhook notification

> As a team using Discord, I want the action to post a release embed to our Discord server, so that the team is notified when a new version ships.

**AC:**

- [ ] New input `discord-webhook-url` — when provided, a POST is sent after a successful release
- [ ] Discord payload: `{ "embeds": [{ "title": "Released {tag}", "description": "{prTitle} (#{prNumber})", "color": 5763719 }] }` (green colour `0x57C687`)
- [ ] Message is NOT sent when `skipped=true` or dry-run mode
- [ ] Failure handling same as Slack: log warning, continue release
- [ ] `src/notify.ts` exports `sendDiscordNotification(webhookUrl, message)` alongside Slack function
- [ ] Unit tests: success post, non-2xx (warning, no throw), skipped/dry-run (no post)

**SC:**

- [ ] Webhook URL never logged
- [ ] HTTPS only — HTTP URLs rejected

---

### Story 5.3 — Config file support and notification template

> As a user, I want to configure notification webhooks in `.versionbot.yml` and customise the message format, so that I don't have to put URLs in my workflow file.

**AC:**

- [ ] `.versionbot.yml` supports `slackWebhookUrl` and `discordWebhookUrl` fields
- [ ] New input `notification-template` (default: `'🚀 Released {tag}: {prTitle} (#{prNumber})'`) used for both Slack text and Discord description
- [ ] `.versionbot.yml` supports `notificationTemplate` field
- [ ] `src/config.ts` updated: `BotConfig` and `ResolvedConfig` include all three new fields
- [ ] Workflow inputs override config file values
- [ ] Unit tests cover: custom template, webhook from config file, input override

**SC:**

- [ ] Webhook URLs in config file are never committed to the repo by the action
- [ ] Template placeholders `{tag}`, `{prTitle}`, `{prNumber}`, `{bump}` supported and validated

---

### Story 5.4 — Docs and examples for notifications

> As a user, I want clear documentation for the notification feature so I can set it up quickly.

**AC:**

- [ ] `docs/configuration.md` updated with `slack-webhook-url`, `discord-webhook-url`, `notification-template` inputs and config file fields
- [ ] `docs/troubleshooting.md` updated with notification failure troubleshooting
- [ ] `examples/with-slack-notifications.yml` created
- [ ] `examples/with-discord-notifications.yml` created
- [ ] `.versionbot.yml.example` updated with notification fields (commented out)

**SC:**

- [ ] No real webhook URLs in examples
- [ ] Examples show storing URL in GitHub secrets: `${{ secrets.SLACK_WEBHOOK_URL }}`

---

## Epic 6 — Monorepo Support

> Stories TBD after Epic 5 ships.

## Epic 7 — Pre-release / RC Versions

> Stories TBD after Epic 6 ships.

## Epic 8 — GitHub Marketplace Release

> Stories TBD after Epic 7 ships.
