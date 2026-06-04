import * as github from '@actions/github';

export async function createRelease(
  token: string,
  tag: string,
  version: string,
  body: string
): Promise<void> {
  const octokit = github.getOctokit(token);
  const { owner, repo } = github.context.repo;

  await octokit.rest.repos.createRelease({
    owner,
    repo,
    tag_name: tag,
    name: `Release ${tag}`,
    body,
    draft: false,
    prerelease: false,
  });
}
