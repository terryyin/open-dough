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
  noteSlow: (slowSince: string) => Promise<void>,
  noteWorker: (
    worker: NonNullable<LaunchAttemptRecord["worker"]>,
  ) => Promise<void>,
) => Promise<LaunchResult>;

// Keeps a change to an owned attempt, then answers it: this server never
// answers a change its store could still be writing. When the change cannot
// be written, this server still answers it while the store keeps the
// earlier, more conservative state. A failed published receipt throws after
// answering that fact from memory, so its dependent effect cannot proceed;
// a closed server writes nothing more.
async function note(
  owned: OwnedAttempts,
  id: string,
  change: Partial<LaunchAttemptRecord>,
): Promise<void> {
  const own = owned.get(id);
  if (own === undefined) return;
  const changed = { ...own.attempt, ...change };
  let recordingError: Error | undefined;
  if (!owned.closed) {
    try {
      await keepAttempt(changed);
    } catch (error) {
      recordingError =
        error instanceof Error ? error : new Error(String(error));
    }
  }
  own.attempt = changed;
  owned.changed(id);
  // A published receipt is the checkpoint for the dependent native effect.
  if (change.publication?.kind === "published" && recordingError !== undefined)
    throw recordingError;
}

// Runs an accepted attempt to its outcome and keeps it; anything the run
// throws is its uncertain outcome, never an unhandled rejection.
export async function settleAttempt(
  owned: OwnedAttempts,
  own: OwnedAttempt,
  run: AttemptRun,
): Promise<void> {
  let pending = Promise.resolve();
  const change = (fields: Partial<LaunchAttemptRecord>) => {
    const written = pending.then(() => note(owned, own.attempt.id, fields));
    pending = written.catch(() => undefined);
    return written;
  };
  let result: LaunchResult;
  try {
    result = await run(
      own,
      (publication) => change({ publication }),
      (slowSince) => change({ slowSince }),
      (worker) => change({ worker }),
    );
  } catch (error) {
    result = {
      kind: "uncertain",
      reason: "unconfirmed",
      explanation: `The launch ended unexpectedly (${new HostOperationFailure(error instanceof Error ? error.message : String(error)).message}), so a session may or may not have started. Check this machine's sessions for it.`,
    };
  }
  await change({
    worker: undefined,
    slowSince: undefined,
    outcome: attemptOutcome(result),
    settledAt: new Date().toISOString(),
  });
}
