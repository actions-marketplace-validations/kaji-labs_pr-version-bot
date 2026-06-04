import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';

vi.mock('fs');

import { buildEntry, prependEntry } from '../src/changelog';
import type { ChangelogEntry } from '../src/changelog';

const sampleEntry: ChangelogEntry = {
  version: '1.2.3',
  date: '2026-06-04',
  prTitle: 'Add new feature',
  prNumber: 42,
  bump: 'minor',
};

describe('buildEntry', () => {
  it('formats entry correctly', () => {
    const result = buildEntry(sampleEntry);
    expect(result).toBe('## [1.2.3] - 2026-06-04\n\n- minor: Add new feature (#42)\n');
  });

  it('handles patch bump type', () => {
    const result = buildEntry({ ...sampleEntry, bump: 'patch', version: '1.2.4' });
    expect(result).toBe('## [1.2.4] - 2026-06-04\n\n- patch: Add new feature (#42)\n');
  });

  it('includes PR number in parentheses', () => {
    expect(buildEntry(sampleEntry)).toContain('(#42)');
  });
});

describe('prependEntry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('prepends entry above existing content', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue('# Changelog\n');
    vi.mocked(fs.writeFileSync).mockImplementation(() => undefined);

    prependEntry('CHANGELOG.md', sampleEntry);

    const written = vi.mocked(fs.writeFileSync).mock.calls[0][1] as string;
    expect(written).toMatch(/^## \[1\.2\.3\]/);
    expect(written).toContain('# Changelog');
  });

  it('new entry appears before existing content', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue('# Changelog\n');
    vi.mocked(fs.writeFileSync).mockImplementation(() => undefined);

    prependEntry('CHANGELOG.md', sampleEntry);

    const written = vi.mocked(fs.writeFileSync).mock.calls[0][1] as string;
    const newEntryPos = written.indexOf('## [1.2.3]');
    const existingPos = written.indexOf('# Changelog');
    expect(newEntryPos).toBeLessThan(existingPos);
  });

  it('creates file if it does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fs.writeFileSync).mockImplementation(() => undefined);

    prependEntry('CHANGELOG.md', sampleEntry);

    const written = vi.mocked(fs.writeFileSync).mock.calls[0][1] as string;
    expect(written).toMatch(/^## \[1\.2\.3\]/);
  });

  it('writes to the correct file path', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fs.writeFileSync).mockImplementation(() => undefined);

    prependEntry('CHANGELOG.md', sampleEntry);

    expect(fs.writeFileSync).toHaveBeenCalledWith('CHANGELOG.md', expect.any(String), 'utf8');
  });
});
