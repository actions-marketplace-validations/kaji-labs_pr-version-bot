export type BumpType = 'major' | 'minor' | 'patch' | 'none';

export interface LabelMapConfig {
  major: string;
  minor: string;
  patch: string;
  none: string;
}

const DEFAULT_LABEL_MAP: LabelMapConfig = {
  major: 'release:major',
  minor: 'release:minor',
  patch: 'release:patch',
  none: 'release:none',
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

  const releaseLabels = labels.filter((l) => l in lookup);

  if (releaseLabels.length === 0) return defaultBump;

  if (releaseLabels.length > 1 && failOnMultiple) {
    throw new Error(`Multiple release labels found: ${releaseLabels.join(', ')}`);
  }

  return lookup[releaseLabels[0]];
}
