import * as fs from 'fs';
import * as core from '@actions/core';

export function readPackageJson(filePath: string): Record<string, unknown> | null {
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf8') as string;
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    throw new Error(`Failed to parse package.json at ${filePath}`);
  }
}

export function writePackageJson(filePath: string, pkg: Record<string, unknown>): void {
  fs.writeFileSync(filePath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
}

export function updatePackageVersion(filePath: string, version: string): boolean {
  const pkg = readPackageJson(filePath);
  if (pkg === null) {
    core.warning(`package.json not found at ${filePath} — skipping package.json version sync`);
    return false;
  }
  pkg['version'] = version;
  writePackageJson(filePath, pkg);
  return true;
}
