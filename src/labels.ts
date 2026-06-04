export type BumpType = 'major' | 'minor' | 'patch' | 'none';

const LABEL_MAP: Record<string, BumpType> = {
  'release:major': 'major',
  'release:minor': 'minor',
  'release:patch': 'patch',
  'release:none': 'none',
};

export function detectBump(
  labels: string[],
  defaultBump: BumpType,
  failOnMultiple: boolean
): BumpType {
  const releaseLabels = labels.filter((l) => l in LABEL_MAP);

  if (releaseLabels.length === 0) return defaultBump;

  if (releaseLabels.length > 1 && failOnMultiple) {
    throw new Error(`Multiple release labels found: ${releaseLabels.join(', ')}`);
  }

  return LABEL_MAP[releaseLabels[0]];
}
