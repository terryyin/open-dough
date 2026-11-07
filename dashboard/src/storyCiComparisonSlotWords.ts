// An endpoint's requested-revision status in a story's CI comparison, as
// Intent's homepage comparison (`./IntentCiComparisonEndpoints.tsx`) and a
// Summary's comparison labels (`./IntentScopeComparisonTable.tsx`) say it:
// the status beside the build whose proof is used, or a gap's explanation.

import { shortSha } from "./baseCiWording.ts";
import type {
  RequestedRevisionCiStatus,
  StoryCiComparisonSlot,
} from "./storyCiComparison.ts";

function requestedStatusWords(status: RequestedRevisionCiStatus): string {
  return status.explanation;
}

// Prefix before the selected build's identity or short SHA when the requested
// revision is not that build (trailing space when present).
export function requestedStatusPrefix(
  slot: Pick<StoryCiComparisonSlot, "requestedStatus">,
): string {
  return slot.requestedStatus === undefined
    ? ""
    : `${requestedStatusWords(slot.requestedStatus)} `;
}

// Gap slots prefer the requested revision's status wording when present;
// otherwise the slot's own explanation (N/A, unread, or missing build).
// When both differ, keep the status and the slot's extra reason (for example
// a skipped landing whose equivalent build published no proof).
export function requestedStatusOrExplanation(
  slot: Extract<
    StoryCiComparisonSlot,
    { kind: "none" | "unavailable" | "not-applicable" | "not-landed" }
  >,
): string {
  if (slot.requestedStatus === undefined) return slot.explanation;
  const status = requestedStatusWords(slot.requestedStatus);
  if (slot.explanation === status) return status;
  return `${status} ${slot.explanation}`;
}

const requestedStatusShortWords: Record<
  RequestedRevisionCiStatus["kind"],
  string
> = { skipped: "Skipped", cancelled: "Cancelled", "no-build": "No build" };

const gapShortWords: Record<
  Extract<
    StoryCiComparisonSlot,
    { kind: "none" | "unavailable" | "not-applicable" | "not-landed" }
  >["kind"],
  string
> = {
  none: "No build",
  unavailable: "Unavailable",
  "not-applicable": "Not applicable",
  "not-landed": "Not landed yet",
};

// An endpoint's identity as a short label's words: the requested revision's
// status word, if any, before the short SHA of the build whose proof is used
// ("Skipped abc1234"), or a gap's word ("Not landed yet"), with the full
// status or explanation for its description.
export function slotShortWords(slot: StoryCiComparisonSlot): {
  readonly status: string | undefined;
  readonly revision: string | undefined;
  readonly full: string | undefined;
} {
  const status =
    slot.requestedStatus === undefined
      ? undefined
      : requestedStatusShortWords[slot.requestedStatus.kind];
  if (slot.kind === "build" || slot.kind === "running")
    return {
      status,
      revision: shortSha(slot.revision),
      full:
        slot.requestedStatus === undefined
          ? undefined
          : requestedStatusWords(slot.requestedStatus),
    };
  return {
    status: status ?? gapShortWords[slot.kind],
    revision: undefined,
    full: requestedStatusOrExplanation(slot),
  };
}
