// Merge machine reads with newly launched sessions that the read may predate.
import type { LaunchWithState } from "./agentLaunch.ts";
import { sessionKey } from "./sessionReference.ts";

// The server's records replace what the page knew, except a launch recorded
// after the read was asked, which the answer may not include yet. The server
// runs on this machine, so both sides read the same clock.
export function replaced(
  kept: readonly LaunchWithState[],
  known: readonly LaunchWithState[],
  askedAt: number,
): readonly LaunchWithState[] {
  const sessions = new Set(kept.map((record) => sessionKey(record.session)));
  return [
    ...kept,
    ...known.filter(
      (record) =>
        !sessions.has(sessionKey(record.session)) &&
        Date.parse(record.launchedAt) >= askedAt,
    ),
  ];
}
