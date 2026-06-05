import { describe, it, expect } from 'vitest';
import { sanitiseReleaseBranch } from '../src/release-pr';

describe('sanitiseReleaseBranch', () => {
  it('creates release/ prefixed branch name from tag', () => {
    expect(sanitiseReleaseBranch('v1.2.3')).toBe('release/v1.2.3');
  });

  it('replaces invalid characters with hyphens', () => {
    expect(sanitiseReleaseBranch('v1.2.3-rc.1')).toBe('release/v1.2.3-rc.1');
  });

  it('handles simple tags', () => {
    expect(sanitiseReleaseBranch('v2.0.0')).toBe('release/v2.0.0');
  });

  it('replaces special characters with hyphens', () => {
    const result = sanitiseReleaseBranch('v1.0.0+build.1');
    expect(result).not.toMatch(/[^a-zA-Z0-9/.-]/);
  });
});
