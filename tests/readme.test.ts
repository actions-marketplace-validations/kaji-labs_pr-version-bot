import { describe, it, expect } from 'vitest';
import { updateReadmeBlock } from '../src/readme';

const START = '<!-- VERSIONBOT:START -->';
const END = '<!-- VERSIONBOT:END -->';

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
