// When a kept Cursor client has no socket, hang up only for the idle screen
// observed from cursor-agent. A working or question-waiting screen stays, and
// so does any screen that matches neither marker.

// Longest gap between working output. The idle marker must keep showing for
// this long, with no socket, before the client is hung up.
export const cursorIdleSettleMs = 203;

export function cursorDetachedIdle(screen: string): boolean {
  return idleMarker(screen) && !workingMarker(screen) && !waitingMarker(screen);
}

// A line `done`, then `→ Add a follow-up`, with no working status.
function idleMarker(screen: string): boolean {
  const lines = screen.split("\n");
  const doneAt = lines.findIndex((line) => line.trim() === "done");
  if (doneAt < 0) {
    return false;
  }
  const promptLater = lines
    .slice(doneAt + 1)
    .some((line) => line.includes("→ Add a follow-up"));
  return promptLater && !workingStatus(screen);
}

// `→ Add a follow-up` together with `ctrl+c to stop`.
function workingMarker(screen: string): boolean {
  return (
    screen.includes("→ Add a follow-up") && screen.includes("ctrl+c to stop")
  );
}

// `Clarifying Questions` with Red and Blue, and no prompt or working status.
function waitingMarker(screen: string): boolean {
  return (
    screen.includes("Clarifying Questions") &&
    screen.includes("Red") &&
    screen.includes("Blue") &&
    !screen.includes("Add a follow-up") &&
    !workingStatus(screen)
  );
}

function workingStatus(screen: string): boolean {
  return (
    screen.includes("ctrl+c to stop") ||
    screen.includes("Working") ||
    screen.includes("Running")
  );
}
