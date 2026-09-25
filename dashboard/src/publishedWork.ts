// The snapshot the dashboard shows: what one published backlog revision says,
// and the evidence of where and when it was read. What a backlog means stays
// with the shared backlog reader; story preparation facts come from the shared
// story-state reader. Nothing here parses Markdown itself.

import { z } from "zod";
import { directionOf } from "../../src/skills/dough-product-backlog/scripts/product-backlog-direction.mjs";
import {
  parseBacklog,
  queueHeading,
  takenHeading,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-document.mjs";
import type { PublishedSource } from "./publishedSource.ts";
import { enrichPreparation } from "./preparationEnrichment.ts";
import { readPublishedSnapshot } from "./authenticatedRead.ts";
import { readWaitLimitMs } from "./authenticatedReadRules.ts";
import { ReadProblem } from "./readProblem.ts";
import { withinReadWait } from "./readWaitBound.ts";
import {
  awaitingProgressSources,
  withProgressSources,
  type ProgressSource,
} from "./progressSource.ts";
import {
  awaitingSliceClocks,
  withSliceClocks,
  type SliceClock,
} from "./sliceClockStart.ts";
import { resolveSourceLink, type SourceLink } from "./sourceLink.ts";
import type { WorkPreparation } from "./storyPreparation.ts";
import type { WorkPlanSlices } from "./storyPlan.ts";
import type { WorkPurpose } from "./storyPurpose.ts";
import {
  awaitingOwners,
  readOwnership,
  withOwners,
  type TakenOwner,
  type UnreadableProfile,
} from "./takenOwner.ts";

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

export type WorkEntry = {
  readonly identity: string;
  readonly title: string;
  // Where the entry's recorded links lead at this snapshot's revision. An
  // entry records one canonical link and may record the plan it is taken with.
  readonly canonical: SourceLink;
  readonly plan?: SourceLink;
  // Navigation derived from canonical story-state; raw backlog evidence stays above.
  readonly associatedPlan?: SourceLink;
  // The repository path of the plan story-state records, resolved once beside
  // the canonical record when preparation facts are read; absent when no plan
  // is recorded or its path does not resolve inside the observed repository.
  // Trunk's and the story branch's copies of the plan are read at this path.
  readonly planPath?: string;
  // Preparation facts from the same revision. Starts as loading while
  // dependent canonical and plan files are read through the local
  // authenticated boundary.
  readonly preparation?: WorkPreparation;
  // Recorded Goal from the canonical home at this revision.
  readonly purpose?: WorkPurpose;
  // Ordered slices from the associated plan at this revision when planning
  // facts are known, or, for a Taken entry in Story Branch Mode, from that
  // plan at its recorded branch head. Absent when no plan applies; never
  // invents zero slices for an unsupported layout.
  readonly planSlices?: WorkPlanSlices;
  // Taken entries with plan slices only: where those slices were read, once
  // known.
  readonly progressSource?: ProgressSource;
  // Taken entries only: who holds the work, from the agent profile published
  // at this revision.
  readonly owner?: TakenOwner;
  // Taken entries with counted plan slices only: when the current slice
  // started, from commit times where those slices were read.
  readonly sliceClock?: SliceClock;
};

export type PublishedWork = {
  readonly source: PublishedSource;
  readonly revision: string;
  readonly retrievedAt: Date;
  // "" when the backlog records no near-future direction.
  readonly direction: string;
  readonly taken: readonly WorkEntry[];
  readonly backlog: readonly WorkEntry[];
  // Published agent profiles that could not be read; none are matched to a
  // Taken entry.
  readonly unreadableProfiles?: readonly UnreadableProfile[];
};

// Receives each more complete snapshot of one read as it becomes known.
export type PublishedWorkProgress = (work: PublishedWork) => void;

// A revision as it is said inside a sentence. The source evidence and every
// pinned link keep the whole revision.
export function shortRevision(revision: string): string {
  return revision.slice(0, 7);
}

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
// before the problem is reported.
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
      const { revision, backlog: markdown } = await readPublishedSnapshot(
        source,
        untilEither,
        knownRevision,
      );
      // Membership first, then preparation enrichment through the same
      // boundary's reachability-checked path reads at that revision.
      const work: PublishedWork = awaitingOwners({
        source,
        revision,
        retrievedAt: new Date(),
        ...interpret(markdown, revision, source, { status: "loading" }),
      });
      onPartial?.(work);
      // Owners come from the agent profiles at the same revision, read beside
      // the preparation facts.
      const [prepared, ownership] = await Promise.all([
        enrichPreparation(work, untilEither),
        readOwnership(source, revision, untilEither),
      ]);
      const owned = awaitingProgressSources(withOwners(prepared, ownership));
      signal.throwIfAborted();
      onPartial?.(awaitingSliceClocks(owned));
      // A Story Branch Mode entry's slices come from its recorded branch
      // instead, once owners say which branch that is.
      const sourced = awaitingSliceClocks(
        await withProgressSources(owned, untilEither),
      );
      signal.throwIfAborted();
      onPartial?.(sourced);
      // Each counted plan's clock starts from commit times where its slices
      // were read, once owners say which profile records the Take.
      const enriched = await withSliceClocks(sourced, untilEither);
      signal.throwIfAborted();
      // Shown even when the wait bound ended it: each detail left unread is
      // an explicit gap, and the bound is still reported as the read problem.
      onPartial?.(enriched);
      bound.throwIfAborted();
      return enriched;
    } catch (error) {
      if (bound.aborted && !signal.aborted) {
        throw new ReadProblem(
          `GitHub did not answer within ${readWaitLimitMs / 1000} seconds, so the read was given up.`,
        );
      }
      throw error;
    }
  });
}
