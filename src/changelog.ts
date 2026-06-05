import * as fs from 'fs';

export interface ChangelogEntry {
  version: string;
  date: string;
  prTitle: string;
  prNumber: number;
  bump: string;
  prUrl?: string;
}

export function buildEntry(entry: ChangelogEntry): string {
  const prRef = entry.prUrl ? `([#${entry.prNumber}](${entry.prUrl}))` : `(#${entry.prNumber})`;
  return `## [${entry.version}] - ${entry.date}\n\n- ${entry.bump}: ${entry.prTitle} ${prRef}\n`;
}

export function prependEntry(filePath: string, entry: ChangelogEntry): void {
  const newEntry = buildEntry(entry);
  const existing = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
  fs.writeFileSync(filePath, newEntry + '\n' + existing, 'utf8');
}
