// Settling a story attempt whose launch is uncertain from its host's own
// evidence, when a page's Recheck asks, for the launch attempt owner
// (`./launchAttemptOwner.ts`): only an attempt `launchVerifiable` names is
// verified (`./launchVerification.ts`), one recheck of it at a time, and what
// the verification settles is noted as its outcome, in what this server
// holds of it and in this machine's store, as any outcome is. Once noted the
// attempt is no longer unresolved (`unresolvedAttempt`). An attempt that
// stays unresolved is kept as it was, the answer saying why.

import {
  launchVerifiable,
  type LaunchAttemptRecord,
  type StoryLaunchRequest,
  type VerifiedAnswer,
} from "../src/agentLaunch.ts";
import type { Verified } from "./launchVerification.ts";
import { keepAttempt, keptAttempts } from "./launchAttemptStore.ts";
import type { OwnedAttempts } from "./ownedAttempts.ts";

// What verifies a story attempt's launch from its host's own evidence.
export type LaunchVerifier = (
  attempt: LaunchAttemptRecord & { readonly request: StoryLaunchRequest },
) => Promise<Verified>;

const unresolved = (explanation: string): VerifiedAnswer => ({
  kind: "unresolved",
  explanation,
});
const unreadable = unresolved(
  "This machine's launch evidence could not be read, so nothing was rechecked.",
);
const unrecorded = unresolved(
  "This machine's launch evidence could not be written, so what the recheck found was not kept.",
);
const unknown = unresolved(
  "This machine keeps no such launch attempt for this project, so nothing was rechecked.",
);
const unverifiable = unresolved(
  "This start is not a story launch whose session alone may or may not have started, so its host was not asked.",
);
const rechecking = unresolved(
  "This start is already being rechecked. Wait for that recheck's result.",
);
const changed = unresolved(
  "This start changed while it was rechecked, so what the recheck found was not kept.",
);

// The kept or held attempt `id` of the project, as this server holds it.
async function found(
  owned: OwnedAttempts,
  sourceId: string,
  id: string,
): Promise<LaunchAttemptRecord | undefined | "unreadable"> {
  const kept = await keptAttempts();
  return kept === undefined ? "unreadable" : owned.held(kept, sourceId, id);
}

// Verifies the project's attempt `id` through `verify` and notes what it
// settles, or answers why it stays unresolved; `verifying` holds the ids
// being verified now.
export async function verifyAttempt(
  owned: OwnedAttempts,
  verifying: Set<string>,
  sourceId: string,
  id: string,
  verify: LaunchVerifier,
): Promise<VerifiedAnswer> {
  if (verifying.has(id)) return rechecking;
  verifying.add(id);
  try {
    const before = await found(owned, sourceId, id);
    if (before === "unreadable") return unreadable;
    if (before === undefined) return unknown;
    const observed = owned.observed(before);
    if (!launchVerifiable(observed)) return unverifiable;
    const verified = await verify(observed);
    if (verified.kind === "unresolved") return verified;
    // Read again: a continuation may have run it meanwhile.
    const now = await found(owned, sourceId, id);
    if (now === "unreadable") return unreadable;
    if (
      now === undefined ||
      now.settledAt !== before.settledAt ||
      owned.observed(now).owned
    )
      return changed;
    const settled = {
      ...now,
      outcome: verified,
      settledAt: new Date().toISOString(),
    };
    try {
      await keepAttempt(settled);
    } catch {
      return unrecorded;
    }
    owned.holdAsKept(settled);
    return { kind: "settled", attempt: owned.observed(settled) };
  } finally {
    verifying.delete(id);
  }
}
