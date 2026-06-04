# Quick Start

Get up and running in under 5 minutes.

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

      - uses: YOUR_ORG/pr-version-bot@v1
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
