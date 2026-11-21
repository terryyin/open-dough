// Parameter names shared by listed, Done and Intent request parsing.
// Parsing these names never loads the acquisition for the records they name.
import { publishedSessionsRead } from "../src/authenticatedReadRules.ts";
import {
  isPinnedRevision,
  refused,
  unpinnedRevision,
  type RefusedParameters,
} from "./refusedParameters.ts";

export const listedReadParameterNames = {
  agentProfiles: "agents",
  done: "done",
  intent: "intent",
  publishedSessions: publishedSessionsRead.parameter,
} as const;

export const listedReadParameters: string[] = Object.values(
  listedReadParameterNames,
);

// A listing named by one parameter's one value that names nothing else but
// a pinned revision: the revision it pins, undefined when the parameter is
// absent, and refused with its own refusal when it names anything else. The
// agent profile (`./listedRecordsRead.ts`) and published session
// (`./publishedSessionsRead.ts`) listings are admitted so.
export function parsePinnedListing(
  params: URLSearchParams,
  listing: {
    readonly parameter: string;
    readonly value: string;
    readonly refusal: string;
  },
): { readonly revision: string } | RefusedParameters | undefined {
  const named = params.get(listing.parameter);
  if (named === null) return undefined;
  const others = [
    "path",
    "since",
    "committed",
    "file",
    ...listedReadParameters,
  ];
  if (
    named !== listing.value ||
    others.some(
      (name) => name !== listing.parameter && params.get(name) !== null,
    )
  ) {
    return refused(listing.refusal);
  }
  const revision = params.get("revision");
  return isPinnedRevision(revision) ? { revision } : unpinnedRevision;
}
