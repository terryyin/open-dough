// What the machine's sessions overview says of a retained done session
// (`../server/machineSessionsFragments.ts` lists it so): its listing facts,
// everything an entry shows of it while nothing retained is opened -- its
// key, project, story identity, title, workflow, host and model, launch and
// done times, the state facts its entry shows (session and workspace state,
// report label, notices, problems), and the start or preparation that offers
// Review changes on an active story's card. Its remaining detail -- the
// launch's reporting handoff, the first input's text, and the landing
// evidence a story review reads -- comes with the sessions history
// (`./machineSessionsRevision.ts`), read when a developer opens or acts on a
// retained session or expands Recently done sessions (`./retainedHistory.ts`).

import type { FirstInput, LaunchWithState } from "./launchRecord.ts";

// The detail only the sessions history carries, by where it sits in a
// record: `doneListing` leaves these out and `withRetainedDetail` restores
// them from the history's full record.
const historyOnlyFields = {
  record: ["landing", "landingReporting"],
  request: ["reporting"],
  firstInput: ["instruction"],
} as const satisfies {
  record: readonly (keyof LaunchWithState)[];
  request: readonly (keyof LaunchWithState["request"])[];
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

// A done session's listing facts. An open session is the overview's in full.
export function doneListing(record: LaunchWithState): LaunchWithState {
  if (record.doneAt === undefined) return record;
  return {
    ...withoutFields(record, historyOnlyFields.record),
    request: withoutFields(record.request, historyOnlyFields.request),
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
  return {
    ...listing,
    ...definedFields(full, historyOnlyFields.record),
    request: {
      ...listing.request,
      ...definedFields(full.request, historyOnlyFields.request),
    },
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
