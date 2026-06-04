export type BumpType = 'major' | 'minor' | 'patch' | 'none' | 'alpha' | 'beta' | 'rc';
export type PrereleaseBumpType = 'alpha' | 'beta' | 'rc';

export interface LabelMapConfig {
  major: string;
  minor: string;
  patch: string;
  none: string;
  alpha?: string;
  beta?: string;
  rc?: string;
}

const DEFAULT_LABEL_MAP: LabelMapConfig = {
  major: 'release:major',
  minor: 'release:minor',
  patch: 'release:patch',
  none: 'release:none',
  alpha: 'release:alpha',
  beta: 'release:beta',
  rc: 'release:rc',
};

export function detectBump(
  labels: string[],
  defaultBump: BumpType,
  failOnMultiple: boolean,
  labelMap: LabelMapConfig = DEFAULT_LABEL_MAP
): BumpType {
  const lookup: Record<string, BumpType> = {
    [labelMap.major]: 'major',
    [labelMap.minor]: 'minor',
    [labelMap.patch]: 'patch',
    [labelMap.none]: 'none',
  };

  // Add optional prerelease entries when defined
  if (labelMap.alpha) lookup[labelMap.alpha] = 'alpha';
  if (labelMap.beta) lookup[labelMap.beta] = 'beta';
  if (labelMap.rc) lookup[labelMap.rc] = 'rc';

  const releaseLabels = labels.filter((l) => l in lookup);

  if (releaseLabels.length === 0) return defaultBump;

  // release:none always wins — explicit skip takes precedence over any bump label
  if (releaseLabels.some((l) => lookup[l] === 'none')) return 'none';

  if (releaseLabels.length > 1 && failOnMultiple) {
    throw new Error(`Multiple release labels found: ${releaseLabels.join(', ')}`);
  }

  return lookup[releaseLabels[0]];
}
