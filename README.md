# PR Version Bot

[![CI](https://github.com/kaji-labs/pr-version-bot/actions/workflows/ci.yml/badge.svg)](https://github.com/kaji-labs/pr-version-bot/actions/workflows/ci.yml)
[![CodeQL](https://github.com/kaji-labs/pr-version-bot/actions/workflows/codeql.yml/badge.svg)](https://github.com/kaji-labs/pr-version-bot/actions/workflows/codeql.yml)
[![Version](https://img.shields.io/badge/version-v0.9.1-orange)](https://github.com/kaji-labs/pr-version-bot/releases)
[![License: Source-Available](https://img.shields.io/badge/License-Source--Available-blue.svg)](LICENSE)

> Reusable GitHub Action for automatic semantic versioning from merged pull requests.

Automatically bumps your semver, updates `CHANGELOG.md`, creates a git tag, and publishes a GitHub Release — triggered by a label on your PR.

## How it works

1. Apply a `release:minor` label to your PR
2. Merge it
3. The action reads the label, bumps `VERSION.md`, prepends a `CHANGELOG.md` entry, commits both, creates a `v1.1.0` tag, and publishes a GitHub Release

## Quick start

See [docs/quick-start.md](docs/quick-start.md) — full setup in under 5 minutes.

## Required labels

Create these labels in your repository:

| Label           | Effect                 |
| --------------- | ---------------------- |
| `release:major` | `1.0.0` → `2.0.0`      |
| `release:minor` | `1.0.0` → `1.1.0`      |
| `release:patch` | `1.0.0` → `1.0.1`      |
| `release:none`  | Skips release entirely |

## Pre-release labels (optional)

| Label           | Effect                        | Example                   |
| --------------- | ----------------------------- | ------------------------- |
| `release:alpha` | Alpha pre-release             | `1.0.0` → `1.0.1-alpha.1` |
| `release:beta`  | Beta pre-release              | `1.0.0` → `1.0.1-beta.1`  |
| `release:rc`    | Release candidate pre-release | `1.0.0` → `1.0.1-rc.1`    |

See [docs/labels.md](docs/labels.md) for full pre-release lifecycle rules.

## Install

<!-- VERSIONBOT:START -->

[![Version](https://img.shields.io/badge/version-v0.9.1-orange)](https://github.com/kaji-labs/pr-version-bot/releases)

> Current stable release: **v0.9.1**

**Pinned version (recommended):**

```yaml
- uses: kaji-labs/pr-version-bot@v0.9.1
```

**Major version alias:**

```yaml
- uses: kaji-labs/pr-version-bot@v0
```

<!-- VERSIONBOT:END -->

## Example workflow

```yaml
name: Release

on:
  pull_request:
    types: [closed]
    branches: [main]

permissions:
  contents: write
  pull-requests: read

jobs:
  release:
    runs-on: ubuntu-latest
    if: github.event.pull_request.merged == true
    steps:
      - uses: actions/checkout@v6
        with:
          fetch-depth: 0

      - uses: kaji-labs/pr-version-bot@v0.9.1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

## Inputs

| Input                      | Default                                        | Description                                                        |
| -------------------------- | ---------------------------------------------- | ------------------------------------------------------------------ |
| `github-token`             | `${{ github.token }}`                          | GitHub token for API access                                        |
| `version-file`             | `VERSION.md`                                   | Path to semver file                                                |
| `changelog-file`           | `CHANGELOG.md`                                 | Path to changelog                                                  |
| `default-bump`             | `patch`                                        | Bump type when no label present                                    |
| `tag-prefix`               | `v`                                            | Git tag prefix                                                     |
| `create-github-release`    | `true`                                         | Create a GitHub Release                                            |
| `fail-on-multiple-labels`  | `true`                                         | Fail if multiple release labels found                              |
| `dry-run`                  | `false`                                        | Run without writing changes                                        |
| `target-branch`            | `main`                                         | Branch to push release commit to                                   |
| `commit-message-template`  | `chore(release): {tag}`                        | Release commit message                                             |
| `sync-package-json`        | `false`                                        | Sync `version` field in `package.json`                             |
| `use-conventional-commits` | `false`                                        | Infer bump from commit messages when no label is present           |
| `slack-webhook-url`        | `''`                                           | Slack incoming webhook URL for release notifications               |
| `discord-webhook-url`      | `''`                                           | Discord webhook URL for release notifications                      |
| `notification-template`    | `'🚀 Released {tag}: {prTitle} (#{prNumber})'` | Message template for Slack/Discord notifications                   |
| `packages`                 | `''`                                           | Comma-separated package paths for monorepo support                 |
| `use-pr-template-labels`   | `false`                                        | Detect bump type from checked PR body checkboxes                   |
| `use-release-pr`           | `false`                                        | Open a release PR instead of pushing directly to target branch     |
| `tag-on-release-pr`        | `true`                                         | Create git tag immediately on the release branch (release PR mode) |
| `generate-badge`           | `false`                                        | Write a Shields.io badge JSON after each release                   |
| `badge-color`              | `orange`                                       | Color for the version badge                                        |
| `badge-file`               | `.badges/version.json`                         | Path where badge JSON is written                                   |
| `update-readme`            | `false`                                        | Update VERSIONBOT block in README on each release                  |
| `readme-file`              | `README.md`                                    | Path to the README file to update                                  |
| `readme-start-marker`      | `<!-- VERSIONBOT:START -->`                    | Start marker for the README block                                  |
| `readme-end-marker`        | `<!-- VERSIONBOT:END -->`                      | End marker for the README block                                    |

Full documentation for every input: [docs/configuration.md](docs/configuration.md)

## Outputs

| Output           | Description                                                    |
| ---------------- | -------------------------------------------------------------- |
| `version`        | New version e.g. `1.2.3`                                       |
| `tag`            | Created tag e.g. `v1.2.3`                                      |
| `bump`           | `major`, `minor`, `patch`, or `none`                           |
| `skipped`        | `true` if release was skipped                                  |
| `release-pr-url` | URL of the release PR (only set when `use-release-pr` is true) |

## Documentation

- [Quick Start](docs/quick-start.md)
- [Configuration](docs/configuration.md)
- [Labels Reference](docs/labels.md)
- [Architecture](docs/architecture.md)
- [Roadmap](docs/roadmap.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Versioning Policy](docs/versioning-policy.md)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
