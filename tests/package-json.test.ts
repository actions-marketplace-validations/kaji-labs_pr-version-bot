import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';

vi.mock('fs');
vi.mock('@actions/core');

import * as core from '@actions/core';
import { readPackageJson, writePackageJson, updatePackageVersion } from '../src/package-json';

const validPackage = JSON.stringify({ name: 'my-app', version: '1.0.0', private: true });

describe('readPackageJson', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns parsed object when file exists', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(validPackage);
    const result = readPackageJson('package.json');
    expect(result).toEqual({ name: 'my-app', version: '1.0.0', private: true });
  });

  it('returns null when file does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    expect(readPackageJson('package.json')).toBeNull();
  });

  it('throws on invalid JSON', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue('not valid json {');
    expect(() => readPackageJson('package.json')).toThrow('Failed to parse package.json');
  });
});

describe('writePackageJson', () => {
  beforeEach(() => vi.clearAllMocks());

  it('writes JSON with 2-space indent and trailing newline', () => {
    vi.mocked(fs.writeFileSync).mockImplementation(() => undefined);
    writePackageJson('package.json', { name: 'my-app', version: '1.2.3' });
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      'package.json',
      JSON.stringify({ name: 'my-app', version: '1.2.3' }, null, 2) + '\n',
      'utf8'
    );
  });
});

describe('updatePackageVersion', () => {
  beforeEach(() => vi.clearAllMocks());

  it('updates version field and writes file', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(validPackage);
    vi.mocked(fs.writeFileSync).mockImplementation(() => undefined);

    const result = updatePackageVersion('package.json', '2.0.0');

    expect(result).toBe(true);
    const written = JSON.parse((vi.mocked(fs.writeFileSync).mock.calls[0][1] as string).trimEnd());
    expect(written.version).toBe('2.0.0');
    expect(written.name).toBe('my-app');
  });

  it('returns false and logs warning when file does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const result = updatePackageVersion('package.json', '2.0.0');
    expect(result).toBe(false);
    expect(fs.writeFileSync).not.toHaveBeenCalled();
    expect(core.warning).toHaveBeenCalledWith(expect.stringContaining('package.json not found'));
  });

  it('does not modify any field other than version', () => {
    const pkg = JSON.stringify({
      name: 'app',
      version: '0.1.0',
      private: true,
      scripts: { build: 'tsc' },
    });
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(pkg);
    vi.mocked(fs.writeFileSync).mockImplementation(() => undefined);

    updatePackageVersion('package.json', '1.0.0');

    const written = JSON.parse((vi.mocked(fs.writeFileSync).mock.calls[0][1] as string).trimEnd());
    expect(written.name).toBe('app');
    expect(written.private).toBe(true);
    expect(written.scripts).toEqual({ build: 'tsc' });
  });
});
