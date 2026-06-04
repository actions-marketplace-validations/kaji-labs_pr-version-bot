import * as fs from 'fs';
import * as semver from 'semver';
import type { BumpType } from './labels';

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

export function bumpVersion(current: string, bump: Exclude<BumpType, 'none'>): string {
  const next = semver.inc(current, bump);
  if (!next) throw new Error(`Failed to bump ${current} by ${bump}`);
  return next;
}

export function writeVersion(filePath: string, version: string): void {
  fs.writeFileSync(filePath, version + '\n', 'utf8');
}
