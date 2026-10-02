// Noting that a settled launch attempt reconciled with published state, as a
// page judged it (`../src/startupReconciliation.ts`), for the launch attempt
// owner (`./launchAttemptOwner.ts`): the attempt keeps when
// (`reconciledAt`), in what this server holds of it and in this machine's
// store, so every page on this machine reads it so. An attempt this machine
// does not keep, or one that is unsettled or needs reconciliation, is
// refused, kept as it was; noting it again changes nothing.

import {
  needsReconciliation,
  type ReconciledAnswer,
} from "../src/agentLaunch.ts";
import { keepAttempt, keptAttempts } from "./launchAttemptStore.ts";
import type { OwnedAttempts } from "./ownedAttempts.ts";

// What noting an attempt reconciled is answered instead, with nothing noted.
const refused = (explanation: string): ReconciledAnswer => ({
  kind: "refused",
  explanation,
});
const unreadable = refused(
  "This machine's launch evidence could not be read, so nothing was noted.",
);
const unrecorded = refused(
  "This machine's launch evidence could not be written, so nothing was noted.",
);
const unknown = refused(
  "This machine keeps no such launch attempt for this project, so nothing was noted.",
);
const unresolved = refused(
  "This start has not settled or needs reconciliation, so it was not noted as reconciled.",
);

// Notes the project's settled attempt `id` reconciled, an attempt this server
// holds (`owned`) as it holds it, or answers why not.
export async function reconcileAttempt(
  owned: OwnedAttempts,
  sourceId: string,
  id: string,
): Promise<ReconciledAnswer> {
  const kept = await keptAttempts();
  if (kept === undefined) return unreadable;
  const found = owned.held(kept, sourceId, id);
  if (found === undefined) return unknown;
  const observed = owned.observed(found);
  if (observed.outcome === undefined || needsReconciliation(observed))
    return unresolved;
  if (found.reconciledAt !== undefined)
    return { kind: "reconciled", attempt: observed };
  const reconciled = { ...found, reconciledAt: new Date().toISOString() };
  try {
    await keepAttempt(reconciled);
  } catch {
    return unrecorded;
  }
  owned.holdAsKept(reconciled);
  return { kind: "reconciled", attempt: owned.observed(reconciled) };
}
