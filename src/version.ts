import * as fs from 'fs';
import * as semver from 'semver';
import type { BumpType } from './labels';

export type PrereleaseChannel = 'alpha' | 'beta' | 'rc';

export function readVersion(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  const raw = (fs.readFileSync(filePath, 'utf8') as string).trim();
  if (!semver.valid(raw)) {
    throw new Error(`Invalid semver in ${filePath}: "${raw}"`);
  }
  return raw;
}

export function bumpVersion(
  current: string,
  bump: Exclude<BumpType, 'none' | 'alpha' | 'beta' | 'rc'>
): string {
  const sv = semver.parse(current);
  if (!sv) throw new Error(`Invalid semver: "${current}"`);

  // When current is a pre-release, promote to stable correctly
  if (sv.prerelease.length > 0) {
    const stableBase = `${sv.major}.${sv.minor}.${sv.patch}`;
    if (bump === 'patch') {
      // Strip pre-release suffix — patch was already applied when pre-release started
      return stableBase;
    }
    // For minor/major, bump from the stable base
    const next = semver.inc(stableBase, bump);
    if (!next) throw new Error(`Failed to bump ${stableBase} by ${bump}`);
    return next;
  }

  const next = semver.inc(current, bump);
  if (!next) throw new Error(`Failed to bump ${current} by ${bump}`);
  return next;
}

export function bumpPrerelease(current: string, channel: PrereleaseChannel): string {
  const sv = semver.parse(current);
  if (!sv) throw new Error(`Invalid semver: "${current}"`);

  const isPrerelease = sv.prerelease.length >= 2;
  const currentChannel = isPrerelease ? String(sv.prerelease[0]) : null;
  const currentN = isPrerelease ? Number(sv.prerelease[1]) : 0;

  if (currentChannel === channel) {
    // Same channel: increment the counter
    return `${sv.major}.${sv.minor}.${sv.patch}-${channel}.${currentN + 1}`;
  }

  if (isPrerelease) {
    // Different channel: keep same patch base, reset to 1
    return `${sv.major}.${sv.minor}.${sv.patch}-${channel}.1`;
  }

  // Stable version: bump patch, start prerelease at 1
  return `${sv.major}.${sv.minor}.${sv.patch + 1}-${channel}.1`;
}

export function writeVersion(filePath: string, version: string): void {
  fs.writeFileSync(filePath, version + '\n', 'utf8');
}
