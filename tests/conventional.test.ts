import { describe, it, expect } from 'vitest';
import { detectBumpFromCommits } from '../src/conventional';

describe('detectBumpFromCommits', () => {
  it('returns null for empty commits array', () => {
    expect(detectBumpFromCommits([])).toBeNull();
  });

  it('returns null when no conventional commits found', () => {
    expect(detectBumpFromCommits(['chore: update deps', 'docs: fix typo'])).toBeNull();
  });

  it('returns patch for fix: prefix', () => {
    expect(detectBumpFromCommits(['fix: correct version parsing'])).toBe('patch');
  });

  it('returns patch for fix(scope): prefix', () => {
    expect(detectBumpFromCommits(['fix(labels): handle empty array'])).toBe('patch');
  });

  it('returns minor for feat: prefix', () => {
    expect(detectBumpFromCommits(['feat: add config file support'])).toBe('minor');
  });

  it('returns minor for feat(scope): prefix', () => {
    expect(detectBumpFromCommits(['feat(config): add versionbot.yml'])).toBe('minor');
  });

  it('returns major for feat! prefix', () => {
    expect(detectBumpFromCommits(['feat!: rename all inputs'])).toBe('major');
  });

  it('returns major for fix! prefix', () => {
    expect(detectBumpFromCommits(['fix!: change default bump to none'])).toBe('major');
  });

  it('returns major for feat(scope)!: scoped breaking change', () => {
    expect(detectBumpFromCommits(['feat(config)!: rename versionFile to version-file'])).toBe(
      'major'
    );
  });

  it('returns major for fix(scope)!: scoped breaking fix', () => {
    expect(detectBumpFromCommits(['fix(labels)!: change default label format'])).toBe('major');
  });

  it('returns major for BREAKING CHANGE in body', () => {
    expect(detectBumpFromCommits(['feat: new api\n\nBREAKING CHANGE: removed old input'])).toBe(
      'major'
    );
  });

  it('major wins over minor in multiple commits', () => {
    expect(detectBumpFromCommits(['feat: add thing', 'feat!: remove old api'])).toBe('major');
  });

  it('minor wins over patch in multiple commits', () => {
    expect(detectBumpFromCommits(['fix: bug fix', 'feat: new feature'])).toBe('minor');
  });

  it('patch from single fix among non-conventional commits', () => {
    expect(detectBumpFromCommits(['chore: lint', 'fix: null check', 'docs: readme'])).toBe('patch');
  });

  it('ignores chore, docs, style, test prefixes', () => {
    expect(
      detectBumpFromCommits(['chore: update', 'docs: readme', 'style: format', 'test: add tests'])
    ).toBeNull();
  });
});
