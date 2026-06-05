# Versioning Policy

This action and the projects that use it follow [Semantic Versioning 2.0.0](https://semver.org/).

## Bump types

| Type    | When to use                                            | Example           |
| ------- | ------------------------------------------------------ | ----------------- |
| `major` | Breaking change — existing workflows may need updating | `1.2.3` → `2.0.0` |
| `minor` | New feature, backwards-compatible                      | `1.2.3` → `1.3.0` |
| `patch` | Bug fix, backwards-compatible                          | `1.2.3` → `1.2.4` |
| `none`  | No release needed (docs, CI, chore PRs)                | version unchanged |

## Pre-release versions

Pre-release versions follow the format `MAJOR.MINOR.PATCH-CHANNEL.N` where `CHANNEL` is `alpha`, `beta`, or `rc` and `N` starts at `1`.

### Version lifecycle

```
1.2.3 (stable)
  → 1.2.4-alpha.1  (release:alpha — begin testing)
  → 1.2.4-alpha.2  (release:alpha — another alpha)
  → 1.2.4-beta.1   (release:beta — channel switch)
  → 1.2.4-rc.1     (release:rc — release candidate)
  → 1.2.4          (release:patch — promote to stable)
```

### Rules

- Pre-release versions are published as GitHub Releases and git tags
- Pre-release versions do NOT trigger the major version floating tag update (e.g. `v1` stays at the last stable release)
- `release:none` always skips — even when combined with a pre-release label

## Rules

- Version is always stored as a bare semver string in `VERSION.md` — no `v` prefix, no extra content
- Version is always treated as a string — never parsed as a float
- `dist/index.js` must be rebuilt and committed whenever `src/` changes

## Major version floating tags

After each stable release the action automatically force-pushes a floating major version tag (e.g. `v1`) so callers can pin to a major version without needing to update their workflows on every release:

```yaml
- uses: kaji-labs/pr-version-bot@v1 # always the latest v1.x.x
- uses: kaji-labs/pr-version-bot@v1.2.3 # pinned to a specific patch
```

Pre-release tags (`v1.2.3-rc.1`) do **not** move the floating tag — `v1` always points to the latest stable release in that major line.

## When in doubt

Use `patch` for fixes, `minor` for features, `major` for anything that changes how callers use the action (renamed inputs, removed outputs, changed defaults).
