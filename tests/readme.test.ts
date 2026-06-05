import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';

vi.mock('fs');

import { updateReadmeBlock, updateVersionRefs, applyReadmeUpdate } from '../src/readme';

const START = '<!-- VERSIONBOT:START -->';
const END = '<!-- VERSIONBOT:END -->';

describe('updateVersionRefs', () => {
  it('replaces all occurrences of previousTag with newTag', () => {
    const content = 'Use v1.0.0 or v1.0.0 for best results';
    expect(updateVersionRefs(content, 'v1.0.0', 'v1.1.0')).toBe(
      'Use v1.1.0 or v1.1.0 for best results'
    );
  });

  it('returns content unchanged when previousTag is empty string', () => {
    const content = 'Some content v1.0.0';
    expect(updateVersionRefs(content, '', 'v1.1.0')).toBe('Some content v1.0.0');
  });

  it('handles previousTag with special regex characters like dots', () => {
    const content = 'Use v1.2.3 in your workflow';
    expect(updateVersionRefs(content, 'v1.2.3', 'v1.3.0')).toBe('Use v1.3.0 in your workflow');
  });

  it('does not partially match a longer tag that starts with the same prefix', () => {
    const content = 'Use v1.2.3 but not v1.2.30';
    expect(updateVersionRefs(content, 'v1.2.3', 'v2.0.0')).toBe('Use v2.0.0 but not v1.2.30');
  });
});

describe('applyReadmeUpdate with previousTag', () => {
  beforeEach(() => vi.clearAllMocks());

  it('replaces old version ref outside markers when markers exist', () => {
    const readmeContent = `${START}\nold content\n${END}\n\n## Example workflow\n- uses: owner/repo@v1.0.0`;
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(readmeContent);
    vi.mocked(fs.writeFileSync).mockImplementation(() => undefined);

    const result = applyReadmeUpdate(
      'README.md',
      START,
      END,
      'owner/repo',
      'v1.1.0',
      'v1',
      'v1.0.0'
    );
    expect(result).toBe(true);
    const written = vi.mocked(fs.writeFileSync).mock.calls[0][1] as string;
    expect(written).toContain('owner/repo@v1.1.0');
    expect(written).not.toContain('owner/repo@v1.0.0');
  });

  it('returns false when readme file does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const result = applyReadmeUpdate(
      'README.md',
      START,
      END,
      'owner/repo',
      'v1.1.0',
      'v1',
      'v1.0.0'
    );
    expect(result).toBe(false);
  });

  it('updates version refs even when markers are absent', () => {
    const readmeContent = '## Example\n- uses: owner/repo@v1.0.0\n';
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(readmeContent);
    vi.mocked(fs.writeFileSync).mockImplementation(() => undefined);

    const result = applyReadmeUpdate(
      'README.md',
      START,
      END,
      'owner/repo',
      'v1.1.0',
      'v1',
      'v1.0.0'
    );
    expect(result).toBe(true);
    const written = vi.mocked(fs.writeFileSync).mock.calls[0][1] as string;
    expect(written).toContain('v1.1.0');
    expect(written).not.toContain('v1.0.0');
  });

  it('updates version ref appearing before the start marker (header badge scenario)', () => {
    const readmeContent = [
      '[![Version](https://img.shields.io/badge/version-v1.0.0-orange)](https://github.com/owner/repo/releases)',
      '',
      START,
      'old block content',
      END,
      '',
      '## Example',
      '- uses: owner/repo@v1.0.0',
    ].join('\n');

    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(readmeContent);
    vi.mocked(fs.writeFileSync).mockImplementation(() => undefined);

    const result = applyReadmeUpdate('README.md', START, END, 'owner/repo', 'v1.1.0', 'v1', 'v1.0.0');
    expect(result).toBe(true);
    const written = vi.mocked(fs.writeFileSync).mock.calls[0][1] as string;
    expect(written).toContain('version-v1.1.0-orange');
    expect(written).not.toContain('version-v1.0.0-orange');
  });
});

describe('updateReadmeBlock', () => {
  it('replaces content between markers', () => {
    const input = `# My Repo\n\n${START}\nold content\n${END}\n\nMore text`;
    const result = updateReadmeBlock(input, START, END, 'owner/repo', 'v1.2.3', 'v1');
    expect(result).toContain('v1.2.3');
    expect(result).toContain('owner/repo@v1.2.3');
    expect(result).toContain('owner/repo@v1');
    expect(result).not.toContain('old content');
    // Content outside markers unchanged
    expect(result).toContain('# My Repo');
    expect(result).toContain('More text');
  });

  it('includes static version badge in generated block', () => {
    const input = `${START}\nold\n${END}`;
    const result = updateReadmeBlock(input, START, END, 'owner/repo', 'v1.2.3', 'v1');
    expect(result).toContain('img.shields.io/badge/version-v1.2.3-orange');
    expect(result).toContain('github.com/owner/repo/releases');
  });

  it('returns null when start marker not found', () => {
    const input = `# My Repo\n\n${END}\n\nMore text`;
    expect(updateReadmeBlock(input, START, END, 'owner/repo', 'v1.2.3', 'v1')).toBeNull();
  });

  it('returns null when end marker not found', () => {
    const input = `# My Repo\n\n${START}\n\nMore text`;
    expect(updateReadmeBlock(input, START, END, 'owner/repo', 'v1.2.3', 'v1')).toBeNull();
  });

  it('returns null when neither marker found', () => {
    const input = '# My Repo\n\nSome content';
    expect(updateReadmeBlock(input, START, END, 'owner/repo', 'v1.2.3', 'v1')).toBeNull();
  });

  it('works with custom markers', () => {
    const customStart = '<!-- MYBOT:START -->';
    const customEnd = '<!-- MYBOT:END -->';
    const input = `${customStart}\nold\n${customEnd}`;
    const result = updateReadmeBlock(input, customStart, customEnd, 'owner/repo', 'v2.0.0', 'v2');
    expect(result).toContain('v2.0.0');
    expect(result).not.toContain('old');
  });

  it('preserves content before the start marker', () => {
    const before = '# Header\nsome content\n\n';
    const input = `${before}${START}\nold\n${END}`;
    const result = updateReadmeBlock(input, START, END, 'owner/repo', 'v1.0.0', 'v1');
    expect(result!.startsWith(before)).toBe(true);
  });

  it('preserves content after the end marker', () => {
    const after = '\n\n## Footer\nmore content';
    const input = `${START}\nold\n${END}${after}`;
    const result = updateReadmeBlock(input, START, END, 'owner/repo', 'v1.0.0', 'v1');
    expect(result!.endsWith(after)).toBe(true);
  });
});
