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

## Pre-release labels

Pre-release labels publish a version with a channel suffix, useful for alpha/beta/RC testing before a stable release.

| Label           | Effect            | Example                   |
| --------------- | ----------------- | ------------------------- |
| `release:alpha` | Pre-release alpha | `1.2.3` → `1.2.4-alpha.1` |
| `release:beta`  | Pre-release beta  | `1.2.3` → `1.2.4-beta.1`  |
| `release:rc`    | Release candidate | `1.2.3` → `1.2.4-rc.1`    |

**Incrementing within a channel:** If the current version is already a pre-release in the same channel, the counter increments:
`1.2.4-alpha.1` + `release:alpha` → `1.2.4-alpha.2`

**Switching channels:** When switching from one channel to another, the same patch base is kept and the counter resets to 1:
`1.2.4-alpha.3` + `release:beta` → `1.2.4-beta.1`

**Promoting to stable:** Apply a standard label on a pre-release version to promote it:

- `release:patch` on `1.2.4-rc.3` → `1.2.4` (strips suffix — patch was already applied)
- `release:minor` on `1.2.4-rc.3` → `1.3.0`
- `release:major` on `1.2.4-rc.3` → `2.0.0`

**Override:** `release:none` always skips the release, even when combined with a pre-release label.

## Customising pre-release label names

Pre-release label names are configurable in `.versionbot.yml`:

```yaml
labels:
  major: release:major
  minor: release:minor
  patch: release:patch
  none: release:none
  alpha: pre:alpha
  beta: pre:beta
  rc: pre:rc
```

Create the corresponding labels in your GitHub repo before using them.

### CLI creation:

```bash
gh label create "release:alpha" --color "9b59b6" --description "Pre-release alpha"
gh label create "release:beta"  --color "3498db" --description "Pre-release beta"
gh label create "release:rc"    --color "1abc9c" --description "Release candidate"
```

## Labels vs conventional commits

If `use-conventional-commits` is enabled, labels always take precedence.
The conventional commit scan only runs when the PR has no release label.
Use `release:none` to explicitly skip a release even when conventional
commits would otherwise trigger one.

---

## PR template checkbox detection

Instead of applying a label to the PR, you can drive versioning from your PR template checkboxes. Enable with `use-pr-template-labels: 'true'`.

Add a release section to your PR template:

```markdown
## Release type

- [ ] `release:major` — breaking change
- [ ] `release:minor` — new feature, backwards compatible
- [ ] `release:patch` — bug fix
- [ ] `release:none` — no release needed
```

When the author checks one of these boxes before merging, the action reads the PR body and uses it to determine the bump. Unchecked boxes are ignored. The matching is substring-based, so the box text can include surrounding context.

**Precedence:** actual PR label > checkbox > conventional commits > `default-bump`
