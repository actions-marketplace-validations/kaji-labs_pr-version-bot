import * as fs from 'fs';
import * as path from 'path';

export function validateNoPaths(packages: string[]): void {
  for (const pkg of packages) {
    if (pkg === '') throw new Error('Package path must not be empty');
    const normalised = path.normalize(pkg);
    if (normalised.startsWith('..') || path.isAbsolute(normalised)) {
      throw new Error(`Package path contains path traversal: "${pkg}"`);
    }
  }
}

export function resolvePackagePaths(packages: string[], versionFile: string): string[] {
  if (packages.length === 0) return [];
  validateNoPaths(packages);
  // Guard the versionFile filename itself
  const normVF = path.normalize(versionFile);
  if (normVF.startsWith('..') || path.isAbsolute(normVF)) {
    throw new Error(`versionFile contains path traversal: "${versionFile}"`);
  }
  return packages.map((pkg) => {
    const versionPath = path.join(pkg, versionFile).replace(/\\/g, '/');
    if (fs.existsSync(versionPath) === false) {
      throw new Error(`Package VERSION file not found: ${versionPath}`);
    }
    return versionPath;
  });
}
