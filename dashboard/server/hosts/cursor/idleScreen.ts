// When a kept Cursor client has no socket, hang up only for the ordinary
// finished prompt: `→ Add a follow-up` with no `ctrl+c to stop`, `Working`,
// `Running`, or `Clarifying Questions`. A working screen, a question screen,
// and any other screen stay.

// Longest gap between working output. That prompt must keep showing for
// this long, with no socket, before the client is hung up.
export const cursorIdleSettleMs = 203;

export function cursorDetachedIdle(screen: string): boolean {
  return (
    screen.includes("→ Add a follow-up") &&
    !screen.includes("ctrl+c to stop") &&
    !screen.includes("Working") &&
    !screen.includes("Running") &&
    !screen.includes("Clarifying Questions")
  );
}
