import * as core from '@actions/core';
import * as github from '@actions/github';
import { detectBump } from './labels';
import { readVersion, bumpVersion, writeVersion } from './version';
import { prependEntry } from './changelog';
import { configureGit, commitRelease, createTag } from './git';
import { createRelease } from './github-release';
import { loadConfig, mergeConfig } from './config';

export async function run(): Promise<void> {
  try {
    const pr = github.context.payload.pull_request;
    if (!pr?.merged) {
      core.info('PR not merged — skipping');
      return;
    }

    const token = core.getInput('github-token', { required: true });

    const inputs: Record<string, string> = {
      'version-file': core.getInput('version-file'),
      'changelog-file': core.getInput('changelog-file'),
      'default-bump': core.getInput('default-bump'),
      'tag-prefix': core.getInput('tag-prefix'),
      'create-github-release': core.getInput('create-github-release'),
      'fail-on-multiple-labels': core.getInput('fail-on-multiple-labels'),
      'dry-run': core.getInput('dry-run'),
      'target-branch': core.getInput('target-branch'),
      'commit-message-template': core.getInput('commit-message-template'),
    };

    const fileConfig = loadConfig();
    const config = mergeConfig(fileConfig, inputs);

    const labels = (pr.labels as Array<{ name: string }>).map((l) => l.name);
    const bump = detectBump(labels, config.defaultBump, config.failOnMultipleLabels);

    if (bump === 'none') {
      core.info('release:none label — skipping release');
      core.setOutput('bump', 'none');
      core.setOutput('skipped', 'true');
      return;
    }

    const current = readVersion(config.versionFile);
    const next = bumpVersion(current, bump);
    const tag = `${config.tagPrefix}${next}`;
    const message = config.commitMessageTemplate.replace('{tag}', tag);

    core.info(`Current version: ${current}`);
    core.info(`Detected bump: ${bump}`);
    core.info(`Next version: ${next}`);
    core.info(`Creating tag: ${tag}`);

    if (config.dryRun) {
      core.info('Dry run — no changes written');
      core.setOutput('version', next);
      core.setOutput('tag', tag);
      core.setOutput('bump', bump);
      core.setOutput('skipped', 'false');
      return;
    }

    const date = new Date().toISOString().split('T')[0];

    writeVersion(config.versionFile, next);
    prependEntry(config.changelogFile, {
      version: next,
      date,
      prTitle: pr.title as string,
      prNumber: pr.number as number,
      bump,
    });

    await configureGit();
    await commitRelease([config.versionFile, config.changelogFile], message);
    await createTag(tag);

    if (config.createGithubRelease) {
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
