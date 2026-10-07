// Reads one published backlog revision into the snapshot the dashboard shows
// (`./publishedWork.ts`). Settled question outcomes for the active observation
// (`./observationOutcomes.ts`) are recorded as each detail validates its
// answer or projects a typed gap.

import type { PublishedWork, PublishedWorkProgress } from "./publishedWork.ts";
import { interpretPublishedBacklog } from "./publishedBacklog.ts";
import type { PublishedSource } from "./publishedSource.ts";
import { enrichPreparation } from "./preparationEnrichment.ts";
import { readPublishedSnapshot } from "./authenticatedRead.ts";
import {
  trackSettledAsk,
  type ObservationOutcomes,
} from "./observationOutcomes.ts";
import { ReadProblem } from "./readProblem.ts";
import { unansweredWithinReadWait, withinReadWait } from "./readWaitBound.ts";
import {
  awaitingProgressSources,
  withProgressSources,
} from "./progressSource.ts";
import { awaitingSliceClocks, withSliceClocks } from "./sliceClockStart.ts";
import { readAssignments, type ProfilesRead } from "./agentAssignments.ts";
import { awaitingOwners, withAssignments } from "./assignmentPlacement.ts";
import { readAttributedAssignments } from "./assignmentAttribution.ts";
import { profileAdditionsAt } from "./authenticatedProfileRead.ts";
import { readDoneStories, type DoneStories } from "./doneStories.ts";

// Reads the source's ref afresh, or an already resolved revision. When the
// wait bound ends after membership, unfinished details become gaps. Humans
// and clocks share one addition read per agent profile.
export async function readPublishedWork(
  source: PublishedSource,
  signal: AbortSignal,
  outcomes: ObservationOutcomes,
  onPartial?: PublishedWorkProgress,
  knownRevision?: string,
): Promise<PublishedWork> {
  return withinReadWait(signal, async (untilEither, bound) => {
    try {
      // Every catalog source is read through the one local authenticated
      // boundary: one resolved revision and its raw backlog text first.
      const membershipQuestion =
        knownRevision === undefined
          ? { sourceId: source.id, operation: "ref" as const }
          : {
              sourceId: source.id,
              revision: knownRevision,
              operation: "backlog" as const,
              path: source.backlogPath,
            };
      const snapshot = await trackSettledAsk(
        outcomes,
        readPublishedSnapshot(source, untilEither, knownRevision),
        {
          question: membershipQuestion,
          of: (read) => ({
            kind: "answered",
            question: {
              sourceId: source.id,
              revision: read.revision,
              operation: knownRevision === undefined ? "ref" : "backlog",
              ...(knownRevision === undefined
                ? {}
                : { path: source.backlogPath }),
            },
          }),
          untilEither,
          bound,
          reading:
            knownRevision === undefined
              ? `${source.ref} of ${source.repository}`
              : source.backlogPath,
          unreadable: "Published work could not be read.",
        },
      );
      const { revision, backlog: markdown, askedAt } = snapshot;
      outcomes.pinRevision(revision);
      // Membership first, then preparation enrichment through the same
      // boundary's reachability-checked path reads at that revision.
      const work: PublishedWork = awaitingOwners({
        source,
        revision,
        retrievedAt: new Date(),
        ...(askedAt === undefined ? {} : { refAskedAt: askedAt }),
        ...interpretPublishedBacklog(markdown, revision, source),
        done: { status: "loading" },
      });
      // Each completed group updates only its own facts. Later callbacks
      // compose those facts with the current progress, never a whole snapshot
      // captured before another group answered.
      let prepared = work;
      let progress: PublishedWork | undefined;
      // What the profiles established, once they are read.
      let credited: ProfilesRead | undefined;
      let done: DoneStories = { status: "loading" };
      const assembled = (): PublishedWork => {
        // Trunk's plan facts do not establish a Taken entry's progress until
        // its profiles can say where that progress is published.
        const current = progress ?? {
          ...prepared,
          taken: prepared.taken.map((entry) =>
            entry.planSlices !== undefined &&
            entry.planSlices.status !== "absent"
              ? { ...entry, planSlices: { status: "loading" as const } }
              : entry,
          ),
        };
        return {
          ...(credited === undefined
            ? current
            : withAssignments(current, credited)),
          done,
        };
      };
      const show = () => {
        if (!signal.aborted) {
          onPartial?.(assembled());
        }
      };
      // Establish the pending observation before any detail can answer.
      show();
      // The done stories are independent of preparation and profiles; any
      // failure, the bound included, is the column's own gap.
      const doneRead = readDoneStories(
        source,
        revision,
        untilEither,
        outcomes,
        bound,
      ).then((read) => {
        done = read;
        show();
      });
      // Owners and preparers come from the agent profiles at the same
      // revision, read beside the preparation facts.
      const preparationRead = enrichPreparation(
        work,
        untilEither,
        outcomes,
        bound,
      ).then((read) => {
        prepared = read;
        show();
        return read;
      });
      const profilesRead = readAssignments(
        source,
        revision,
        untilEither,
        outcomes,
        bound,
      ).then((read) => {
        credited = read;
        show();
        return read;
      });
      // Each profile's addition is read once, for both its assignment's human
      // and its Take's slice clock. Each human is read while progress and
      // clocks are, and is shown as soon as its own walk ends, in whatever
      // snapshot is shown by then.
      const additionOf = profileAdditionsAt(
        source,
        revision,
        untilEither,
        outcomes,
        bound,
      );
      const attributed = profilesRead.then((assignments) =>
        readAttributedAssignments(
          source,
          revision,
          assignments,
          additionOf,
          untilEither,
          bound,
          (partial) => {
            credited = partial;
            show();
          },
        ),
      );
      const progressed = Promise.all([preparationRead, profilesRead]).then(
        async ([preparation, assignments]) => {
          const owned = awaitingProgressSources(
            withAssignments(preparation, assignments),
          );
          signal.throwIfAborted();
          progress = awaitingSliceClocks(owned);
          show();
          // Branch routing needs both the canonical plan and profiles.
          progress = awaitingSliceClocks(
            await withProgressSources(owned, untilEither, outcomes, bound),
          );
          signal.throwIfAborted();
          show();
          // Only core snapshot reads fail the observation at the bound;
          // clocks, humans, and done records retain their own detail gaps.
          const snapshotUnread = bound.aborted;
          progress = await withSliceClocks(
            progress,
            additionOf,
            untilEither,
            outcomes,
            bound,
            (partial) => {
              progress = partial;
              show();
            },
          );
          return snapshotUnread;
        },
      );
      const details = [
        preparationRead,
        profilesRead,
        progressed,
        attributed,
        doneRead,
      ] as const;
      try {
        const [, , snapshotUnread] = await Promise.all(details);
        signal.throwIfAborted();
        const enriched = assembled();
        // Finish every started read before the final promise establishes
        // completion, even when a bound left explicit gaps in the view.
        onPartial?.(enriched);
        if (snapshotUnread) {
          bound.throwIfAborted();
        }
        return enriched;
      } finally {
        // An abandoned or failed path still owns all its started tasks.
        await Promise.allSettled(details);
      }
    } catch (error) {
      // The browser-owned wait bound, not caller departure: eligible for
      // project-local transient recovery. Departure keeps its abort reason.
      if (bound.aborted && !signal.aborted) {
        throw new ReadProblem(
          `${unansweredWithinReadWait}, so the read was given up.`,
          undefined,
          "transient",
        );
      }
      throw error;
    }
  });
}
