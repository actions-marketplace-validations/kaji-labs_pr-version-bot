import { describe, it, expect } from 'vitest';
import { detectBump } from '../src/labels';

describe('detectBump', () => {
  it('returns major for release:major label', () => {
    expect(detectBump(['release:major'], 'patch', true)).toBe('major');
  });

  it('returns minor for release:minor label', () => {
    expect(detectBump(['release:minor'], 'patch', true)).toBe('minor');
  });

  it('returns patch for release:patch label', () => {
    expect(detectBump(['release:patch'], 'patch', true)).toBe('patch');
  });

  it('returns none for release:none label', () => {
    expect(detectBump(['release:none'], 'patch', true)).toBe('none');
  });

  it('returns defaultBump when no release label present', () => {
    expect(detectBump(['bug', 'enhancement'], 'minor', true)).toBe('minor');
  });

  it('returns defaultBump when labels array is empty', () => {
    expect(detectBump([], 'patch', true)).toBe('patch');
  });

  it('throws when multiple release labels found and failOnMultiple is true', () => {
    expect(() =>
      detectBump(['release:major', 'release:minor'], 'patch', true)
    ).toThrow('Multiple release labels found: release:major, release:minor');
  });

  it('returns first match when multiple release labels and failOnMultiple is false', () => {
    expect(detectBump(['release:major', 'release:minor'], 'patch', false)).toBe('major');
  });

  it('ignores non-release labels alongside a release label', () => {
    expect(detectBump(['bug', 'release:patch', 'docs'], 'minor', true)).toBe('patch');
  });
});
