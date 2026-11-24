// Whether another kept session of the same project worked in a session's
// checkout while that session was open, so publication can record shared work.
import { recordedWorkspace } from "../src/establishedPlace.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import { sessionKey } from "../src/sessionReference.ts";
import { resolvedCheckout } from "./sessionCheckout.ts";

// The checkout a kept record names: a default launch's kept start, or the
// workspace its record saved. A record that names none, or one that is gone,
// is in no known checkout.
function checkoutOf(record: LaunchRecord): string | undefined {
  const workspace = record.defaultStart?.workspace ?? recordedWorkspace(record);
  if (workspace === undefined) return undefined;
  try {
    return resolvedCheckout(workspace);
  } catch {
    return undefined;
  }
}

// Whether `other`, a session other than `record`, names `checkout` and was
// open at some time from `record`'s launch to its Done: launched by that Done,
// and done no earlier than that launch or still open.
function openMeanwhileIn(
  record: Pick<LaunchRecord, "launchedAt" | "doneAt" | "session">,
  checkout: string,
  other: LaunchRecord,
): boolean {
  const from = Date.parse(record.launchedAt);
  const to =
    record.doneAt === undefined ? Date.now() : Date.parse(record.doneAt);
  return (
    sessionKey(other.session) !== sessionKey(record.session) &&
    Date.parse(other.launchedAt) <= to &&
    (other.doneAt === undefined || Date.parse(other.doneAt) >= from) &&
    checkoutOf(other) === checkout
  );
}

// The project's `kept` records, other than `record`, that were open in the
// checkout `record` names at some time since its launch. A record in no known
// checkout shares none.
export function sessionsSharingCheckout(
  record: LaunchRecord,
  kept: readonly LaunchRecord[],
): readonly LaunchRecord[] {
  const checkout = checkoutOf(record);
  if (checkout === undefined) return [];
  return kept.filter((other) => openMeanwhileIn(record, checkout, other));
}
