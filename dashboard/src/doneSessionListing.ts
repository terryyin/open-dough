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

import type { LaunchWithState } from "./launchRecord.ts";

// A done session's listing facts. An open session is the overview's in full.
export function doneListing(record: LaunchWithState): LaunchWithState {
  if (record.doneAt === undefined) return record;
  const listed = { ...record, request: { ...record.request } };
  delete listed.landing;
  delete listed.landingReporting;
  delete listed.request.reporting;
  if (record.firstInput !== undefined) {
    listed.firstInput = { ...record.firstInput };
    delete listed.firstInput.instruction;
  }
  return listed;
}

// A retained session as the history read gives it in full, kept current by
// the overview's later `listing` of it: the listing's facts stand, and the
// history supplies only the detail the listing leaves out.
export function withRetainedDetail(
  listing: LaunchWithState,
  full: LaunchWithState | undefined,
): LaunchWithState {
  if (full === undefined || listing.doneAt === undefined) return listing;
  const detail = {
    ...(full.landing === undefined ? {} : { landing: full.landing }),
    ...(full.landingReporting === undefined
      ? {}
      : { landingReporting: full.landingReporting }),
  };
  const { reporting } = full.request;
  const instruction = full.firstInput?.instruction;
  return {
    ...listing,
    ...detail,
    request: {
      ...listing.request,
      ...(reporting === undefined ? {} : { reporting }),
    },
    ...(listing.firstInput === undefined
      ? {}
      : {
          firstInput: {
            ...listing.firstInput,
            ...(instruction === undefined ? {} : { instruction }),
          },
        }),
  };
}
