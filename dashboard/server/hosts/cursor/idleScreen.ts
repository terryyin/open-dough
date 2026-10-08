// Labels for a Cursor screen the runner still holds.
import type { CursorHeldLabel } from "../../../src/cursorHeldLabel.ts";

// A screen that shows one of these is working. The follow-up prompt is the
// follow-up line with none of them and no clarifying question.
const workingScreenMarkers = ["Working", "Running", "ctrl+c to stop"] as const;

// Cursor's empty composer. Older builds say "Add a follow-up". The current
// build says "Plan, search, build anything". Either line is ready for the
// launch instruction. A hidden cursor does not withhold it.
const composerPrompts = [
  "Add a follow-up",
  "Plan, search, build anything",
] as const;

// Follow-up line present (launch may type). A working paint still includes
// that line under `ctrl+c to stop`.
export function showsFollowUpLine(screen: string): boolean {
  return (
    composerPrompts.some((prompt) => screen.includes(prompt)) &&
    !screen.includes("Clarifying Questions")
  );
}

// Idle composer only. Recovery types a continuation only on this screen, not
// while the agent is working or asking a clarifying question.
export function showsCursorComposer(screen: string): boolean {
  return showsFollowUpLine(screen) && !showsWorkingScreen(screen);
}

function showsWorkingScreen(screen: string): boolean {
  return workingScreenMarkers.some((marker) => screen.includes(marker));
}

function showsFollowUpPrompt(screen: string): boolean {
  return (
    showsCursorComposer(screen) &&
    composerPrompts.some((prompt) => screen.includes(`→ ${prompt}`))
  );
}

// The list's three labels are this same screen, not a separate catalog of
// Cursor wording. The ordinary follow-up prompt is "at the follow-up prompt".
// A working screen is "working". Any other screen still held, including a
// question or a trust prompt, is "waiting for an answer".
export function cursorSessionLabel(screen: string): CursorHeldLabel {
  if (showsFollowUpPrompt(screen)) return "at the follow-up prompt";
  if (showsWorkingScreen(screen)) return "working";
  return "waiting for an answer";
}
