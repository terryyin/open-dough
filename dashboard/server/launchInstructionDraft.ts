// Whether a kept Cursor screen is still holding the launch instruction as an
// unsent paste chip or as composer text, including a wrapped tail on the
// arrow line. The status footer repeats the worktree and branch, which also
// appear in a launch prompt, so a match anywhere on the screen is not the
// draft: only the last arrow line is.

export function showsPasteChip(screen: string): boolean {
  return screen.includes("Pasted text");
}

function composerLine(screen: string): string {
  const lines = screen.split(/\r?\n/u);
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    const line = lines[index];
    if (line?.includes("→")) return line;
  }
  return "";
}

function composerDraft(composer: string): string {
  const arrow = composer.lastIndexOf("→");
  if (arrow === -1) return "";
  return composer.slice(arrow + 1).trim();
}

export function showsUnsentInstruction(
  screen: string,
  instruction: string,
): boolean {
  const composer = composerLine(screen);
  if (composer === "") return false;
  const draft = composerDraft(composer);
  for (const line of instruction.split("\n")) {
    const text = line.trim();
    if (text.length < 16) continue;
    const head = text.slice(0, 48);
    const tail = text.slice(-40);
    if (composer.includes(head) || composer.includes(tail)) return true;
    if (draft.length >= 16 && text.endsWith(draft)) return true;
  }
  return false;
}
