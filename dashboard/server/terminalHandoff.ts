// Whether this accept's Cursor launch should stay out of the idle rule until
// the page's terminal socket joins. Start session says it will open that
// terminal. A story launch and a launch asked over HTTP do not. The follow-up
// prompt keeps that process either way. The async launch keeps the flag
// for the accept that started it.
import { AsyncLocalStorage } from "node:async_hooks";

const handoff = new AsyncLocalStorage<boolean>();
const pending = new Set<string>();

export function withTerminalHandoff<T>(enabled: boolean, run: () => T): T {
  return handoff.run(enabled, run);
}

export function terminalHandoffRequested(): boolean {
  return handoff.getStore() === true;
}

// Captured on the accept that asked for a terminal, then read when that
// attempt's launch reaches the host. The launch itself runs after accept
// has answered.
export function rememberTerminalHandoff(
  attemptId: string,
  enabled: boolean,
): void {
  if (enabled) pending.add(attemptId);
}

export function takeTerminalHandoff(attemptId: string): boolean {
  return pending.delete(attemptId);
}
