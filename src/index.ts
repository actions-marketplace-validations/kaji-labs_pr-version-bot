import * as core from '@actions/core';
import * as github from '@actions/github';
import { detectBump, type BumpType } from './labels';
import { readVersion, bumpVersion, writeVersion } from './version';
import { prependEntry } from './changelog';
import { configureGit, commitRelease, createTag } from './git';
import { createRelease } from './github-release';

export async function run(): Promise<void> {
  try {
    const pr = github.context.payload.pull_request;
    if (!pr?.merged) {
      core.info('PR not merged — skipping');
      return;
    }

    const token = core.getInput('github-token', { required: true });
    const versionFile = core.getInput('version-file') || 'VERSION.md';
    const changelogFile = core.getInput('changelog-file') || 'CHANGELOG.md';
    const defaultBump = (core.getInput('default-bump') || 'patch') as BumpType;
    const tagPrefix = core.getInput('tag-prefix') || 'v';
    const createGhRelease = core.getInput('create-github-release') !== 'false';
    const failOnMultiple = core.getInput('fail-on-multiple-labels') !== 'false';
    const dryRun = core.getInput('dry-run') === 'true';
    const commitTemplate =
      core.getInput('commit-message-template') || 'chore(release): {tag}';

    const labels = (pr.labels as Array<{ name: string }>).map((l) => l.name);
    const bump = detectBump(labels, defaultBump, failOnMultiple);

    if (bump === 'none') {
      core.info('release:none label — skipping release');
      core.setOutput('bump', 'none');
      core.setOutput('skipped', 'true');
      return;
    }

    const current = readVersion(versionFile);
    const next = bumpVersion(current, bump as Exclude<BumpType, 'none'>);
    const tag = `${tagPrefix}${next}`;
    const message = commitTemplate.replace('{tag}', tag);

    core.info(`Current version: ${current}`);
    core.info(`Detected bump: ${bump}`);
    core.info(`Next version: ${next}`);
    core.info(`Creating tag: ${tag}`);

    if (dryRun) {
      core.info('Dry run — no changes written');
      core.setOutput('version', next);
      core.setOutput('tag', tag);
      core.setOutput('bump', bump);
      core.setOutput('skipped', 'false');
      return;
    }

    const date = new Date().toISOString().split('T')[0];

    writeVersion(versionFile, next);
    prependEntry(changelogFile, {
      version: next,
      date,
      prTitle: pr.title as string,
      prNumber: pr.number as number,
      bump,
    });

    await configureGit();
    await commitRelease([versionFile, changelogFile], message);
    await createTag(tag);

    if (createGhRelease) {
      await createRelease(
        token,
        tag,
        next,
        `${bump}: ${pr.title as string} (#${pr.number as number})`
      );
    }

    core.setOutput('version', next);
    core.setOutput('tag', tag);
    core.setOutput('bump', bump);
    core.setOutput('skipped', 'false');
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error));
  }
}

run();
