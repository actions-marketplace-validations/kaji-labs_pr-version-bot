import * as github from '@actions/github';

export interface ReleaseContext {
  bump: string;
  prTitle: string;
  prNumber: number;
  prUrl: string;
  authorLogin: string;
  previousTag: string;
}

export async function createRelease(
  token: string,
  tag: string,
  version: string,
  context: ReleaseContext
): Promise<void> {
  const octokit = github.getOctokit(token);
  const { owner, repo } = github.context.repo;

  const compareUrl = `https://github.com/${owner}/${repo}/compare/${context.previousTag}...${tag}`;
  const body = [
    `## What changed`,
    ``,
    `- **${context.bump}**: ${context.prTitle} ([#${context.prNumber}](${context.prUrl})) by @${context.authorLogin}`,
    ``,
    `**Full diff:** ${compareUrl}`,
  ].join('\n');

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
