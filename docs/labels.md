# Labels Reference

PR Version Bot reads the following labels from merged pull requests.

## Required labels

Create these labels in your GitHub repository before using the action.

| Label           | Colour             | Bump            | Example           |
| --------------- | ------------------ | --------------- | ----------------- |
| `release:major` | `#d93f0b` (red)    | Breaking change | `1.2.3` → `2.0.0` |
| `release:minor` | `#0075ca` (blue)   | New feature     | `1.2.3` → `1.3.0` |
| `release:patch` | `#e4e669` (yellow) | Bug fix         | `1.2.3` → `1.2.4` |
| `release:none`  | `#cfd3d7` (grey)   | No release      | version unchanged |

## Behaviour

- **One release label** — bump type is determined by the label
- **No release label** — uses `default-bump` input (default: `patch`)
- **Multiple release labels** — fails with an error when `fail-on-multiple-labels: 'true'` (default)
- **Multiple release labels + `fail-on-multiple-labels: 'false'`** — first matching label wins

## Creating labels via GitHub CLI

```bash
gh label create "release:major" --color "d93f0b" --description "Breaking change"
gh label create "release:minor" --color "0075ca" --description "New feature"
gh label create "release:patch" --color "e4e669" --description "Bug fix"
gh label create "release:none"  --color "cfd3d7" --description "Skip release"
```
