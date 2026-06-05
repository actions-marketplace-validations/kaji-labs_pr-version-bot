import * as exec from '@actions/exec';

export async function configureGit(): Promise<void> {
  await exec.exec('git', ['config', 'user.name', 'github-actions[bot]']);
  await exec.exec('git', ['config', 'user.email', 'github-actions[bot]@users.noreply.github.com']);
}

export async function commitRelease(files: string[], message: string): Promise<void> {
  if (files.length === 0)
    throw new Error('commitRelease called with an empty files array — nothing to commit');
  for (const file of files) {
    await exec.exec('git', ['add', file]);
  }
  // Check if there are staged changes before committing
  const hasStagedChanges = await exec.exec('git', ['diff', '--staged', '--quiet'], {
    ignoreReturnCode: true,
  });
  if (hasStagedChanges === 0) {
    // exit code 0 means no diff = nothing staged
    throw new Error('commitRelease: no staged changes found — files may already be committed');
  }
  await exec.exec('git', ['commit', '-m', message]);
}

export async function createTag(tag: string): Promise<void> {
  await exec.exec('git', ['tag', tag]);
  await exec.exec('git', ['push', 'origin', tag]);
}

export async function pushWithProtectionCheck(targetBranch: string): Promise<void> {
  try {
    await exec.exec('git', ['push']);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Push to "${targetBranch}" was rejected. ` +
        `If branch protection is enabled, direct pushes may be blocked. ` +
        `Enable \`use-release-pr: true\` to open a release PR instead. ` +
        `See https://github.com/kaji-labs/pr-version-bot/blob/main/docs/troubleshooting.md ` +
        `(original error: ${msg})`,
      { cause: error }
    );
  }
}
