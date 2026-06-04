import type { BumpType } from './labels';

type StableBumpType = Exclude<BumpType, 'none' | 'alpha' | 'beta' | 'rc'>;

const BUMP_PRIORITY: Record<StableBumpType, number> = {
  major: 3,
  minor: 2,
  patch: 1,
};

function higher(a: StableBumpType | null, b: StableBumpType): StableBumpType {
  if (a === null) return b;
  return BUMP_PRIORITY[a] >= BUMP_PRIORITY[b] ? a : b;
}

function detectFromMessage(message: string): StableBumpType | null {
  if (/BREAKING CHANGE:/m.test(message)) return 'major';
  if (/^(\w+)(\(.+\))?!:/.test(message)) return 'major';
  if (/^feat(\(.+\))?:/.test(message)) return 'minor';
  if (/^fix(\(.+\))?:/.test(message)) return 'patch';
  return null;
}

export function detectBumpFromCommits(commitMessages: string[]): StableBumpType | null {
  let result: StableBumpType | null = null;

  for (const message of commitMessages) {
    const bump = detectFromMessage(message);
    if (bump !== null) {
      result = higher(result, bump);
      if (result === 'major') break;
    }
  }

  return result;
}
