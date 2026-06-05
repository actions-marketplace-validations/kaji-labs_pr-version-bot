import * as fs from 'fs';

export function updateReadmeBlock(
  content: string,
  startMarker: string,
  endMarker: string,
  repoFullName: string,
  tag: string,
  majorAlias: string
): string | null {
  const startIdx = content.indexOf(startMarker);
  const endIdx = content.indexOf(endMarker);

  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) return null;

  const before = content.slice(0, startIdx);
  const after = content.slice(endIdx + endMarker.length);

  const block = [
    startMarker,
    '',
    `[![Version](https://img.shields.io/badge/version-${tag}-orange)](https://github.com/${repoFullName}/releases)`,
    '',
    `> Current stable release: **${tag}**`,
    '',
    '**Pinned version (recommended):**',
    '',
    '```yaml',
    `- uses: ${repoFullName}@${tag}`,
    '```',
    '',
    '**Major version alias:**',
    '',
    '```yaml',
    `- uses: ${repoFullName}@${majorAlias}`,
    '```',
    '',
    endMarker,
  ].join('\n');

  return before + block + after;
}

export function extractMajorAlias(tag: string, tagPrefix: string): string {
  // v1.2.3 -> v1, v2.0.0 -> v2
  const version = tag.startsWith(tagPrefix) ? tag.slice(tagPrefix.length) : tag;
  const major = version.split('.')[0];
  return `${tagPrefix}${major}`;
}

export function applyReadmeUpdate(
  readmeFile: string,
  startMarker: string,
  endMarker: string,
  repoFullName: string,
  tag: string,
  majorAlias: string
): boolean {
  if (!fs.existsSync(readmeFile)) {
    return false;
  }
  const content = fs.readFileSync(readmeFile, 'utf8') as string;
  const updated = updateReadmeBlock(content, startMarker, endMarker, repoFullName, tag, majorAlias);
  if (updated === null) return false;
  fs.writeFileSync(readmeFile, updated, 'utf8');
  return true;
}
