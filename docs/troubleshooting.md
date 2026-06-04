# Troubleshooting

## No release label on PR

**Symptom:** Version bumped by `patch` unexpectedly.

**Cause:** No `release:*` label was applied before merging. The action falls back to `default-bump` (default: `patch`).

**Fix:** Apply a label before merging. Or set `default-bump: none` to skip releases when no label is present.

---

## Multiple release labels error

**Symptom:** Action fails — `Multiple release labels found: release:major, release:minor`.

**Cause:** PR has more than one `release:*` label and `fail-on-multiple-labels` is `'true'` (default).

**Fix:** Remove the extra label before merging. Or set `fail-on-multiple-labels: 'false'` to use the first matching label.

---

## VERSION.md parse error

**Symptom:** Action fails — `Invalid semver in VERSION.md`.

**Cause:** `VERSION.md` contains something other than a valid semver string. Common causes: `v1.0.0` with a `v` prefix, trailing spaces, blank file, or a markdown heading.

**Fix:** Ensure `VERSION.md` contains exactly a bare semver on a single line:

```
1.0.0
```

---

## dist/ out of sync

**Symptom:** CI fails on `git diff --exit-code dist/`.

**Cause:** `src/` was changed but `npm run build` was not run before committing.

**Fix:** Run `npm run build` and commit the updated `dist/index.js` alongside your source changes.

---

## Action not triggered on merge

**Symptom:** Release workflow does not run after merging a PR.

**Cause:** The workflow trigger requires `types: [closed]` and the job condition `if: github.event.pull_request.merged == true`. If either is missing, the workflow runs but exits early or does not run at all.

**Fix:** Verify your workflow matches the [Quick Start](quick-start.md) example exactly.

---

## Config file not being read

**Symptom:** Action ignores `.versionbot.yml` settings.

**Cause:** The file is not in the repo root, or the action runs in a different working directory.

**Fix:** Ensure `.versionbot.yml` is in the root of the repository (same level as `action.yml`).

---

## Invalid .versionbot.yml

**Symptom:** Action fails with `Invalid .versionbot.yml`.

**Cause:** The file contains invalid YAML syntax, or the root value is not a mapping (e.g. a list or plain string).

**Fix:** Validate your config file with a YAML linter. The root must be a YAML mapping (key-value pairs), not a list or scalar. See `.versionbot.yml.example` for a valid reference.

---

## package.json version not updating

**Symptom:** Release completes but `package.json` version is unchanged.

**Cause 1:** `sync-package-json` input is not set to `'true'` (default is `'false'`).

**Fix:** Add `sync-package-json: 'true'` to your workflow or `syncPackageJson: true` to `.versionbot.yml`.

---

**Cause 2:** `package.json` is not in the repo root.

**Fix:** The action looks for `package.json` in the repository root only. If your `package.json` is in a subdirectory, this feature is not supported in this version — see the roadmap for monorepo support (Epic 6).

---

## Conventional commits not detected

**Symptom:** Bump type falls back to `default-bump` even though PR commits use `feat:` or `fix:` prefixes.

**Cause 1:** `use-conventional-commits` is not set to `'true'` (default is `'false'`).

**Fix:** Add `use-conventional-commits: 'true'` to your workflow or `useConventionalCommits: true` to `.versionbot.yml`.

---

**Cause 2:** A release label is present on the PR.

**Fix:** Labels always take precedence over commit scanning. Remove the label or use `release:none` to skip.

---

**Cause 3:** The workflow is missing `pull-requests: read` permission.

**Fix:** Add `pull-requests: read` to your workflow permissions block.
