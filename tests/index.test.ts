import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@actions/core');
vi.mock('@actions/github');
vi.mock('../src/labels');
vi.mock('../src/version');
vi.mock('../src/changelog');
vi.mock('../src/git');
vi.mock('../src/github-release');
vi.mock('../src/config');
vi.mock('../src/package-json');

import * as core from '@actions/core';
import * as github from '@actions/github';
import * as labelsModule from '../src/labels';
import * as versionModule from '../src/version';
import * as changelogModule from '../src/changelog';
import * as gitModule from '../src/git';
import * as releaseModule from '../src/github-release';
import * as configModule from '../src/config';
import * as pkgModule from '../src/package-json';

function mockInputs(overrides: Record<string, string> = {}): void {
  const defaults: Record<string, string> = {
    'github-token': 'fake-token',
    'version-file': 'VERSION.md',
    'changelog-file': 'CHANGELOG.md',
    'default-bump': 'patch',
    'tag-prefix': 'v',
    'create-github-release': 'true',
    'fail-on-multiple-labels': 'true',
    'dry-run': 'false',
    'target-branch': 'main',
    'commit-message-template': 'chore(release): {tag}',
    ...overrides,
  };
  vi.mocked(core.getInput).mockImplementation((name: string) => defaults[name] ?? '');
}

function mockMergedPR(labels: string[] = ['release:minor']): void {
  Object.defineProperty(github, 'context', {
    value: {
      payload: {
        pull_request: {
          merged: true,
          number: 42,
          title: 'Add new feature',
          labels: labels.map((name) => ({ name })),
        },
      },
      repo: { owner: 'test-owner', repo: 'test-repo' },
    },
    writable: true,
    configurable: true,
  });
}

