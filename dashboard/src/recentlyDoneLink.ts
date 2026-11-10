// Whether a Recently done sessions row's story is listed in a published done
// catalog, and how an ad hoc row recovers its completed-story identity.
import { doneRecordFileName } from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import type { LaunchRecord } from "./agentLaunch.ts";
import { readPublishedSnapshot } from "./authenticatedRead.ts";
import { readCompletedStoryAssociation } from "./completedStoryAssociation.ts";
import {
  cataloguedAt,
  recentDoneRecords,
  type DoneStories,
} from "./doneStories.ts";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";

export type DoneLink = "linked" | "absent" | { readonly problem: string };

// Association result for an ad hoc row: the Done identity, a confirmed miss,
// or an unreadability problem. Distinct from DoneLink's catalog "linked".
export type AssociationAnswer =
  | "absent"
  | { readonly problem: string }
  | { readonly kind: "linked"; readonly identity: string };

// Whether the catalog lists the story, lacks it, or cannot say. `recentOnly`
// keeps the Board's default window for story launches; ad hoc association may
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

export async function readLink(
  source: PublishedSource,
  identity: string,
  signal: AbortSignal,
  recentOnly: boolean,
): Promise<DoneLink> {
  try {
    const { revision } = await readPublishedSnapshot(source, signal);
    const done = await cataloguedAt(source, revision, signal);
    return done.status === "catalogued"
      ? linkIn(done, identity, { recentOnly })
      : { problem: done.problem };
  } catch (error) {
    return { problem: error instanceof Error ? error.message : String(error) };
  }
}

export async function associatedIdentity(
  source: PublishedSource,
  record: LaunchRecord,
  signal: AbortSignal,
): Promise<AssociationAnswer> {
  try {
    const answer = await readCompletedStoryAssociation(
      source.id,
      record.session,
      signal,
    );
    if (answer.kind === "linked")
      return { kind: "linked", identity: answer.identity };
    if (answer.kind === "absent") return "absent";
    return { problem: answer.explanation };
  } catch (error) {
    return { problem: error instanceof Error ? error.message : String(error) };
  }
}
