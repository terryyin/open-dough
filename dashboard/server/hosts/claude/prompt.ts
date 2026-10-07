// Claude Code’s current composer, observed in an 80×24 native attach.
// Transcript ❯ lines and the attach banner cannot establish readiness.
// Draft text is allowed: rename clears the composer before entering its keys.
export function claudePromptReady(
  screen: string,
  cursorVisible: boolean,
): boolean {
  if (!cursorVisible) return false;
  const rows = screen.split("\n");
  const bottom = rows.findLastIndex((row) => /^─{3,}$/.test(row));
  if (bottom < 2) return false;
  const top = rows.slice(0, bottom).findLastIndex((row) => /^─{3,}/.test(row));
  return top >= 0 && /^❯\s/.test(rows[top + 1] ?? "") && top + 1 < bottom;
}
