import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@actions/github', () => ({
  getOctokit: vi.fn(),
  context: {
    repo: { owner: 'test-owner', repo: 'test-repo' },
  },
}));

import * as github from '@actions/github';
import { createRelease } from '../src/github-release';

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

  it('creates a non-draft, non-prerelease release', async () => {
    await createRelease('fake-token', 'v1.2.3', '1.2.3', 'minor: Add feature (#42)');

    expect(mockCreateRelease).toHaveBeenCalledWith({
      owner: 'test-owner',
      repo: 'test-repo',
      tag_name: 'v1.2.3',
      name: 'Release v1.2.3',
      body: 'minor: Add feature (#42)',
      draft: false,
      prerelease: false,
    });
  });

  it('uses the provided token to construct octokit', async () => {
    await createRelease('my-token', 'v1.0.0', '1.0.0', 'patch: Fix bug (#1)');
    expect(github.getOctokit).toHaveBeenCalledWith('my-token');
  });

  it('uses owner and repo from github.context', async () => {
    await createRelease('fake-token', 'v2.0.0', '2.0.0', 'major: Breaking change (#10)');
    expect(mockCreateRelease).toHaveBeenCalledWith(
      expect.objectContaining({ owner: 'test-owner', repo: 'test-repo' })
    );
  });

  it('sets release name as "Release {tag}"', async () => {
    await createRelease('fake-token', 'v1.5.0', '1.5.0', 'minor: New feature (#99)');
    expect(mockCreateRelease).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Release v1.5.0' })
    );
  });
});
