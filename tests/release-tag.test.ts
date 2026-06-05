import { describe, it, expect } from 'vitest';
import { extractMajorTag } from '../src/release-tag';

describe('extractMajorTag', () => {
  it('extracts major tag from v1.2.3', () => {
    expect(extractMajorTag('v1.2.3')).toBe('v1');
  });

  it('extracts major tag from v2.0.0', () => {
    expect(extractMajorTag('v2.0.0')).toBe('v2');
  });

  it('extracts major tag from v0.10.3', () => {
    expect(extractMajorTag('v0.10.3')).toBe('v0');
  });

  it('returns null for a release candidate pre-release', () => {
    expect(extractMajorTag('v1.2.3-rc.1')).toBeNull();
  });

  it('returns null for an alpha pre-release', () => {
    expect(extractMajorTag('v1.2.3-alpha.1')).toBeNull();
  });

  it('returns null for a beta pre-release', () => {
    expect(extractMajorTag('v1.2.3-beta.2')).toBeNull();
  });

  it('returns null when the tag has no v prefix', () => {
    expect(extractMajorTag('1.2.3')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(extractMajorTag('')).toBeNull();
  });

  it('returns null for a two-part version', () => {
    expect(extractMajorTag('v1.2')).toBeNull();
  });

  it('returns null for a four-part version', () => {
    expect(extractMajorTag('v1.2.3.4')).toBeNull();
  });
});
