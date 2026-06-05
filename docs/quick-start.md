# Quick Start

Get up and running in under 5 minutes.

> **GitHub Marketplace:** Search for **PR Version Bot** on the [GitHub Marketplace](https://github.com/marketplace) to add it to your repository in one click.

## 1. Add a VERSION.md file

Create `VERSION.md` in the root of your repo:

```
1.0.0
```

## 2. Add a CHANGELOG file

Create `CHANGELOG.md`:

```markdown
# Changelog
```

## 3. Create release labels

In your GitHub repo, go to **Issues → Labels** and create:

- `release:major`
- `release:minor`
- `release:patch`
- `release:none`

Optionally also create pre-release labels:

- `release:alpha`
- `release:beta`
- `release:rc`

See [labels.md](labels.md) for the full labels reference, including pre-release lifecycle rules.

## 4. Add the workflow

Create `.github/workflows/release.yml`:

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
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: kaji-labs/pr-version-bot@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

## 5. Merge a PR

Apply a `release:patch` label to your next PR and merge it. The action will:

1. Read the label
2. Bump `VERSION.md` from `1.0.0` to `1.0.1`
3. Prepend a `CHANGELOG.md` entry
4. Commit both files
5. Create tag `v1.0.1`
6. Publish a GitHub Release

## Version badge

Add a Shields.io-powered version badge to your README by enabling `generate-badge`:

```yaml
- uses: kaji-labs/pr-version-bot@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    generate-badge: 'true'
```

This writes `.badges/version.json` after each release. Use the following Shields.io endpoint URL in your README:

```markdown
![Version](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/YOUR_ORG/YOUR_REPO/main/.badges/version.json)
```

Replace `YOUR_ORG/YOUR_REPO` with your repository's full name.

## README auto-sync

Enable auto-update of your README on each release by adding markers and enabling `update-readme`:

1. Add these markers to your README where you want the version block:

```markdown
<!-- VERSIONBOT:START -->
<!-- VERSIONBOT:END -->
```

2. Enable the feature in your workflow:

```yaml
- uses: kaji-labs/pr-version-bot@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    update-readme: 'true'
```

The action will replace the content between the markers with an auto-generated block showing the current version and install instructions.

## Branch protection

If your repository has branch protection rules that block direct pushes, the action will fail with a clear error message. You can either exempt `github-actions[bot]` from push restrictions, or enable release PR mode by adding `use-release-pr: 'true'` to your workflow.

See [docs/troubleshooting.md](troubleshooting.md#branch-protection-blocks-push) for full instructions.

## Next steps

- [Configuration reference](configuration.md) — every input, output, and `.versionbot.yml` field
- [Labels reference](labels.md) — pre-release labels, PR template checkboxes, conventional commits
- [Versioning policy](versioning-policy.md) — stable and pre-release lifecycle
- [Troubleshooting](troubleshooting.md) — common error messages and fixes
- [Architecture](architecture.md) — module overview and design decisions
