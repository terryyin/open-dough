// The done stories published beside the backlog at the snapshot's revision.
// The done catalog the local boundary agreed with that revision's record
// files (`./authenticatedDoneRead.ts`) says which records there are and
// when each was completed, so Recently done can place every done story
// without reading its record; each record is read only when an entry shown
// needs it (`./doneDetails.ts`), as the shared done-record module under
// `src/skills/dough-product-backlog/scripts/` reads it, checked here for the
// fields this dashboard shows. Which records are still recent is that
// module's window too. A record the module refuses is reported by its file
// name and shows no story; a failed read is a gap, never an empty set.

import { z } from "zod";
import { agentHosts } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import type { CataloguedDoneRecord } from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-catalog.mjs";
import {
  isWithinDoneWindow,
  parseDoneRecordFile,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { readDoneCatalogAt } from "./authenticatedDoneRead.ts";
import type { PublishedSource } from "./publishedSource.ts";
import { detailGapProblem } from "./readWaitBound.ts";

const doneStory = z.object({
  identity: z.string().min(1),
  title: z.string().min(1),
  completedAt: z.iso.datetime(),
  developer: z.string().min(1).optional(),
  agent: z.string().min(1).optional(),
  host: z.enum(agentHosts).optional(),
});

const readRecord = z.discriminatedUnion("ok", [
  z.object({ ok: z.literal(true), record: doneStory }),
  z.object({ ok: z.literal(false), error: z.string().min(1) }),
]);

// One published done record's facts; the developer, agent, and host stay
// undefined when the record does not name them.
export type DoneStory = z.infer<typeof doneStory>;

// A done record as the catalog names it: its file name and the Git blob of
// its text, which the record's read is asked and kept by.
export type NamedDoneRecord = {
  readonly fileName: string;
  readonly blob: string;
};

// The done records at the snapshot's revision, as their catalog says, until
// any is read: catalogued, newest completion first, with the record files the
// catalog could not read; loading until the catalog answers; or unavailable,
// with the reason, when it could not be read or does not describe the
// published records.
export type DoneStories =
  | { readonly status: "loading" }
  | { readonly status: "unavailable"; readonly problem: string }
  | {
      readonly status: "catalogued";
      readonly records: readonly CataloguedDoneRecord[];
      readonly unreadable: readonly NamedDoneRecord[];
    };

const doneUnreadProblem = "Done stories could not be read.";

// Reads the revision's done catalog; a failed or abandoned read, one still
// unanswered at the wait bound among them, or a catalog that does not agree
// with the published records, is the column's gap, said with the reason.
export async function readDoneStories(
  source: PublishedSource,
  revision: string,
  signal: AbortSignal,
): Promise<DoneStories> {
  try {
    const catalog = await readDoneCatalogAt(source, revision, signal);
    return catalog.status === "gap"
      ? {
          status: "unavailable",
          problem: `${doneUnreadProblem} The done catalog does not describe the published done records: ${catalog.problem}.`,
        }
      : {
          status: "catalogued",
          records: catalog.records,
          unreadable: catalog.unreadable,
        };
  } catch (error) {
    return {
      status: "unavailable",
      problem: doneGapProblem(error, signal, "the done catalog"),
    };
  }
}

// What one done record's text says: its story, or why the shared reader
// refused it.
export type DoneRecordRead =
  | { readonly status: "read"; readonly story: DoneStory }
  | { readonly status: "unreadable"; readonly problem: string };

export function doneRecordOf(file: string, text: string): DoneRecordRead {
  const read = readRecord.safeParse(parseDoneRecordFile(file, text));
  if (!read.success) {
    return {
      status: "unreadable",
      problem:
        "the shared done-record reader answered in a shape this dashboard does not understand",
    };
  }
  return read.data.ok
    ? { status: "read", story: read.data.record }
    : { status: "unreadable", problem: read.data.error };
}

// Why reading the done catalog or the done records failed, as the column says
// it.
function doneGapProblem(
  error: unknown,
  signal: AbortSignal,
  reading: string,
): string {
  const why = detailGapProblem(error, signal, reading, "");
  return `${doneUnreadProblem} ${why}`.trimEnd();
}

export const doneRecordsGapProblem = (error: unknown, signal: AbortSignal) =>
  doneGapProblem(error, signal, "the done records");

// The catalogued done records still recent at `now`, by the shared window.
export function recentDoneRecords(
  done: DoneStories | undefined,
  now: Date,
): readonly CataloguedDoneRecord[] {
  return done?.status === "catalogued"
    ? done.records.filter((record) =>
        isWithinDoneWindow(record.completedAt, now),
      )
    : [];
}
