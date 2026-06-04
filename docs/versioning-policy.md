# Versioning Policy

This action and the projects that use it follow [Semantic Versioning 2.0.0](https://semver.org/).

## Bump types

| Type | When to use | Example |
|---|---|---|
| `major` | Breaking change — existing workflows may need updating | `1.2.3` → `2.0.0` |
| `minor` | New feature, backwards-compatible | `1.2.3` → `1.3.0` |
| `patch` | Bug fix, backwards-compatible | `1.2.3` → `1.2.4` |
| `none` | No release needed (docs, CI, chore PRs) | version unchanged |

## Rules

- Version is always stored as a bare semver string in `VERSION.md` — no `v` prefix, no extra content
- Version is always treated as a string — never parsed as a float
- `dist/index.js` must be rebuilt and committed whenever `src/` changes

## When in doubt

Use `patch` for fixes, `minor` for features, `major` for anything that changes how callers use the action (renamed inputs, removed outputs, changed defaults).
