import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as exec from '@actions/exec';

vi.mock('@actions/exec');

import { configureGit, commitRelease, createTag } from '../src/git';

describe('configureGit', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sets git user name', async () => {
    vi.mocked(exec.exec).mockResolvedValue(0);
    await configureGit();
    expect(exec.exec).toHaveBeenCalledWith('git', [
      'config', 'user.name', 'github-actions[bot]',
    ]);
  });

  it('sets git user email', async () => {
    vi.mocked(exec.exec).mockResolvedValue(0);
    await configureGit();
    expect(exec.exec).toHaveBeenCalledWith('git', [
      'config', 'user.email', 'github-actions[bot]@users.noreply.github.com',
    ]);
  });
});

describe('commitRelease', () => {
  beforeEach(() => vi.clearAllMocks());

  it('stages each file individually', async () => {
    vi.mocked(exec.exec).mockResolvedValue(0);
    await commitRelease(['VERSION.md', 'CHANGELOG.md'], 'chore(release): v1.2.3');
    expect(exec.exec).toHaveBeenCalledWith('git', ['add', 'VERSION.md']);
    expect(exec.exec).toHaveBeenCalledWith('git', ['add', 'CHANGELOG.md']);
  });

  it('commits with the provided message', async () => {
    vi.mocked(exec.exec).mockResolvedValue(0);
    await commitRelease(['VERSION.md', 'CHANGELOG.md'], 'chore(release): v1.2.3');
    expect(exec.exec).toHaveBeenCalledWith('git', [
      'commit', '-m', 'chore(release): v1.2.3',
    ]);
  });

  it('stages files before committing', async () => {
    const calls: string[][] = [];
    vi.mocked(exec.exec).mockImplementation((_cmd, args) => {
      calls.push(args as string[]);
      return Promise.resolve(0);
    });
    await commitRelease(['VERSION.md'], 'chore(release): v1.0.1');
    const addIdx = calls.findIndex((a) => a[0] === 'add');
    const commitIdx = calls.findIndex((a) => a[0] === 'commit');
    expect(addIdx).toBeLessThan(commitIdx);
  });
});

describe('createTag', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates the tag', async () => {
    vi.mocked(exec.exec).mockResolvedValue(0);
    await createTag('v1.2.3');
    expect(exec.exec).toHaveBeenCalledWith('git', ['tag', 'v1.2.3']);
  });

  it('pushes the tag to origin', async () => {
    vi.mocked(exec.exec).mockResolvedValue(0);
    await createTag('v1.2.3');
    expect(exec.exec).toHaveBeenCalledWith('git', ['push', 'origin', 'v1.2.3']);
  });

  it('pushes the commit', async () => {
    vi.mocked(exec.exec).mockResolvedValue(0);
    await createTag('v1.2.3');
    expect(exec.exec).toHaveBeenCalledWith('git', ['push']);
  });
});
