import type { BumpType } from './labels';
import type { LabelConfig } from './config';

export function detectBumpFromPrBody(
  body: string | null | undefined,
  labelConfig: LabelConfig,
  failOnMultiple: boolean
): BumpType | null {
  if (!body) return null;

  // Extract all checked checkbox texts
  const lines = body.split('\n');
  const checkedTexts: string[] = [];
  for (const line of lines) {
    const match = line.match(/^[*-]\s+\[x\]\s+(.+)$/i);
    if (match) checkedTexts.push(match[1].trim());
  }

  if (checkedTexts.length === 0) return null;

  // Map each configured label value to its bump type
  const labelToType: Record<string, BumpType> = {
    [labelConfig.major]: 'major',
    [labelConfig.minor]: 'minor',
    [labelConfig.patch]: 'patch',
    [labelConfig.none]: 'none',
  };
  if (labelConfig.alpha) labelToType[labelConfig.alpha] = 'alpha';
  if (labelConfig.beta) labelToType[labelConfig.beta] = 'beta';
  if (labelConfig.rc) labelToType[labelConfig.rc] = 'rc';

  // Substring match: does any checked text contain a configured label value?
  const matched: BumpType[] = [];
  for (const text of checkedTexts) {
    for (const [labelValue, bumpType] of Object.entries(labelToType)) {
      if (text.includes(labelValue)) {
        matched.push(bumpType);
        break; // one label per checkbox
      }
    }
  }

  if (matched.length === 0) return null;

  // release:none always wins
  if (matched.includes('none')) return 'none';

  if (matched.length > 1 && failOnMultiple) {
    throw new Error(`Multiple release checkboxes found: ${matched.join(', ')}`);
  }

  return matched[0];
}
