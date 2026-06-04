import * as fs from 'fs';
import * as path from 'path';

export interface BadgeJson {
  schemaVersion: 1;
  label: string;
  message: string;
  color: string;
}

export function generateBadgeJson(tag: string, color: string): BadgeJson {
  return {
    schemaVersion: 1,
    label: 'version',
    message: tag,
    color,
  };
}

export function writeBadgeFile(filePath: string, badge: BadgeJson): void {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(badge, null, 2), 'utf8');
}
