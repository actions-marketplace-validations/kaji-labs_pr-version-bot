import { describe, it, expect } from 'vitest';
import { detectBumpFromPrBody } from '../src/pr-template';
import type { LabelConfig } from '../src/config';

const DEFAULT_LABELS: LabelConfig = {
  major: 'release:major',
  minor: 'release:minor',
  patch: 'release:patch',
  none: 'release:none',
};

describe('detectBumpFromPrBody', () => {
  it('detects minor from checked checkbox', () => {
    const body = '## Release type\n- [x] release:minor\n- [ ] release:patch';
    expect(detectBumpFromPrBody(body, DEFAULT_LABELS, true)).toBe('minor');
  });

  it('returns null when checkbox text has label as substring only (not exact match)', () => {
    // S-005: exact match required — "release:major bumps major version" should NOT match
    const body = '- [x] release:major bumps major version';
    expect(detectBumpFromPrBody(body, DEFAULT_LABELS, true)).toBeNull();
  });

  it('returns null when no checkbox matches', () => {
    const body = '## PR Notes\n- [x] some other checkbox\n- [ ] release:minor';
    expect(detectBumpFromPrBody(body, DEFAULT_LABELS, true)).toBeNull();
  });

  it('returns null for empty body', () => {
    expect(detectBumpFromPrBody('', DEFAULT_LABELS, true)).toBeNull();
  });

  it('returns null for null body', () => {
    expect(detectBumpFromPrBody(null, DEFAULT_LABELS, true)).toBeNull();
  });

  it('ignores unchecked boxes', () => {
    const body = '- [ ] release:major\n- [ ] release:minor\n- [x] release:patch';
    expect(detectBumpFromPrBody(body, DEFAULT_LABELS, true)).toBe('patch');
  });

  it('is case-insensitive for the [x] marker', () => {
    const body = '- [X] release:minor\n';
    expect(detectBumpFromPrBody(body, DEFAULT_LABELS, true)).toBe('minor');
  });

  it('release:none wins over other matches when multiple checked', () => {
    const body = '- [x] release:none\n- [x] release:minor';
    expect(detectBumpFromPrBody(body, DEFAULT_LABELS, false)).toBe('none');
  });

  it('throws when multiple bump checkboxes found and failOnMultiple is true', () => {
    const body = '- [x] release:major\n- [x] release:minor';
    expect(() => detectBumpFromPrBody(body, DEFAULT_LABELS, true)).toThrow(
      'Multiple release checkboxes'
    );
  });

  it('returns first match when multiple checked and failOnMultiple is false', () => {
    const body = '- [x] release:major\n- [x] release:minor';
    const result = detectBumpFromPrBody(body, DEFAULT_LABELS, false);
    expect(['major', 'minor']).toContain(result);
  });

  it('uses asterisk bullet format', () => {
    const body = '* [x] release:patch';
    expect(detectBumpFromPrBody(body, DEFAULT_LABELS, true)).toBe('patch');
  });

  it('exact match required — label embedded in longer text does not match', () => {
    // S-005: substring no longer matches
    const body = '- [x] Use release:minor for this change';
    expect(detectBumpFromPrBody(body, DEFAULT_LABELS, true)).toBeNull();
  });

  it('exact match is case-insensitive', () => {
    const body = '- [x] RELEASE:MINOR';
    expect(detectBumpFromPrBody(body, DEFAULT_LABELS, true)).toBe('minor');
  });
});
