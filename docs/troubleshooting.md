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
