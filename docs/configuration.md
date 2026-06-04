# Configuration

All inputs and outputs for PR Version Bot.

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
