import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';

vi.mock('fs');

import { readVersion, bumpVersion, writeVersion } from '../src/version';

describe('readVersion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reads and trims a valid semver', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue('1.2.3\n');
    expect(readVersion('VERSION.md')).toBe('1.2.3');
  });

  it('throws if the file does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    expect(() => readVersion('VERSION.md')).toThrow('File not found: VERSION.md');
  });

  it('throws if the content is not valid semver', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue('not-a-version');
    expect(() => readVersion('VERSION.md')).toThrow('Invalid semver in VERSION.md');
  });
});

describe('bumpVersion', () => {
  it('bumps patch', () => {
    expect(bumpVersion('1.0.0', 'patch')).toBe('1.0.1');
  });

  it('bumps minor', () => {
    expect(bumpVersion('1.0.0', 'minor')).toBe('1.1.0');
  });

  it('bumps major', () => {
    expect(bumpVersion('1.0.0', 'major')).toBe('2.0.0');
  });

  it('resets minor and patch on major bump', () => {
    expect(bumpVersion('1.2.3', 'major')).toBe('2.0.0');
  });

  it('resets patch on minor bump', () => {
    expect(bumpVersion('1.2.3', 'minor')).toBe('1.3.0');
  });

  it('throws if semver.inc fails', () => {
    expect(() => bumpVersion('invalid', 'patch')).toThrow('Failed to bump invalid by patch');
  });
});

describe('writeVersion', () => {
  it('writes version with trailing newline', () => {
    vi.mocked(fs.writeFileSync).mockImplementation(() => undefined);
    writeVersion('VERSION.md', '1.2.3');
    expect(fs.writeFileSync).toHaveBeenCalledWith('VERSION.md', '1.2.3\n', 'utf8');
  });
});
