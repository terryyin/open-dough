// Reads of the records published beside the backlog at a pinned revision,
// for the local authenticated read boundary (`./authenticatedRead.ts`): the
// agent profiles (`agents=profiles`), with the project setting file's text,
// or the done records (`done=records`). Each names only a pinned revision and
// is refused here before any `gh` call otherwise. Which files are read is the
// revision's listing of their directory (`./reachablePaths.ts`); a failure
// names the file being read when it failed (`./performedRead.ts`).

import { readingPathAt } from "../src/authenticatedReadRules.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { agentSettingsPath } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import type { PinnedTexts } from "./pinnedTexts.ts";
import {
  agentProfileDirectoryOf,
  agentSettingsTextAt,
  doneRecordDirectoryOf,
  listedAgentProfilePaths,
  listedDoneRecordPaths,
  type PinnedLister,
} from "./reachablePaths.ts";
import { answered, type Outcome, type PinnedFile } from "./readOutcome.ts";
import {
  isPinnedRevision,
  refused,
  unpinnedRevision,
  type RefusedParameters,
} from "./refusedParameters.ts";

export type ListedRecordsRead = {
  readonly kind: "agent-profiles-at" | "done-records-at";
  readonly revision: string;
};

type ListedRead = {
  readonly parameter: string;
  readonly value: string;
  readonly directoryOf: (source: PublishedSource) => string;
  readonly listed: (
    source: PublishedSource,
    listPinned: PinnedLister,
  ) => Promise<string[]>;
  readonly refusal: string;
};

// Each listed read by the parameter and value that name it, the directory its
// records are listed in, and how it is refused when it names anything else.
// A done record read is decided first when both are named.
const listedReads: Readonly<Record<ListedRecordsRead["kind"], ListedRead>> = {
  "done-records-at": {
    parameter: "done",
    value: "records",
    directoryOf: doneRecordDirectoryOf,
    listed: listedDoneRecordPaths,
    refusal: "A done record read names only a pinned revision.",
  },
  "agent-profiles-at": {
    parameter: "agents",
    value: "profiles",
    directoryOf: agentProfileDirectoryOf,
    listed: listedAgentProfilePaths,
    refusal: "An agent profile read names only a pinned revision.",
  },
};

const listedKinds = Object.keys(listedReads) as ListedRecordsRead["kind"][];

// The parameters that ask for a listed read, which every other read refuses.
export const listedReadParameters = listedKinds.map(
  (kind) => listedReads[kind].parameter,
);

// The listed read a request names, undefined when it names none.
export function parseListedRecordsRead(
  params: URLSearchParams,
): ListedRecordsRead | RefusedParameters | undefined {
  const kind = listedKinds.find(
    (each) => params.get(listedReads[each].parameter) !== null,
  );
  if (kind === undefined) return undefined;
  const named = listedReads[kind];
  const others = ["path", "since", "committed", ...listedReadParameters];
  if (
    params.get(named.parameter) !== named.value ||
    others.some((name) => name !== named.parameter && params.get(name) !== null)
  ) {
    return refused(named.refusal);
  }
  const revision = params.get("revision");
  if (!isPinnedRevision(revision)) {
    return unpinnedRevision;
  }
  return { kind, revision };
}

// What a listed read names as being read before any file is.
export function readingListedRecordsOf(
  source: PublishedSource,
  { kind, revision }: ListedRecordsRead,
): string {
  return readingPathAt(listedReads[kind].directoryOf(source), revision);
}

// Reads every listed record at the pinned revision, naming each as it is read
// so that a failure says which; a profile read also answers the project
// setting file's text, null when the revision has none.
export async function performListedRecordsRead(
  pinned: PinnedTexts,
  source: PublishedSource,
  { kind, revision }: ListedRecordsRead,
  signal: AbortSignal,
  naming: (reading: string) => void,
): Promise<Outcome> {
  const readPinned = pinned.reader(source, revision, signal);
  const listPinned = pinned.lister(source, revision, signal);
  const files: PinnedFile[] = [];
  for (const path of await listedReads[kind].listed(source, listPinned)) {
    naming(readingPathAt(path, revision));
    files.push({ path, text: await readPinned(path) });
  }
  if (kind === "done-records-at") {
    return answered({ revision, records: files });
  }
  naming(readingPathAt(agentSettingsPath, revision));
  const settings = await agentSettingsTextAt(readPinned);
  return answered({ revision, profiles: files, settings });
}
