// The records published beside a source's backlog that the local
// authenticated read boundary may read at a pinned revision, decided only
// from that revision's own listing of their directory. Agent profiles are
// reachable only as the profile files the listing names, and a profile's Take
// (`./ghProfileAddition.ts`) is asked only for a listed profile. Done records
// are read the same way: only as the record files their directory's listing
// names. The one project setting file the shared profile module names is
// reachable only as part of the profile read, never by a client-supplied
// path. The done catalog (`../../src/skills/dough-product-backlog/scripts/product-backlog-done-catalog.mjs`)
// sits among the done records, at the one path that module names; what it
// admits is read in `./doneCatalogRead.ts`.

import type { PublishedSource } from "../src/publishedSource.ts";
import { resolveBesideFile } from "../src/repositoryPath.ts";
import { rateLimitStop } from "./ghRead.ts";
import type { ProfileAddition } from "./ghProfileAddition.ts";
import type { ListedPath, PinnedTexts } from "./pinnedTexts.ts";
import type { PinnedLister, PinnedReader } from "./reachablePaths.ts";
import {
  agentProfileDirectory,
  agentSettingsPath,
  profileAgentName,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import {
  doneRecordDirectory,
  isDoneRecordFileName,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { doneCatalogPath } from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-catalog.mjs";

// Where a directory of published records named by the shared backlog
// modules lives for this source: beside its backlog.
function besideBacklog(source: PublishedSource, name: string): string {
  const directory = resolveBesideFile(source.backlogPath, name);
  if (directory === undefined) {
    throw new Error(`No ${name} directory beside ${source.backlogPath}`);
  }
  return directory;
}

// Where agent profiles live for this source: beside its backlog.
export function agentProfileDirectoryOf(source: PublishedSource): string {
  return besideBacklog(source, agentProfileDirectory);
}

// Where done records live for this source: beside its backlog.
export function doneRecordDirectoryOf(source: PublishedSource): string {
  return besideBacklog(source, doneRecordDirectory);
}

// Where the done catalog lives for this source: among its done records.
export function doneCatalogPathOf(source: PublishedSource): string {
  return besideBacklog(source, doneCatalogPath);
}

// Which records of a directory beside the backlog may be read at a pinned
// revision, by repository path with each one's blob sha: the listing of that
// directory at the revision decides which exist (a directory the revision
// lacks lists none), and only the files the shared module names as its
// records are read, in name order. Anything else listed is not.
async function listedBesideBacklog(
  directory: string,
  isRecordName: (name: string) => boolean,
  listPinned: PinnedLister,
): Promise<ListedPath[]> {
  return (await listPinned(directory))
    .filter(({ name }) => isRecordName(name))
    .sort(({ name: one }, { name: other }) =>
      one < other ? -1 : one > other ? 1 : 0,
    )
    .map(({ name, sha }) => ({ path: `${directory}/${name}`, sha }));
}

// The agent profiles listed beside the backlog at a pinned revision.
export function listedAgentProfiles(
  source: PublishedSource,
  listPinned: PinnedLister,
): Promise<ListedPath[]> {
  return listedBesideBacklog(
    agentProfileDirectoryOf(source),
    (name) => profileAgentName(name) !== undefined,
    listPinned,
  );
}

// The done records listed beside the backlog at a pinned revision.
export function listedDoneRecords(
  source: PublishedSource,
  listPinned: PinnedLister,
): Promise<ListedPath[]> {
  return listedBesideBacklog(
    doneRecordDirectoryOf(source),
    isDoneRecordFileName,
    listPinned,
  );
}

// Whether `requestedPath` is one of the agent profiles listed beside the
// backlog at a pinned revision. The profile directory is listed only for a
// path inside it.
async function isListedAgentProfile(
  source: PublishedSource,
  requestedPath: string,
  listPinned: PinnedLister,
): Promise<boolean> {
  if (!requestedPath.startsWith(`${agentProfileDirectoryOf(source)}/`)) {
    return false;
  }
  return (await listedAgentProfiles(source, listPinned)).some(
    ({ path }) => path === requestedPath,
  );
}

// Which commit added a profile's current allocation, asked only about a
// profile the revision's directory listing names, as when profiles themselves
// are read; undefined when it does not. The avatar read (`./avatarRead.ts`)
// finds its account the same way.
export async function listedProfileAddition(
  pinned: PinnedTexts,
  source: PublishedSource,
  { revision, path }: { readonly revision: string; readonly path: string },
  signal: AbortSignal,
): Promise<ProfileAddition | undefined> {
  const listed = await isListedAgentProfile(
    source,
    path,
    pinned.lister(source, revision, signal),
  );
  return listed
    ? await pinned.adder(source, revision, signal)(path)
    : undefined;
}

// The text of the project setting file at a pinned revision, or null when the
// revision has none or it cannot be read: either way the current collection
// is used. A read GitHub's rate limit refused or held back says nothing of
// the file, so it fails the read that wanted it, to be read again later.
export async function agentSettingsTextAt(
  readPinned: PinnedReader,
): Promise<string | null> {
  try {
    return await readPinned(agentSettingsPath);
  } catch (error) {
    if (rateLimitStop(error) !== undefined) throw error;
    return null;
  }
}
