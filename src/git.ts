import * as exec from '@actions/exec';

export async function configureGit(): Promise<void> {
  await exec.exec('git', ['config', 'user.name', 'github-actions[bot]']);
  await exec.exec('git', [
    'config',
    'user.email',
    'github-actions[bot]@users.noreply.github.com',
  ]);
}

export async function commitRelease(files: string[], message: string): Promise<void> {
  for (const file of files) {
    await exec.exec('git', ['add', file]);
  }
  await exec.exec('git', ['commit', '-m', message]);
}

export async function createTag(tag: string): Promise<void> {
  await exec.exec('git', ['tag', tag]);
  await exec.exec('git', ['push', 'origin', tag]);
  await exec.exec('git', ['push']);
}
