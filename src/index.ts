import * as core from '@actions/core';
import * as github from '@actions/github';
import { detectBump } from './labels';
import { bumpPrerelease, readVersion, bumpVersion, writeVersion } from './version';
import type { PrereleaseChannel } from './version';
import { prependEntry } from './changelog';
import { configureGit, commitRelease, createTag } from './git';
import { createRelease } from './github-release';
import { loadConfig, mergeConfig } from './config';
import { updatePackageVersion } from './package-json';
import { detectBumpFromCommits } from './conventional';
import { detectBumpFromPrBody } from './pr-template';
import { sendSlackNotification, sendDiscordNotification } from './notify';
import { resolvePackagePaths } from './monorepo';

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
      'sync-package-json': core.getInput('sync-package-json'),
      'use-conventional-commits': core.getInput('use-conventional-commits'),
      'use-pr-template-labels': core.getInput('use-pr-template-labels'),
    };

    const fileConfig = loadConfig();
    const config = mergeConfig(fileConfig, inputs);

    const labels = (pr.labels as Array<{ name: string }>).map((l) => l.name);
    const releaseLabels = labels.filter((l) => Object.values(config.labels).includes(l));
    let bump = detectBump(labels, config.defaultBump, config.failOnMultipleLabels, config.labels);

    // PR body checkbox detection (lower priority than actual PR labels)
    if (releaseLabels.length === 0 && config.usePrTemplateLabels) {
      const prBodyBump = detectBumpFromPrBody(
        pr.body as string | null,
        config.labels,
        config.failOnMultipleLabels
      );
      if (prBodyBump !== null) {
        bump = prBodyBump;
        core.info(`PR body checkbox detected bump: ${bump}`);
      }
    }

    if (
      releaseLabels.length === 0 &&
      bump === config.defaultBump &&
      config.useConventionalCommits
    ) {
      const octokit = github.getOctokit(token);
      const { owner, repo } = github.context.repo;
      const commits = await octokit.rest.pulls.listCommits({
        owner,
        repo,
        pull_number: pr.number as number,
        per_page: 100,
      });
      const messages = commits.data.map((c) => c.commit.message);
      const conventionalBump = detectBumpFromCommits(messages);
      if (conventionalBump !== null) {
        bump = conventionalBump;
        core.info(`Conventional commits detected bump: ${bump}`);
      }
    }

    if (bump === 'none') {
      core.info('release:none label — skipping release');
      core.setOutput('bump', 'none');
      core.setOutput('skipped', 'true');
      return;
    }

    // Resolve package paths (empty = single-package mode)
    const packageVersionFiles =
      config.packages.length > 0
        ? resolvePackagePaths(config.packages, config.versionFile)
        : [config.versionFile];

    const isPrereleaseChannel = (b: typeof bump): b is PrereleaseChannel =>
      b === 'alpha' || b === 'beta' || b === 'rc';

    // Use first package (or root) to determine the "canonical" next version for the tag
    const current = readVersion(packageVersionFiles[0]);
    const next = isPrereleaseChannel(bump)
      ? bumpPrerelease(current, bump)
      : bumpVersion(current, bump as Exclude<typeof bump, PrereleaseChannel | 'none'>);
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
    const filesToCommit: string[] = [];

    if (config.packages.length > 0) {
      // Monorepo: bump each package independently
      for (const pkgVersionFile of packageVersionFiles) {
        const pkgCurrent = readVersion(pkgVersionFile);
        const pkgNext = isPrereleaseChannel(bump)
          ? bumpPrerelease(pkgCurrent, bump)
          : bumpVersion(pkgCurrent, bump as Exclude<typeof bump, PrereleaseChannel | 'none'>);
        writeVersion(pkgVersionFile, pkgNext);
        filesToCommit.push(pkgVersionFile);

        // Changelog at package/CHANGELOG.md
        const pkgDir = pkgVersionFile.replace(/\/[^/]+$/, '');
        const pkgChangelogFile = `${pkgDir}/${config.changelogFile.replace(/.*\//, '')}`;
        prependEntry(pkgChangelogFile, {
          version: pkgNext,
          date,
          prTitle: pr.title as string,
          prNumber: pr.number as number,
          bump,
        });
        filesToCommit.push(pkgChangelogFile);
      }
    } else {
      // Single-package mode (original behaviour)
      writeVersion(config.versionFile, next);
      filesToCommit.push(config.versionFile);

      prependEntry(config.changelogFile, {
        version: next,
        date,
        prTitle: pr.title as string,
        prNumber: pr.number as number,
        bump,
      });
      filesToCommit.push(config.changelogFile);

      if (config.syncPackageJson) {
        updatePackageVersion('package.json', next);
        filesToCommit.push('package.json');
      }
    }

    await configureGit();
    await commitRelease(filesToCommit, message);
    await createTag(tag);

    if (config.createGithubRelease) {
      await createRelease(
        token,
        tag,
        next,
        `${bump}: ${pr.title as string} (#${pr.number as number})`
      );
    }

    const notifMessage = config.notificationTemplate
      .replace('{tag}', tag)
      .replace('{bump}', bump)
      .replace('{prTitle}', pr.title as string)
      .replace('{prNumber}', String(pr.number));

    if (config.slackWebhookUrl) {
      await sendSlackNotification(config.slackWebhookUrl, notifMessage);
    }
    if (config.discordWebhookUrl) {
      await sendDiscordNotification(config.discordWebhookUrl, notifMessage, tag);
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
