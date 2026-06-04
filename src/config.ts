import * as fs from 'fs';
import * as yaml from 'js-yaml';
import type { BumpType } from './labels';

export interface LabelConfig {
  major: string;
  minor: string;
  patch: string;
  none: string;
}

export interface BotConfig {
  versionFile?: string;
  changelogFile?: string;
  defaultBump?: BumpType;
  tagPrefix?: string;
  createGithubRelease?: boolean;
  failOnMultipleLabels?: boolean;
  dryRun?: boolean;
  targetBranch?: string;
  commitMessageTemplate?: string;
  labels?: Partial<LabelConfig>;
}

export interface ResolvedConfig {
  versionFile: string;
  changelogFile: string;
  defaultBump: BumpType;
  tagPrefix: string;
  createGithubRelease: boolean;
  failOnMultipleLabels: boolean;
  dryRun: boolean;
  targetBranch: string;
  commitMessageTemplate: string;
  labels: LabelConfig;
}

const DEFAULT_LABELS: LabelConfig = {
  major: 'release:major',
  minor: 'release:minor',
  patch: 'release:patch',
  none: 'release:none',
};

export function loadConfig(configPath = '.versionbot.yml'): BotConfig {
  if (!fs.existsSync(configPath)) return {};

  const raw = fs.readFileSync(configPath, 'utf8') as string;
  const parsed = yaml.load(raw);

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error(`Invalid .versionbot.yml: expected a mapping, got ${Array.isArray(parsed) ? 'array' : typeof parsed}`);
  }

  return parsed as BotConfig;
}

export function mergeConfig(
  fileConfig: BotConfig,
  inputs: Record<string, string>
): ResolvedConfig {
  const inp = (key: string) => inputs[key] || '';

  return {
    versionFile: inp('version-file') || fileConfig.versionFile || 'VERSION.md',
    changelogFile: inp('changelog-file') || fileConfig.changelogFile || 'CHANGELOG.md',
    defaultBump: (inp('default-bump') || fileConfig.defaultBump || 'patch') as BumpType,
    tagPrefix: inp('tag-prefix') || fileConfig.tagPrefix || 'v',
    createGithubRelease: inp('create-github-release')
      ? inp('create-github-release') !== 'false'
      : fileConfig.createGithubRelease ?? true,
    failOnMultipleLabels: inp('fail-on-multiple-labels')
      ? inp('fail-on-multiple-labels') !== 'false'
      : fileConfig.failOnMultipleLabels ?? true,
    dryRun: inp('dry-run')
      ? inp('dry-run') === 'true'
      : fileConfig.dryRun ?? false,
    targetBranch: inp('target-branch') || fileConfig.targetBranch || 'main',
    commitMessageTemplate:
      inp('commit-message-template') ||
      fileConfig.commitMessageTemplate ||
      'chore(release): {tag}',
    labels: {
      ...DEFAULT_LABELS,
      ...fileConfig.labels,
    },
  };
}