describe('run', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(configModule.loadConfig).mockReturnValue({});
    vi.mocked(configModule.mergeConfig).mockReturnValue({
      versionFile: 'VERSION.md',
      changelogFile: 'CHANGELOG.md',
      defaultBump: 'patch',
      tagPrefix: 'v',
      createGithubRelease: true,
      failOnMultipleLabels: true,
      dryRun: false,
      targetBranch: 'main',
      commitMessageTemplate: 'chore(release): {tag}',
      syncPackageJson: false,
      labels: {
        major: 'release:major',
        minor: 'release:minor',
        patch: 'release:patch',
        none: 'release:none',
      },
    });
    vi.mocked(pkgModule.updatePackageVersion).mockReturnValue(true);
    vi.mocked(labelsModule.detectBump).mockReturnValue('minor');
    vi.mocked(versionModule.readVersion).mockReturnValue('1.0.0');
    vi.mocked(versionModule.bumpVersion).mockReturnValue('1.1.0');
    vi.mocked(versionModule.writeVersion).mockImplementation(() => undefined);
    vi.mocked(changelogModule.prependEntry).mockImplementation(() => undefined);
    vi.mocked(gitModule.configureGit).mockResolvedValue(undefined);
    vi.mocked(gitModule.commitRelease).mockResolvedValue(undefined);
    vi.mocked(gitModule.createTag).mockResolvedValue(undefined);
    vi.mocked(releaseModule.createRelease).mockResolvedValue(undefined);
  });

  it('exits early when PR is not merged', async () => {
    Object.defineProperty(github, 'context', {
      value: { payload: { pull_request: { merged: false } } },
      writable: true,
      configurable: true,
    });
    mockInputs();
    const { run } = await import('../src/index');
    await run();
    expect(versionModule.readVersion).not.toHaveBeenCalled();
  });

  it('sets skipped output and exits when bump is none', async () => {
    mockMergedPR(['release:none']);
    mockInputs();
    vi.mocked(labelsModule.detectBump).mockReturnValue('none');
    const { run } = await import('../src/index');
    await run();
    expect(core.setOutput).toHaveBeenCalledWith('skipped', 'true');
    expect(versionModule.readVersion).not.toHaveBeenCalled();
  });

  it('skips all writes in dry-run mode and emits outputs', async () => {
    mockMergedPR();
    mockInputs({ 'dry-run': 'true' });
    vi.mocked(configModule.mergeConfig).mockReturnValue({
      versionFile: 'VERSION.md',
      changelogFile: 'CHANGELOG.md',
      defaultBump: 'patch',
      tagPrefix: 'v',
      createGithubRelease: true,
      failOnMultipleLabels: true,
      dryRun: true,
      targetBranch: 'main',
      commitMessageTemplate: 'chore(release): {tag}',
      syncPackageJson: false,
      labels: {
        major: 'release:major',
        minor: 'release:minor',
        patch: 'release:patch',
        none: 'release:none',
      },
    });
    const { run } = await import('../src/index');
    await run();
    expect(versionModule.writeVersion).not.toHaveBeenCalled();
    expect(changelogModule.prependEntry).not.toHaveBeenCalled();
    expect(gitModule.configureGit).not.toHaveBeenCalled();
    expect(gitModule.commitRelease).not.toHaveBeenCalled();
    expect(gitModule.createTag).not.toHaveBeenCalled();
    expect(releaseModule.createRelease).not.toHaveBeenCalled();
    expect(core.setOutput).toHaveBeenCalledWith('version', '1.1.0');
    expect(core.setOutput).toHaveBeenCalledWith('skipped', 'false');
  });

  it('runs full release flow on merged PR with release label', async () => {
    mockMergedPR();
    mockInputs();
    const { run } = await import('../src/index');
    await run();
    expect(versionModule.writeVersion).toHaveBeenCalledWith('VERSION.md', '1.1.0');
    expect(changelogModule.prependEntry).toHaveBeenCalled();
    expect(gitModule.configureGit).toHaveBeenCalled();
    expect(gitModule.commitRelease).toHaveBeenCalledWith(
      ['VERSION.md', 'CHANGELOG.md'],
      'chore(release): v1.1.0'
    );
    expect(gitModule.createTag).toHaveBeenCalledWith('v1.1.0');
    expect(releaseModule.createRelease).toHaveBeenCalled();
    expect(core.setOutput).toHaveBeenCalledWith('version', '1.1.0');
    expect(core.setOutput).toHaveBeenCalledWith('tag', 'v1.1.0');
    expect(core.setOutput).toHaveBeenCalledWith('bump', 'minor');
    expect(core.setOutput).toHaveBeenCalledWith('skipped', 'false');
  });

  it('calls setFailed on error', async () => {
    mockMergedPR();
    mockInputs();
    vi.mocked(versionModule.readVersion).mockImplementation(() => {
      throw new Error('File not found: VERSION.md');
    });
    const { run } = await import('../src/index');
    await run();
    expect(core.setFailed).toHaveBeenCalledWith('File not found: VERSION.md');
  });

  it('skips GitHub Release when create-github-release is false', async () => {
    mockMergedPR();
    mockInputs({ 'create-github-release': 'false' });
    vi.mocked(configModule.mergeConfig).mockReturnValue({
      versionFile: 'VERSION.md',
      changelogFile: 'CHANGELOG.md',
      defaultBump: 'patch',
      tagPrefix: 'v',
      createGithubRelease: false,
      failOnMultipleLabels: true,
      dryRun: false,
      targetBranch: 'main',
      commitMessageTemplate: 'chore(release): {tag}',
      syncPackageJson: false,
      labels: {
        major: 'release:major',
        minor: 'release:minor',
        patch: 'release:patch',
        none: 'release:none',
      },
    });
    const { run } = await import('../src/index');
    await run();
    expect(releaseModule.createRelease).not.toHaveBeenCalled();
  });

  it('includes package.json in commit when syncPackageJson is true', async () => {
    mockMergedPR();
    mockInputs();
    vi.mocked(configModule.mergeConfig).mockReturnValue({
      versionFile: 'VERSION.md',
      changelogFile: 'CHANGELOG.md',
      defaultBump: 'patch',
      tagPrefix: 'v',
      createGithubRelease: true,
      failOnMultipleLabels: true,
      dryRun: false,
      targetBranch: 'main',
      commitMessageTemplate: 'chore(release): {tag}',
      syncPackageJson: true,
      labels: {
        major: 'release:major',
        minor: 'release:minor',
        patch: 'release:patch',
        none: 'release:none',
      },
    });
    const { run } = await import('../src/index');
    await run();
    expect(pkgModule.updatePackageVersion).toHaveBeenCalledWith('package.json', '1.1.0');
    expect(gitModule.commitRelease).toHaveBeenCalledWith(
      ['VERSION.md', 'CHANGELOG.md', 'package.json'],
      'chore(release): v1.1.0'
    );
  });
});
