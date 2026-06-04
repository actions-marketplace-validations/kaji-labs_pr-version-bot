import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';

vi.mock('fs');

import { loadConfig, mergeConfig } from '../src/config';

const DEFAULT_INPUTS: Record<string, string> = {
  'github-token': 'fake-token',
  'version-file': '',
  'changelog-file': '',
  'default-bump': '',
  'tag-prefix': '',
  'create-github-release': '',
  'fail-on-multiple-labels': '',
  'dry-run': '',
  'target-branch': '',
  'commit-message-template': '',
};

describe('loadConfig', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns empty object when config file does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    expect(loadConfig()).toEqual({});
  });

  it('parses a valid config file', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue('versionFile: VERSION.md\ndefaultBump: minor\n');
    const config = loadConfig();
    expect(config.versionFile).toBe('VERSION.md');
    expect(config.defaultBump).toBe('minor');
  });

  it('throws on invalid YAML', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(': bad: yaml: [');
    expect(() => loadConfig()).toThrow();
  });

  it('throws when config root is not an object', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue('- just a list\n');
    expect(() => loadConfig()).toThrow('Invalid .versionbot.yml');
  });
});

describe('mergeConfig', () => {
  it('uses file config when inputs are empty', () => {
    const result = mergeConfig({ versionFile: 'CUSTOM.md', defaultBump: 'minor' }, DEFAULT_INPUTS);
    expect(result.versionFile).toBe('CUSTOM.md');
    expect(result.defaultBump).toBe('minor');
  });

  it('workflow inputs override file config', () => {
    const result = mergeConfig(
      { versionFile: 'CUSTOM.md', defaultBump: 'minor' },
      { ...DEFAULT_INPUTS, 'version-file': 'OVERRIDE.md' }
    );
    expect(result.versionFile).toBe('OVERRIDE.md');
  });

  it('uses defaults when both file config and inputs are empty', () => {
    const result = mergeConfig({}, DEFAULT_INPUTS);
    expect(result.versionFile).toBe('VERSION.md');
    expect(result.changelogFile).toBe('CHANGELOG.md');
    expect(result.defaultBump).toBe('patch');
    expect(result.tagPrefix).toBe('v');
    expect(result.createGithubRelease).toBe(true);
    expect(result.failOnMultipleLabels).toBe(true);
    expect(result.dryRun).toBe(false);
    expect(result.commitMessageTemplate).toBe('chore(release): {tag}');
  });

  it('includes default labels when not configured', () => {
    const result = mergeConfig({}, DEFAULT_INPUTS);
    expect(result.labels.major).toBe('release:major');
    expect(result.labels.minor).toBe('release:minor');
    expect(result.labels.patch).toBe('release:patch');
    expect(result.labels.none).toBe('release:none');
  });

  it("resolves create-github-release: 'false' string to boolean false", () => {
    const result = mergeConfig({}, { ...DEFAULT_INPUTS, 'create-github-release': 'false' });
    expect(result.createGithubRelease).toBe(false);
  });

  it("resolves dry-run: 'true' string to boolean true", () => {
    const result = mergeConfig({}, { ...DEFAULT_INPUTS, 'dry-run': 'true' });
    expect(result.dryRun).toBe(true);
  });

  it("resolves fail-on-multiple-labels: 'false' string to boolean false", () => {
    const result = mergeConfig({}, { ...DEFAULT_INPUTS, 'fail-on-multiple-labels': 'false' });
    expect(result.failOnMultipleLabels).toBe(false);
  });

  it("resolves sync-package-json: 'true' string to boolean true", () => {
    const result = mergeConfig({}, { ...DEFAULT_INPUTS, 'sync-package-json': 'true' });
    expect(result.syncPackageJson).toBe(true);
  });

  it('defaults syncPackageJson to false', () => {
    const result = mergeConfig({}, DEFAULT_INPUTS);
    expect(result.syncPackageJson).toBe(false);
  });

  it('uses syncPackageJson from file config when input is empty', () => {
    const result = mergeConfig({ syncPackageJson: true }, DEFAULT_INPUTS);
    expect(result.syncPackageJson).toBe(true);
  });
});
