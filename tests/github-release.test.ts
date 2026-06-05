import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@actions/github', () => ({
  getOctokit: vi.fn(),
  context: {
    repo: { owner: 'test-owner', repo: 'test-repo' },
  },
}));

import * as github from '@actions/github';
import { createRelease, ReleaseContext } from '../src/github-release';

describe('createRelease', () => {
  const mockCreateRelease = vi.fn().mockResolvedValue({ data: { id: 1 } });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(github.getOctokit).mockReturnValue({
      rest: {
        repos: {
          createRelease: mockCreateRelease,
        },
      },
    } as unknown as ReturnType<typeof github.getOctokit>);
  });

  const ctx: ReleaseContext = {
    bump: 'minor',
    prTitle: 'Add feature',
    prNumber: 42,
    prUrl: 'https://github.com/owner/repo/pull/42',
    authorLogin: 'testuser',
    previousTag: 'v1.0.0',
  };

  it('creates a non-draft, non-prerelease release', async () => {
    await createRelease('fake-token', 'v1.2.3', '1.2.3', ctx);

    expect(mockCreateRelease).toHaveBeenCalledWith(
      expect.objectContaining({
        owner: 'test-owner',
        repo: 'test-repo',
        tag_name: 'v1.2.3',
        name: 'Release v1.2.3',
        draft: false,
        prerelease: false,
      })
    );
  });

  it('uses the provided token to construct octokit', async () => {
    await createRelease('my-token', 'v1.0.0', '1.0.0', {
      ...ctx,
      previousTag: 'v0.9.0',
    });
    expect(github.getOctokit).toHaveBeenCalledWith('my-token');
  });

  it('uses owner and repo from github.context', async () => {
    await createRelease('fake-token', 'v2.0.0', '2.0.0', {
      ...ctx,
      bump: 'major',
      prTitle: 'Breaking change',
      prNumber: 10,
      previousTag: 'v1.0.0',
    });
    expect(mockCreateRelease).toHaveBeenCalledWith(
      expect.objectContaining({ owner: 'test-owner', repo: 'test-repo' })
    );
  });

  it('sets release name as "Release {tag}"', async () => {
    await createRelease('fake-token', 'v1.5.0', '1.5.0', {
      ...ctx,
      prTitle: 'New feature',
      prNumber: 99,
      previousTag: 'v1.4.0',
    });
    expect(mockCreateRelease).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Release v1.5.0' })
    );
  });

  it('generates body containing the compare URL', async () => {
    await createRelease('fake-token', 'v1.2.3', '1.2.3', ctx);

    const call = mockCreateRelease.mock.calls[0][0];
    expect(call.body).toContain('https://github.com/test-owner/test-repo/compare/v1.0.0...v1.2.3');
  });

  it('generates body containing the author login', async () => {
    await createRelease('fake-token', 'v1.2.3', '1.2.3', ctx);

    const call = mockCreateRelease.mock.calls[0][0];
    expect(call.body).toContain('@testuser');
  });

  it('generates body containing the PR link', async () => {
    await createRelease('fake-token', 'v1.2.3', '1.2.3', ctx);

    const call = mockCreateRelease.mock.calls[0][0];
    expect(call.body).toContain('[#42](https://github.com/owner/repo/pull/42)');
  });
});
