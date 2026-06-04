import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';

vi.mock('fs');

import { generateBadgeJson, writeBadgeFile } from '../src/badge';

describe('generateBadgeJson', () => {
  it('returns correct Shields.io JSON shape', () => {
    const result = generateBadgeJson('v1.2.3', 'orange');
    expect(result).toEqual({
      schemaVersion: 1,
      label: 'version',
      message: 'v1.2.3',
      color: 'orange',
    });
  });

  it('uses custom color', () => {
    expect(generateBadgeJson('v2.0.0', 'blue').color).toBe('blue');
  });

  it('uses the tag as message (includes prefix)', () => {
    expect(generateBadgeJson('v0.5.0', 'orange').message).toBe('v0.5.0');
  });
});

describe('writeBadgeFile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fs.mkdirSync).mockImplementation(() => undefined as unknown as string);
    vi.mocked(fs.writeFileSync).mockImplementation(() => undefined);
  });

  it('creates the directory before writing', () => {
    writeBadgeFile('.badges/version.json', {
      schemaVersion: 1,
      label: 'version',
      message: 'v1.0.0',
      color: 'orange',
    });
    expect(fs.mkdirSync).toHaveBeenCalledWith('.badges', { recursive: true });
  });

  it('writes valid JSON to the given path', () => {
    const badge = { schemaVersion: 1, label: 'version', message: 'v1.0.0', color: 'orange' };
    writeBadgeFile('.badges/version.json', badge);
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      '.badges/version.json',
      JSON.stringify(badge, null, 2),
      'utf8'
    );
  });

  it('handles nested paths', () => {
    writeBadgeFile('some/deep/path/badge.json', {
      schemaVersion: 1,
      label: 'version',
      message: 'v1.0.0',
      color: 'green',
    });
    expect(fs.mkdirSync).toHaveBeenCalledWith('some/deep/path', { recursive: true });
  });
});
