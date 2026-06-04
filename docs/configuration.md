# Configuration

All inputs and outputs for PR Version Bot.

## Config file

Create `.versionbot.yml` in your repo root to configure the action without changing your workflow file.

```yaml
# .versionbot.yml
versionFile: VERSION.md
changelogFile: CHANGELOG.md
defaultBump: patch
tagPrefix: v
createGithubRelease: true
failOnMultipleLabels: true
dryRun: false
targetBranch: main
commitMessageTemplate: 'chore(release): {tag}'
labels:
  major: release:major
  minor: release:minor
  patch: release:patch
  none: release:none
```

**Precedence:** workflow inputs → config file → built-in defaults.

The config file is optional. The action works identically without it.

**Accepted fields:**

| Field                   | Type                              | Default                 | Description                      |
| ----------------------- | --------------------------------- | ----------------------- | -------------------------------- |
| `versionFile`           | string                            | `VERSION.md`            | Path to semver file              |
| `changelogFile`         | string                            | `CHANGELOG.md`          | Path to changelog                |
| `defaultBump`           | `major`\|`minor`\|`patch`\|`none` | `patch`                 | Bump type when no label present  |
| `tagPrefix`             | string                            | `v`                     | Git tag prefix                   |
| `createGithubRelease`   | boolean                           | `true`                  | Create a GitHub Release          |
| `failOnMultipleLabels`  | boolean                           | `true`                  | Fail on multiple release labels  |
| `dryRun`                | boolean                           | `false`                 | Run without writing changes      |
| `targetBranch`          | string                            | `main`                  | Branch to push release commit to |
| `commitMessageTemplate` | string                            | `chore(release): {tag}` | Release commit message           |
| `syncPackageJson`       | boolean                           | `false`                 | Sync `version` in `package.json` |
| `labels.major`          | string                            | `release:major`         | Label name for major bump        |
| `labels.minor`          | string                            | `release:minor`         | Label name for minor bump        |
| `labels.patch`          | string                            | `release:patch`         | Label name for patch bump        |
| `labels.none`           | string                            | `release:none`          | Label name to skip release       |

---

## Inputs

### `github-token`

- **Type:** string
- **Required:** yes
- **Default:** `${{ github.token }}`

GitHub token used for API access (creating releases) and git push. The built-in `github.token` works for most cases. If you need to trigger downstream workflows, use a personal access token with `repo` scope.

---

### `version-file`

- **Type:** string
- **Required:** no
- **Default:** `VERSION.md`

Path to the file containing the current semver string. Must contain a bare semver (e.g. `1.2.3`) with no prefix and no extra content.

---

### `changelog-file`

- **Type:** string
- **Required:** no
- **Default:** `CHANGELOG.md`

Path to the changelog file. New entries are prepended above existing content.

---

### `default-bump`

- **Type:** `major` | `minor` | `patch` | `none`
- **Required:** no
- **Default:** `patch`

Bump type applied when the PR has no release label. Set to `none` to skip releases for unlabelled PRs.

---

### `tag-prefix`

- **Type:** string
- **Required:** no
- **Default:** `v`

Prefix prepended to the version number when creating git tags and releases. With the default, version `1.2.3` produces tag `v1.2.3`.

---

### `create-github-release`

- **Type:** `'true'` | `'false'`
- **Required:** no
- **Default:** `'true'`

Whether to create a GitHub Release after tagging. Set to `'false'` to create only the git tag.

---

### `fail-on-multiple-labels`

- **Type:** `'true'` | `'false'`
- **Required:** no
- **Default:** `'true'`

Whether to fail the action when a PR has more than one `release:*` label. When `'false'`, the first matching label wins.

---

### `dry-run`

- **Type:** `'true'` | `'false'`
- **Required:** no
- **Default:** `'false'`

When `'true'`, the action logs what it would do but writes nothing — no file changes, no commit, no tag, no release.

---

### `target-branch`

- **Type:** string
- **Required:** no
- **Default:** `main`

Branch the release commit is pushed to.

---

### `commit-message-template`

- **Type:** string
- **Required:** no
- **Default:** `chore(release): {tag}`

Template for the release commit message. Use `{tag}` as a placeholder for the tag name (e.g. `v1.2.3`).

---

### `sync-package-json`

- **Type:** `'true'` | `'false'`
- **Required:** no
- **Default:** `'false'`

When `'true'`, the action reads `package.json` from the repo root and updates its `version` field to match the new semver. The updated `package.json` is committed alongside `VERSION.md` and `CHANGELOG.md`.

If `package.json` does not exist, a warning is logged and the step is skipped without failing the action.

---

## Outputs

### `version`

New semantic version string, e.g. `1.2.3`.

### `tag`

Created git tag, e.g. `v1.2.3`.

### `bump`

Bump type applied: `major`, `minor`, `patch`, or `none`.

### `skipped`

`'true'` if the release was skipped (`release:none` label or `default-bump: none`). `'false'` otherwise.

## Using outputs in downstream steps

```yaml
- id: version
  uses: YOUR_ORG/pr-version-bot@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}

- name: Deploy
  if: steps.version.outputs.skipped != 'true'
  run: echo "Deploying ${{ steps.version.outputs.tag }}"
```
