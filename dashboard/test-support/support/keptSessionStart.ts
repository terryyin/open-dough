// What the unattached Start session recovery specs share on a real start
// origin (./startOrigin.ts): a hold on the recorded installed start
// (./startSessionLanding.ts), so a start outlasts its wait for as long as the
// case needs, and what this machine keeps of an unattached start.

import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { StartOrigin } from "./startOrigin.ts";

// Holds every recorded start (`recordStarts`) from now on, `before` the
// installed start begins or `after` it ended with its answer not yet given,
// until released: `reached` says a start is held there.
export function holdStarts(origin: StartOrigin, when: "before" | "after") {
  const hold = path.join(origin.machine, `start-hold-${when}`);
  writeFileSync(hold, "");
  return {
    reached: () => existsSync(`${hold}-reached`),
    release: () => {
      rmSync(hold, { force: true });
    },
  };
}

// What this machine keeps of the project's unattached starts, by attempt.
export function keptSessionStarts(
  origin: StartOrigin,
  source = "open-dough",
): Record<string, Record<string, unknown>> {
  const file = path.join(
    origin.machine,
    "home/.open-dough/dashboard/session-starts.json",
  );
  if (!existsSync(file)) return {};
  const kept = JSON.parse(readFileSync(file, "utf8")) as Record<
    string,
    Record<string, Record<string, unknown>>
  >;
  return kept[source] ?? {};
}

// What an unattached start that outlasts its wait answers: it publishes
// nothing, and was kept where it goes on.
export const keptWords = (workspace: string, branch: string) =>
  `The session's start did not finish within the wait; it publishes nothing. The start was kept and goes on in workspace ${workspace} on branch ${branch}, where it can be resumed.`;

// What continuing an unattached start answers while its start still runs.
export const stillRunning =
  "This session's earlier start is still running on this machine, so it was not continued. Recheck once it ends; nothing new was started.";
