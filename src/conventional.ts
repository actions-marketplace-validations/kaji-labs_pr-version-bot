import type { BumpType } from './labels';

const BUMP_PRIORITY: Record<Exclude<BumpType, 'none'>, number> = {
  major: 3,
  minor: 2,
  patch: 1,
};

function higher(a: Exclude<BumpType, 'none'> | null, b: Exclude<BumpType, 'none'>): Exclude<BumpType, 'none'> {
  if (a === null) return b;
  return BUMP_PRIORITY[a] >= BUMP_PRIORITY[b] ? a : b;
}

function detectFromMessage(message: string): Exclude<BumpType, 'none'> | null {
  if (/BREAKING CHANGE:/m.test(message)) return 'major';
  if (/^(\w+)(\(.+\))?!:/.test(message)) return 'major';
  if (/^feat(\(.+\))?:/.test(message)) return 'minor';
  if (/^fix(\(.+\))?:/.test(message)) return 'patch';
  return null;
}

export function detectBumpFromCommits(commitMessages: string[]): Exclude<BumpType, 'none'> | null {
  let result: Exclude<BumpType, 'none'> | null = null;

  for (const message of commitMessages) {
    const bump = detectFromMessage(message);
    if (bump !== null) {
      result = higher(result, bump);
      if (result === 'major') break;
    }
  }

  return result;
}
