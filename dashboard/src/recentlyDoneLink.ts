// Whether a Recently done sessions row's story is listed in a published done catalog.
import { doneRecordFileName } from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import type { LaunchRecord } from "./agentLaunch.ts";
import {
  cataloguedAt,
  recentDoneRecords,
  type DoneStories,
} from "./doneStories.ts";
import type { PublishedObservationReadSource } from "./publishedObservationReadSource.ts";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";

export type DoneLinkReads = Pick<
  PublishedObservationReadSource,
  "readSnapshot" | "readDoneCatalog"
>;

export type DoneLink = "linked" | "absent" | { readonly problem: string };

// Ad hoc sessions can still reopen an older published story from the sidebar.
export const doneStoryMustBeRecent = (record: LaunchRecord) =>
  record.request.workflow !== "ad-hoc";

// Whether the catalog lists the story, lacks it, or cannot say. `recentOnly`
// keeps the Board's default window for story launches. Ad hoc sessions can
// name a catalogued Done story beyond that window.
export function linkIn(
  done: Extract<DoneStories, { status: "catalogued" }>,
  identity: string,
  { recentOnly }: { readonly recentOnly: boolean },
): DoneLink {
  const listed = recentOnly
    ? recentDoneRecords(done, new Date())
    : done.records;
  if (listed.some((record) => record.identity === identity)) return "linked";
  const fileName = doneRecordFileName(identity);
  return done.unreadable.some((record) => record.fileName === fileName)
    ? { problem: `Its done record ${fileName} could not be read.` }
    : "absent";
}

// The shown project's done catalog, when it was read at the revision shown.
export function currentCatalog(
  work: PublishedWork | undefined,
  project: string,
) {
  const done = work?.done;
  return work?.source.id === project &&
    done?.status === "catalogued" &&
    done.revision === work.revision
    ? done
    : undefined;
}

// Another project's done catalog at its current published revision.
export async function catalogNow(
  reads: DoneLinkReads,
  source: PublishedSource,
  signal: AbortSignal,
) {
  const { revision } = await reads.readSnapshot(source, signal);
  return cataloguedAt(source, revision, signal, reads.readDoneCatalog);
}

export async function readLink(
  reads: DoneLinkReads,
  source: PublishedSource,
  identity: string,
  signal: AbortSignal,
  recentOnly: boolean,
): Promise<DoneLink> {
  try {
    const done = await catalogNow(reads, source, signal);
    return done.status === "catalogued"
      ? linkIn(done, identity, { recentOnly })
      : { problem: done.problem };
  } catch (error) {
    return { problem: error instanceof Error ? error.message : String(error) };
  }
}
