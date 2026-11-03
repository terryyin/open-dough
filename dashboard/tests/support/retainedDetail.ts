// The detail a retained done session's overview entry leaves to the sessions
// history, stated here apart from the product's own rule
// (../../src/doneSessionListing.ts) so the boundary specs check it: the
// launch's reporting handoff, the first input's text, and the landing
// evidence.

export type AnsweredEntry = Record<string, unknown> & {
  readonly session: { readonly sessionId: string };
  readonly doneAt?: string;
  request: Record<string, unknown>;
  firstInput?: Record<string, unknown>;
};

// A full entry less that detail, as the regular answer lists a done one.
export function withoutRetainedDetail(entry: AnsweredEntry): AnsweredEntry {
  const listed: AnsweredEntry = { ...entry, request: { ...entry.request } };
  delete listed["landing"];
  delete listed["landingReporting"];
  delete listed.request["reporting"];
  if (entry.firstInput !== undefined) {
    listed.firstInput = { ...entry.firstInput };
    delete listed.firstInput["instruction"];
  }
  return listed;
}
