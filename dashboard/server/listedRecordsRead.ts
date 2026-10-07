// Reads of the records published beside the backlog at a pinned revision,
// for the local authenticated read boundary (`./authenticatedRead.ts`): the
// agent profiles (`agents=profiles`), with the project setting file's text,
// or every done record (`done=records`), which Recently done reads only until
// it reads the records its shown entries need through the done catalog
// (`./doneCatalogRead.ts`). Each names only a pinned revision and is refused
// here before any `gh` call otherwise. Which files are read is the revision's
// listing of their directory (`./recordsBesideBacklog.ts`). Records are read
// a few at a time, each only while no earlier read has kept the blob its
// listing names (`./pinnedTexts.ts`); a failure names the record whose read
// failed (`./performedRead.ts`).

import { readingPathAt } from "../src/authenticatedReadRules.ts";
import { mapPool } from "../src/boundedPool.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { agentSettingsPath } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import type { ListedPath, PinnedTexts } from "./pinnedTexts.ts";
import type { PinnedLister } from "./reachablePaths.ts";
import {
  agentProfileDirectoryOf,
  agentSettingsTextAt,
  doneRecordDirectoryOf,
  listedAgentProfiles,
  listedDoneRecords,
} from "./recordsBesideBacklog.ts";
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
  ) => Promise<ListedPath[]>;
  // Whether each record's text is also kept under its path at the revision,
  // for later reads that ask for it by path there.
  readonly keptByPath: boolean;
  readonly refusal: string;
};

// Each listed read by the parameter and value that name it, the directory its
// records are listed in, and how it is refused when it names anything else.
// A done record read is decided first when both are named. Agent profiles are
// also kept by path: the story branch reads of the same revision read them so
// (`./branchReachability.ts`).
const listedReads: Readonly<Record<ListedRecordsRead["kind"], ListedRead>> = {
  "done-records-at": {
    parameter: "done",
    value: "records",
    directoryOf: doneRecordDirectoryOf,
    listed: listedDoneRecords,
    keptByPath: false,
    refusal: "A done record read names only a pinned revision.",
  },
  "agent-profiles-at": {
    parameter: "agents",
    value: "profiles",
    directoryOf: agentProfileDirectoryOf,
    listed: listedAgentProfiles,
    keptByPath: true,
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
  const others = [
    "path",
    "since",
    "committed",
    "file",
    ...listedReadParameters,
  ];
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

// How many listed records are read from GitHub at once.
const listedReadConcurrency = 4;

// Reads each listed file's text at the pinned revision, a few at once, each
// only while no earlier read has kept the blob its listing names, naming the
// first file whose read fails so that the failure says which. The done
// catalog's selected record reads (`./doneCatalogRead.ts`) read the same way.
export async function readListedTexts(
  pinned: PinnedTexts,
  source: PublishedSource,
  revision: string,
  listed: readonly ListedPath[],
  signal: AbortSignal,
  naming: (reading: string) => void,
  keptByPath = false,
): Promise<PinnedFile[]> {
  const readListed = pinned.blobReader(source, revision, signal);
  let failed = false;
  return mapPool(listed, listedReadConcurrency, async (record) => {
    try {
      const text = await readListed(record);
      if (keptByPath) {
        pinned.remember(source, revision, record.path, text);
      }
      return { path: record.path, text };
    } catch (error) {
      if (!failed) {
        failed = true;
        naming(readingPathAt(record.path, revision));
      }
      throw error;
    }
  });
}

// Reads every listed record at the pinned revision; a profile read also
// answers the project setting file's text, null when the revision has none.
// Every done record is read here only until Recently done asks for the
// records its shown entries need through the done catalog
// (`./doneCatalogRead.ts`).
export async function performListedRecordsRead(
  pinned: PinnedTexts,
  source: PublishedSource,
  { kind, revision }: ListedRecordsRead,
  signal: AbortSignal,
  naming: (reading: string) => void,
): Promise<Outcome> {
  const readPinned = pinned.reader(source, revision, signal);
  const { listed: listedIn, keptByPath } = listedReads[kind];
  const listed = await listedIn(
    source,
    pinned.lister(source, revision, signal),
  );
  const files = await readListedTexts(
    pinned,
    source,
    revision,
    listed,
    signal,
    naming,
    keptByPath,
  );
  if (kind === "done-records-at") {
    return answered({ revision, records: files });
  }
  naming(readingPathAt(agentSettingsPath, revision));
  const settings = await agentSettingsTextAt(readPinned);
  return answered({ revision, profiles: files, settings });
}
