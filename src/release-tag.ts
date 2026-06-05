const STABLE_TAG_RE = /^v(\d+)\.\d+\.\d+$/;

export function extractMajorTag(tag: string): string | null {
  const m = STABLE_TAG_RE.exec(tag);
  return m ? `v${m[1]}` : null;
}
