// Reads one published backlog revision into the snapshot the dashboard shows
// (`./publishedWork.ts`), with the evidence of where and when it was read.
// What a backlog means stays with the shared backlog reader; story
// preparation facts come from the shared story-state reader. Nothing here
// parses Markdown itself.

import { z } from "zod";
import { directionOf } from "../../src/skills/dough-product-backlog/scripts/product-backlog-direction.mjs";
import {
  parseBacklog,
  queueHeading,
  takenHeading,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-document.mjs";
import type {
  PublishedWork,
  PublishedWorkProgress,
  WorkEntry,
} from "./publishedWork.ts";
import type { PublishedSource } from "./publishedSource.ts";
import { enrichPreparation } from "./preparationEnrichment.ts";
import { readPublishedSnapshot } from "./authenticatedRead.ts";
import { ReadProblem } from "./readProblem.ts";
import { unansweredWithinReadWait, withinReadWait } from "./readWaitBound.ts";
import {
  awaitingProgressSources,
  withProgressSources,
} from "./progressSource.ts";
import { awaitingSliceClocks, withSliceClocks } from "./sliceClockStart.ts";
import { resolveSourceLink } from "./sourceLink.ts";
import type { WorkPreparation } from "./storyPreparation.ts";
import {
  awaitingOwners,
  readAssignments,
  withAssignments,
} from "./agentAssignments.ts";
import { readAttributedAssignments } from "./assignmentAttribution.ts";
import { profileAdditionsAt } from "./authenticatedProfileRead.ts";
import { readDoneStories } from "./doneStories.ts";

// The shared reader is untyped JavaScript, so its result is checked here for
// the fields this dashboard shows rather than trusted by assertion.
const interpretedBacklog = z.object({
  entries: z.array(
    z.object({
      identity: z.string().min(1),
      title: z.string().min(1),
      list: z.enum([takenHeading, queueHeading]),
      href: z.string().min(1),
      plan: z.object({ target: z.string().min(1) }).optional(),
    }),
  ),
});
const interpretedDirection = z.string();

function interpret(
  markdown: string,
  revision: string,
  source: PublishedSource,
  preparation: WorkPreparation | undefined,
): Pick<PublishedWork, "direction" | "taken" | "backlog"> {
  let document: unknown;
  let direction: unknown;
  try {
    document = parseBacklog(markdown);
    direction = directionOf(document);
  } catch (error) {
    // The reader's refusal is quoted whole as the reader's own report: some
    // of it is advice to the tools that change a backlog, and choosing which
    // of its words to pass on would be interpreting it here.
    const reported = error instanceof Error ? error.message : String(error);
    throw new ReadProblem(
      `The published backlog could not be interpreted. The shared backlog reader reports: “${reported}” This dashboard only reads; the project’s backlog needs correcting at its source.`,
    );
  }
  const backlog = interpretedBacklog.safeParse(document);
  const recorded = interpretedDirection.safeParse(direction);
  if (!backlog.success || !recorded.success) {
    throw new ReadProblem(
      "The shared backlog reader answered in a shape this dashboard does not understand.",
    );
  }
  const entriesIn = (list: string): WorkEntry[] =>
    backlog.data.entries
      .filter((entry) => entry.list === list)
      .map(({ identity, title, href, plan }) => ({
        identity,
        title,
        canonical: resolveSourceLink(href, source, revision),
        ...(plan && {
          plan: resolveSourceLink(plan.target, source, revision),
        }),
        ...(preparation !== undefined && {
          preparation,
          purpose: { status: "loading" as const },
          planSlices: { status: "loading" as const },
        }),
      }));
  return {
    direction: recorded.data,
    taken: entriesIn(takenHeading),
    backlog: entriesIn(queueHeading),
  };
}

// Reads the source's ref afresh, or, given a revision a check already
// resolved, that exact revision: the ref is never resolved a second time.
// A read still unanswered at the shared wait bound (`readWaitLimitMs`) ends as
// a read problem, so a stalled connection leaves the person able to retry;
// nothing retries for them. When the bound ends a read after its membership
// was shown, the snapshot is finished with a gap for each detail left unread
// before the problem is reported. Each assignment's human and each Taken
// card's slice clock are later details of the same read, sharing one addition
// read per agent profile: their latency and failure, the bound included, stay
// their own.
export async function readPublishedWork(
  source: PublishedSource,
  signal: AbortSignal,
  onPartial?: PublishedWorkProgress,
  knownRevision?: string,
): Promise<PublishedWork> {
  return withinReadWait(signal, async (untilEither, bound) => {
    try {
      // Every catalog source is read through the one local authenticated
      // boundary: one resolved revision and its raw backlog text first.
      const {
        revision,
        backlog: markdown,
        askedAt,
      } = await readPublishedSnapshot(source, untilEither, knownRevision);
      // Membership first, then preparation enrichment through the same
      // boundary's reachability-checked path reads at that revision.
      const work: PublishedWork = awaitingOwners({
        source,
        revision,
        retrievedAt: new Date(),
        ...(askedAt === undefined ? {} : { refAskedAt: askedAt }),
        ...interpret(markdown, revision, source, { status: "loading" }),
        done: { status: "loading" },
      });
      onPartial?.(work);
      // Owners and preparers come from the agent profiles at the same
      // revision, read beside the preparation facts and the done records.
      const [enrichedPreparation, assignments, done] = await Promise.all([
        enrichPreparation(work, untilEither),
        readAssignments(source, revision, untilEither),
        readDoneStories(source, revision, untilEither),
      ]);
      const prepared: PublishedWork = { ...enrichedPreparation, done };
      // Each profile's addition is read once, for both its assignment's human
      // and its Take's slice clock. Each human is read while progress and
      // clocks are, and is shown as soon as its own walk ends, in whatever
      // snapshot is shown by then.
      const additionOf = profileAdditionsAt(source, revision, untilEither);
      let credited = assignments;
      let shown: PublishedWork | undefined;
      const show = (next: PublishedWork) => {
        shown = next;
        if (!signal.aborted) {
          onPartial?.(withAssignments(next, credited));
        }
      };
      const attributed = readAttributedAssignments(
        source,
        revision,
        assignments,
        additionOf,
        untilEither,
        (partial) => {
          credited = partial;
          if (shown !== undefined) {
            show(shown);
          }
        },
      );
      const owned = awaitingProgressSources(
        withAssignments(prepared, assignments),
      );
      signal.throwIfAborted();
      show(awaitingSliceClocks(owned));
      // A Story Branch Mode entry's slices come from its recorded branch
      // instead, once owners say which branch that is.
      const sourced = awaitingSliceClocks(
        await withProgressSources(owned, untilEither),
      );
      signal.throwIfAborted();
      show(sourced);
      // Only the snapshot's own reads can fail it at the wait bound; a clock
      // or human still unread then is that detail's gap.
      const snapshotUnread = bound.aborted;
      // Each clock starts from commit times where its plan's slices were read,
      // once owners name the Take's profile, and is shown as soon as its own
      // reads end. Clocks never wait for other profiles' humans.
      const clocked = await withSliceClocks(
        sourced,
        additionOf,
        untilEither,
        show,
      );
      signal.throwIfAborted();
      const enriched = withAssignments(clocked, await attributed);
      signal.throwIfAborted();
      // Shown even when the wait bound ended it: each detail left unread is
      // an explicit gap, and the bound is still reported as the read problem.
      onPartial?.(enriched);
      if (snapshotUnread) {
        bound.throwIfAborted();
      }
      return enriched;
    } catch (error) {
      if (bound.aborted && !signal.aborted) {
        throw new ReadProblem(
          `${unansweredWithinReadWait}, so the read was given up.`,
        );
      }
      throw error;
    }
  });
}
