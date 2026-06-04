import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';

vi.mock('fs');

import { resolvePackagePaths, validateNoPaths } from '../src/monorepo';

describe('validateNoPaths', () => {
  it('does not throw for valid relative paths', () => {
    expect(() => validateNoPaths(['packages/api', 'packages/web'])).not.toThrow();
  });

  it('throws on path traversal attempt', () => {
    expect(() => validateNoPaths(['../secret'])).toThrow('path traversal');
  });

  it('throws on absolute path', () => {
    expect(() => validateNoPaths(['/etc/passwd'])).toThrow('path traversal');
  });

  it('throws on empty string package path', () => {
    expect(() => validateNoPaths([''])).toThrow('empty');
  });
});

describe('resolvePackagePaths', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns empty array when packages is empty', () => {
    expect(resolvePackagePaths([], 'VERSION.md')).toEqual([]);
  });

  it('returns resolved VERSION.md paths for each package', () => {
    const paths = resolvePackagePaths(['packages/api', 'packages/web'], 'VERSION.md');
    expect(paths).toEqual(['packages/api/VERSION.md', 'packages/web/VERSION.md']);
  });

  it('throws when a package VERSION.md does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    expect(() => resolvePackagePaths(['packages/missing'], 'VERSION.md')).toThrow(
      'packages/missing/VERSION.md'
    );
  });

  it('returns paths without checking existence when packages exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    const paths = resolvePackagePaths(['packages/api'], 'VERSION.md');
    expect(paths).toEqual(['packages/api/VERSION.md']);
  });
});
