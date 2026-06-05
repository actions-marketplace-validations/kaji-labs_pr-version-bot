import * as exec from '@actions/exec';
import * as github from '@actions/github';

export function sanitiseReleaseBranch(tag: string): string {
  // Only keep alphanumeric, /, ., - characters
  return `release/${tag.replace(/[^a-zA-Z0-9/.-]/g, '-')}`;
}

export async function createReleaseBranch(branchName: string): Promise<void> {
  await exec.exec('git', ['checkout', '-b', branchName]);
}

export async function pushReleaseBranch(branchName: string): Promise<void> {
  await exec.exec('git', ['push', 'origin', `HEAD:${branchName}`]);
}

export async function openReleasePr(
  token: string,
  branchName: string,
  targetBranch: string,
  title: string,
  body: string
): Promise<string> {
  const octokit = github.getOctokit(token);
  const { owner, repo } = github.context.repo;

  const pr = await octokit.rest.pulls.create({
    owner,
    repo,
    title,
    body,
    head: branchName,
    base: targetBranch,
  });

  // Apply release:none label to prevent recursive release triggering
  await octokit.rest.issues.addLabels({
    owner,
    repo,
    issue_number: pr.data.number,
    labels: ['release:none'],
  });

  return pr.data.html_url;
}
