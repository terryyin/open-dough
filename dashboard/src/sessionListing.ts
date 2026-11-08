// The machine's sessions overview lists a retained Done session by its
// listing facts (`../server/machineSessionsFragments.ts`). Reporting handoff,
// landing evidence, first input text and resolved follow-up context come with
// the history when a developer opens or acts on a retained session or expands
// Recently done sessions (`./retainedHistory.ts`). Open sessions are listed in
// full except that a follow-up lists its source without the resolved context
// or the copy in its first input text.

import type { FollowUp } from "./followUpRequest.ts";
import type { FirstInput, LaunchWithState } from "./launchRecord.ts";

// The detail a Done session's listing leaves for the history, by where it
// sits in the record.
const historyOnlyFields = {
  record: ["landing", "landingReporting"],
  request: ["reporting"],
  followUp: ["context"],
  firstInput: ["instruction"],
} as const satisfies {
  record: readonly (keyof LaunchWithState)[];
  request: readonly (keyof LaunchWithState["request"])[];
  followUp: readonly (keyof FollowUp)[];
  firstInput: readonly (keyof FirstInput)[];
};

function withoutFields<T extends object>(
  value: T,
  fields: readonly (keyof T)[],
): T {
  const leftOut: readonly PropertyKey[] = fields;
  return Object.fromEntries(
    Object.entries(value).filter(([key]) => !leftOut.includes(key)),
  ) as T;
}

function definedFields<T extends object, K extends keyof T>(
  value: T | undefined,
  fields: readonly K[],
): { [Field in K]?: T[Field] } {
  const picked: { [Field in K]?: T[Field] } = {};
  if (value === undefined) return picked;
  for (const field of fields) {
    if (value[field] !== undefined) picked[field] = value[field];
  }
  return picked;
}

export function sessionListing(record: LaunchWithState): LaunchWithState {
  const done = record.doneAt !== undefined;
  let request = done
    ? withoutFields(record.request, historyOnlyFields.request)
    : record.request;
  if (request.workflow === "ad-hoc" && request.followUp !== undefined) {
    request = {
      ...request,
      followUp: withoutFields(request.followUp, historyOnlyFields.followUp),
    };
  } else if (!done) return record;
  return {
    ...(done ? withoutFields(record, historyOnlyFields.record) : record),
    request,
    ...(record.firstInput === undefined
      ? {}
      : {
          firstInput: withoutFields(
            record.firstInput,
            historyOnlyFields.firstInput,
          ),
        }),
  };
}

// A retained session as the history read gives it in full, kept current by
// the overview's later `listing` of it: the listing's facts stand, and the
// history supplies only the detail the listing leaves out.
export function withRetainedDetail(
  listing: LaunchWithState,
  full: LaunchWithState | undefined,
): LaunchWithState {
  if (full === undefined || listing.doneAt === undefined) return listing;
  const request = {
    ...listing.request,
    ...definedFields(full.request, historyOnlyFields.request),
  };
  if (
    request.workflow === "ad-hoc" &&
    request.followUp !== undefined &&
    full.request.workflow === "ad-hoc"
  )
    request.followUp = {
      ...request.followUp,
      ...definedFields(full.request.followUp, historyOnlyFields.followUp),
    };
  return {
    ...listing,
    ...definedFields(full, historyOnlyFields.record),
    request,
    ...(listing.firstInput === undefined
      ? {}
      : {
          firstInput: {
            ...listing.firstInput,
            ...definedFields(full.firstInput, historyOnlyFields.firstInput),
          },
        }),
  };
}
