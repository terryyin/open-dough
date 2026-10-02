// Running an attempt the launch attempt owner accepted
// (`./launchAttemptOwner.ts`) to its outcome: its publication receipt and
// outcome are noted, in what this server holds of it and in this machine's
// store, as they become known.

import type {
  LaunchAttemptRecord,
  LaunchResult,
  PublicationReceipt,
} from "../src/agentLaunch.ts";
import { HostOperationFailure } from "./hostLaunch.ts";
import { attemptOutcome, keepAttempt } from "./launchAttemptStore.ts";
import type { OwnedAttempt, OwnedAttempts } from "./ownedAttempts.ts";

// Runs an accepted attempt, noting its publication receipt once known.
export type AttemptRun = (
  own: OwnedAttempt,
  notePublication: (publication: PublicationReceipt) => Promise<void>,
) => Promise<LaunchResult>;

// Changes an owned attempt and keeps it. When the change cannot be written,
// this server still answers it while the store keeps the earlier, more
// conservative state; a closed server writes nothing more.
async function note(
  owned: OwnedAttempts,
  id: string,
  change: Partial<LaunchAttemptRecord>,
): Promise<void> {
  const own = owned.get(id);
  if (own === undefined) return;
  own.attempt = { ...own.attempt, ...change };
  if (owned.closed) return;
  try {
    await keepAttempt(own.attempt);
  } catch {
    // Answered from memory; see above.
  }
  owned.changed(id);
}

// Runs an accepted attempt to its outcome and keeps it; anything the run
// throws is its uncertain outcome, never an unhandled rejection.
export async function settleAttempt(
  owned: OwnedAttempts,
  own: OwnedAttempt,
  run: AttemptRun,
): Promise<void> {
  let result: LaunchResult;
  try {
    result = await run(own, (publication) =>
      note(owned, own.attempt.id, { publication }),
    );
  } catch (error) {
    result = {
      kind: "uncertain",
      reason: "unconfirmed",
      explanation: `The launch ended unexpectedly (${new HostOperationFailure(error instanceof Error ? error.message : String(error)).message}), so a session may or may not have started. Check this machine's sessions for it.`,
    };
  }
  await note(owned, own.attempt.id, {
    outcome: attemptOutcome(result),
    settledAt: new Date().toISOString(),
  });
}
