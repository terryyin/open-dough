// When a kept Cursor client has no socket, hang up only for the ordinary
// finished prompt: `→ Add a follow-up` with none of the working-screen
// markers and no `Clarifying Questions`. A working screen, a question
// screen, and any other screen stay.
import type { CursorHeldLabel } from "../../../src/cursorHeldLabel.ts";

// Longest gap between working output. That prompt must keep showing for
// this long, with no socket, before the client is hung up.
export const cursorIdleSettleMs = 203;

// A screen that shows one of these is still working. The idle prompt is the
// follow-up line with none of them and no clarifying question.
const workingScreenMarkers = ["Working", "Running", "ctrl+c to stop"] as const;

function showsWorkingScreen(screen: string): boolean {
  return workingScreenMarkers.some((marker) => screen.includes(marker));
}

export function cursorDetachedIdle(screen: string): boolean {
  return (
    screen.includes("→ Add a follow-up") &&
    !showsWorkingScreen(screen) &&
    !screen.includes("Clarifying Questions")
  );
}

// The list's three labels are this same screen, not a separate catalog of
// Cursor wording. The ordinary follow-up prompt is "at the follow-up prompt".
// A working screen is "working". Any other screen still held, including a
// question or a trust prompt, is "waiting for an answer".
export function cursorSessionLabel(screen: string): CursorHeldLabel {
  if (cursorDetachedIdle(screen)) return "at the follow-up prompt";
  if (showsWorkingScreen(screen)) return "working";
  return "waiting for an answer";
}
