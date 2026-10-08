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
import {
  gapCauseFromOutcome,
  settleAnswered,
  settleGapCause,
  shouldAsk,
  type ObservationOutcomes,
  type ReadQuestion,
} from "./observationOutcomes.ts";
import type { PublishedSource } from "./publishedSource.ts";
import {
  gapCauseOf,
  unavailableGap,
  type GapCause,
  type UnavailableGap,
} from "./readWaitBound.ts";

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
  | UnavailableGap
  | {
      readonly status: "catalogued";
      readonly records: readonly CataloguedDoneRecord[];
      readonly unreadable: readonly NamedDoneRecord[];
    };

const doneUnreadProblem = "Done stories could not be read.";

function doneCatalogQuestion(
  source: PublishedSource,
  revision: string,
): ReadQuestion {
  return {
    sourceId: source.id,
    revision,
    operation: "done-catalog",
  };
}

// What the catalog says: its records, or the gap of a catalog that does not
// describe the published records, which no read again can close.
async function cataloguedAt(
  source: PublishedSource,
  revision: string,
  signal: AbortSignal,
): Promise<DoneStories> {
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
}

// Reads the revision's done catalog; a failed or bound-interrupted read, or a
// catalog that does not agree with the published records, is the column's
// gap, said with the reason. A failed read's typed meaning is retained on the
// gap and the observation's outcome owner.
export async function readDoneStories(
  source: PublishedSource,
  revision: string,
  signal: AbortSignal,
  outcomes: ObservationOutcomes,
  bound: AbortSignal,
): Promise<DoneStories> {
  const question = doneCatalogQuestion(source, revision);
  const prior = outcomes.of(question);
  if (!shouldAsk(outcomes, question) && prior !== undefined) {
    if (prior.kind === "failed" || prior.kind === "bound") {
      const problem = `${doneUnreadProblem} ${prior.message}`.trimEnd();
      return unavailableGap(gapCauseFromOutcome(prior, problem) ?? { problem });
    }
    // Answered: the read memo answers without re-settling under the bound.
    return await cataloguedAt(source, revision, signal);
  }
  let done: DoneStories;
  try {
    done = await cataloguedAt(source, revision, signal);
  } catch (error) {
    const cause = doneGapCause(error, signal, bound, "the done catalog");
    settleGapCause(outcomes, question, cause);
    return unavailableGap(cause);
  }
  settleAnswered(outcomes, question);
  return done;
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
// it, with the typed meaning recovery keeps.
function doneGapCause(
  error: unknown,
  untilEither: AbortSignal,
  bound: AbortSignal,
  reading: string,
): GapCause {
  const cause = gapCauseOf(error, untilEither, bound, reading, "");
  return {
    ...cause,
    problem: `${doneUnreadProblem} ${cause.problem}`.trimEnd(),
  };
}

export const doneRecordsGapProblem = (
  error: unknown,
  untilEither: AbortSignal,
  bound: AbortSignal,
) => doneGapCause(error, untilEither, bound, "the done records").problem;

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
