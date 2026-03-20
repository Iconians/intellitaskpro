/**
 * Pulls bullet / numbered lines from pasted text (bug lists, backlogs, etc.).
 * Used to steer AI and demo task generation toward one task per item.
 */
export function extractUserListItems(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const lines = trimmed
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const items: string[] = [];
  const lineItemRe = /^([•\*\-]|−|–|—|\d{1,2}[\.\)])\s*(.+)$/;

  for (const line of lines) {
    const m = line.match(lineItemRe);
    if (m?.[2]) {
      const body = m[2].trim();
      if (body) items.push(body);
    }
  }

  if (items.length >= 2) {
    return items;
  }

  // Common paste: multiple "• item" segments with few newlines
  const byBullet = trimmed
    .split(/\s*•\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);
  if (byBullet.length >= 2) {
    return byBullet;
  }

  return items;
}
