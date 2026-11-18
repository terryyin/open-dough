// Whether another kept session of the same project worked in a session's
// checkout while that session was open, so the commits read for it
// (`./sessionCommitsCapture.ts`) may include that session's work.
import { recordedWorkspace } from "../src/establishedPlace.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import { sessionKey } from "../src/sessionReference.ts";
import { resolvedCheckout } from "./sessionCommitsCapture.ts";

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

// Whether one of the project's `kept` records, other than `record`, names
// the checkout `start` names and was open at some time from `record`'s launch
// to its Done: launched by that Done, and done no earlier than that launch
// or still open.
export function checkoutSharedMeanwhile(
  record: Pick<LaunchRecord, "launchedAt" | "doneAt" | "session">,
  start: { readonly workspace: string },
  kept: readonly LaunchRecord[],
): boolean {
  const checkout = resolvedCheckout(start.workspace);
  const from = Date.parse(record.launchedAt);
  const to =
    record.doneAt === undefined ? Date.now() : Date.parse(record.doneAt);
  return kept.some(
    (other) =>
      sessionKey(other.session) !== sessionKey(record.session) &&
      Date.parse(other.launchedAt) <= to &&
      (other.doneAt === undefined || Date.parse(other.doneAt) >= from) &&
      checkoutOf(other) === checkout,
  );
}
